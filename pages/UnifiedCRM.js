
import React, { useState, useRef } from 'react';
import { PropertyStatus } from '../types.js';
import RentalForm from '../components/RentalForm.js';

const UnifiedCRM = ({
  rentals,
  setRentals,
  tenants,
  setTenants,
  properties,
  setProperties,
  leads,
  setLeads,
  cashBoxes,
  onAddTransaction,
  companyName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  
  const [isRentalFormOpen, setIsRentalFormOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  const [lastPayment, setLastPayment] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    concept: 'Pago Alquiler',
    cashBoxId: cashBoxes[0]?.id || '',
    method: 'Efectivo',
    selectedChargeIds: []
  });

  const getTenantData = (id) => tenants.find(t => t.id === id) || { name: 'Desconocido', dni: 'N/A', phone: '', email: '', electricityContract: '', waterContract: '', gasContract: '' };
  
  const filteredRentals = rentals.filter(r => {
    const t = getTenantData(r.tenantId);
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedRental = rentals.find(r => r.id === selectedId);

  const getPendingAmountByService = (type) => {
    if (!selectedRental || !selectedRental.charges) return 0;
    return selectedRental.charges
      .filter(c => c.type === type && c.status === 'Pendiente')
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const handleSaveRental = (rentalData, tenantData) => {
    const isActuallyNewTenant = !tenants.some(t => t.id === tenantData.id);

    if (isActuallyNewTenant) {
      setTenants([tenantData, ...tenants]);
    }

    const newRental = {
      id: `R-${Math.random().toString(36).substr(2, 5)}`,
      propertyId: rentalData.propertyId,
      tenantId: tenantData.id,
      monthlyRent: rentalData.monthlyRent || 0,
      startDate: rentalData.startDate || '',
      endDate: rentalData.endDate || '',
      debt: 0,
      meters: { electricity: 0, water: 0, gas: 0, lastUpdated: new Date().toISOString().split('T')[0] },
      payments: [],
      charges: []
    };

    setRentals([newRental, ...rentals]);

    setProperties(properties.map(p => 
      p.id === newRental.propertyId ? { ...p, status: PropertyStatus.RENTED } : p
    ));

    setIsRentalFormOpen(false);
    setSelectedId(newRental.id);
  };

  const handleWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola ${name}, te contacto de la inmobiliaria ${companyName} por novedades sobre tu alquiler.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleRegisterPayment = () => {
    if (!selectedRental) return;
    const txId = `TX-${Math.random().toString(36).substr(2, 5)}`;
    const newPayment = {
      id: `P-${Math.random().toString(36).substr(2, 5)}`,
      date: paymentForm.date,
      amount: paymentForm.amount,
      concept: paymentForm.concept,
      status: 'Pagado',
      method: paymentForm.method,
      transactionId: txId,
      linkedChargeIds: paymentForm.selectedChargeIds
    };

    const updatedRentals = rentals.map(r => {
      if (r.id === selectedRental.id) {
        return {
          ...r,
          payments: [newPayment, ...r.payments],
          debt: Math.max(0, r.debt - newPayment.amount)
        };
      }
      return r;
    });
    setRentals(updatedRentals);
    onAddTransaction({
      id: txId, date: paymentForm.date, amount: paymentForm.amount, type: 'Ingreso',
      concept: paymentForm.concept, cashBoxId: paymentForm.cashBoxId, category: 'Alquileres', referenceId: selectedRental.id
    });
    setLastPayment(newPayment);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inquilinos y Contratos</h2>
          <p className="text-slate-500 mt-1 font-medium">Gestión integral de residentes y arrendamientos activos.</p>
        </div>
        <button 
          onClick={() => setIsRentalFormOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          + Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold tracking-widest">🔍</span>
            <input 
              type="text" 
              placeholder="Nombre o DNI del inquilino..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-