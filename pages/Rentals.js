
import React, { useState } from 'react';
import { PropertyStatus } from '../types.js';

const Rentals = ({ 
  rentals, 
  setRentals, 
  tenants,
  properties,
  cashBoxes = [], 
  onAddTransaction,
  companyName = 'CloudEstate Pro'
}) => {
  const [selectedRentalId, setSelectedRentalId] = useState(rentals[0]?.id || null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    concept: 'Alquiler',
    status: 'Pagado',
    cashBoxId: cashBoxes[0]?.id || '',
    method: 'Efectivo'
  });

  const [newContractForm, setNewContractForm] = useState({
    propertyId: '',
    tenantId: '',
    monthlyRent: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const selectedRental = rentals.find(r => r.id === selectedRentalId);
  
  const getTenantData = (id) => tenants.find(t => t.id === id) || { name: 'Desconocido', dni: 'N/A' };
  const getPropertyData = (id) => properties.find(p => p.id === id) || { title: 'Propiedad Desconocida', address: 'N/A' };


  const filteredRentals = rentals.filter(rental => {
    const tenant = getTenantData(rental.tenantId);
    const searchLower = searchTerm.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(searchLower) ||
      tenant.dni.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenPaymentModal = () => {
    if (!selectedRental) return;
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      amount: selectedRental.monthlyRent,
      concept: 'Alquiler',
      status: 'Pagado',
      cashBoxId: cashBoxes[0]?.id || '',
      method: 'Efectivo'
    });
    setIsPaymentModalOpen(true);
  };

  const handleRegisterPayment = () => {
    if (!selectedRentalId || !selectedRental) return;

    const txId = `TX-${Math.random().toString(36).substr(2, 5)}`;
    const newPayment = {
      id: `P-${Math.random().toString(36).substr(2, 5)}`,
      date: paymentForm.date,
      amount: paymentForm.amount,
      concept: paymentForm.concept,
      status: 'Pagado',
      method: paymentForm.method,
      transactionId: txId
    };

    const updatedRentals = rentals.map(r => {
      if (r.id === selectedRentalId) {
        return {
          ...r,
          payments: [newPayment, ...r.payments],
          debt: Math.max(0, r.debt - (paymentForm.status === 'Pagado' ? newPayment.amount : 0))
        };
      }
      return r;
    });
    setRentals(updatedRentals);

    if (paymentForm.status === 'Pagado' && onAddTransaction) {
      const tenant = getTenantData(selectedRental.tenantId);
      onAddTransaction({
        id: txId,
        date: paymentForm.date,
        amount: paymentForm.amount,
        type: 'Ingreso',
        concept: `Cobro ${paymentForm.concept} - ${tenant.name}`,
        cashBoxId: paymentForm.cashBoxId,
        category: 'Alquileres',
        referenceId: selectedRentalId
      });
    }

    setLastPayment(newPayment);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleSaveNewContract = () => {
    if (!newContractForm.propertyId || !newContractForm.tenantId || !newContractForm.monthlyRent) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const newRental = {
      id: `R-${Math.random().toString(36).substr(2, 5)}`,
      propertyId: newContractForm.propertyId,
      tenantId: newContractForm.tenantId,
      monthlyRent: Number(newContractForm.monthlyRent),
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate || 'Sin definir',
      debt: 0,
      meters: { electricity: 0, water: 0, gas: 0, lastUpdated: new Date().toISOString().split('T')[0] },
      payments: [],
      charges: []
    };

    const updatedRentals = [newRental, ...rentals];
    setRentals(updatedRentals);
    setSelectedRentalId(newRental.id);
    setIsNewContractModalOpen(false);
    
    setNewContractForm({
      propertyId: '',
      tenantId: '',
      monthlyRent: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administración de Alquileres</h2>
          <p className="text-slate-500 mt-1 font-medium">Cobros garantizados con trazabilidad financiera.</p>
        </div>
        <button 
          onClick={() => setIsNewContractModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
        >
          + Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="px-2 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cartera de Inquilinos</h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por cliente o DNI..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRentals.length > 0 ? (
              filteredRentals.map(rental => {
                const tenant = getTenantData(rental.tenantId);
                return (
                  <button
                    key={rental.id}
                    onClick={() => setSelectedRentalId(rental.id)}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                      selectedRentalId === rental.id
                        ? 'bg-white border-blue-500 shadow-xl ring-1 ring-blue-500'
                        : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-black text-slate-800 line-clamp-1">{tenant.name}</p>
                      <span className="text-[9px] font-bold text-slate-300 uppercase font-mono">{tenant.dni}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm font-black text-blue-600">${rental.monthlyRent.toLocaleString()}</span>
                      {rental.debt > 0 && (
                        <span className="bg-red-50 text-red-600 text-[10px] px-3 py-1 rounded-full font-black">
                          DEUDA: ${rental.debt.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {selectedRental ? (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquilino Seleccionado</h4>
                  <p className="text-2xl font-black text-slate-900">{getTenantData(selectedRental.tenantId).name}</p>
                </div>
                <button 
                  onClick={handleOpenPaymentModal}
                  className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-green-700 shadow-xl shadow-green-200 transition-all flex items-center gap-2"
                >
                  💵 Cobrar Cuota
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimiento del Contrato</p>
                  <p className="text-lg font-black text-slate-800">{selectedRental.endDate}</p>
                </div>
                <div className={`p-6 rounded-[2rem] border ${selectedRental.debt > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Cuenta</p>
                  <p className={`text-lg font-black ${selectedRental.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedRental.debt > 0 ? `DEUDA: $${selectedRental.debt.toLocaleString()}` : 'AL DÍA'}
                  </p>
                </div>
              </div>

              <h5 className="font-black text-slate-800 mb-6">Últimos Pagos Registrados</h5>
              <div className="space-y-4">
                {selectedRental.payments.length === 0 ? (
                  <p className="text-slate-400 italic text-sm py-4">No hay pagos registrados aún.</p>
                ) : (
                  selectedRental.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${p.status === 'Pagado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {p.status === 'Pagado' ? '✓' : '!'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{p.concept}</p>
                          <p className="text-[10px] text-slate-400">{p.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="font-black text-slate-800">${p.amount.toLocaleString()}</p>
                        <button 
                          onClick={() => { setLastPayment(p); setIsReceiptModalOpen(true); }}
                          className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          Recibo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
               <span className="text-4xl mb-4 block">🏠</span>
               <p className="text-slate-400 font-bold uppercase text-xs">Selecciona un inquilino para operar</p>
            </div>
          )}
        </div>
      </div>

      {isNewContractModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800">Nuevo Contrato de Alquiler</h3>
              <button onClick={() => setIsNewContractModalOpen(false)} className="text-slate-400 text-xl hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Propiedad</label>
                <select 
                  value={newContractForm.propertyId}
                  onChange={e => setNewContractForm({...newContractForm, propertyId: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                >
                  <option value="">Selecciona una propiedad...</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.title} ({prop.status})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Inquilino (Locatario)</label>
                <select 
                  value={newContractForm.tenantId}
                  onChange={e => setNewContractForm({...newContractForm, tenantId: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                >
                  <option value="">Selecciona un inquilino...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name} - {tenant.dni}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Monto Alquiler Mensual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">$</span>
                  <input 
                    type="number" 
                    value={newContractForm.monthlyRent}
                    onChange={e => setNewContractForm({...newContractForm, monthlyRent: Number(e.target.value)})}
                    className="w-full p-4 pl-10 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fecha Inicio</label>
                  <input 
                    type="date" 
                    value={newContractForm.startDate}
                    onChange={e => setNewContractForm({...newContractForm, startDate: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fecha Fin</label>
                  <input 
                    type="date" 
                    value={newContractForm.endDate}
                    onChange={e => setNewContractForm({...newContractForm, endDate: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
              <button onClick={() => setIsNewContractModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
              <button onClick={handleSaveNewContract} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-[10px] tracking-widest">Crear Contrato</button>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800">Registrar Cobro</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Destino del Dinero (Caja)</label>
                <select 
                  value={paymentForm.cashBoxId}
                  onChange={e => setPaymentForm({...paymentForm, cashBoxId: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                >
                  {cashBoxes.map(box => <option key={box.id} value={box.id}>{box.name} (Saldo: ${box.balance.toLocaleString()})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Concepto</label>
                  <select 
                    value={paymentForm.concept}
                    onChange={e => setPaymentForm({...paymentForm, concept: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  >
                    <option value="Alquiler">Alquiler Mensual</option>
                    <option value="Luz">Luz / Energía</option>
                    <option value="Agua">Agua Corriente</option>
                    <option value="Otros">Gastos Varios</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Método</label>
                  <select 
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Monto a Cobrar</label>
                <input 
                  type="number" 
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-4xl"
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
              <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
              <button onClick={handleRegisterPayment} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-[10px] tracking-widest">Confirmar y Emitir Recibo</button>
            </div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && lastPayment && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center relative overflow-hidden">
               <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-green-200">✓</div>
               <h3 className="text-3xl font-black text-slate-900 mb-1">Cobro Exitoso</h3>
               <div className="mt-12 space-y-4 text-left border-y border-slate-100 py-8">
                  <div className="flex justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recibo Nº</span>
                    <span className="text-xs font-black text-slate-800">{lastPayment.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-black text-slate-800 uppercase tracking-widest">Total Pagado</span>
                    <span className="text-2xl font-black text-blue-600">${lastPayment.amount.toLocaleString()}</span>
                  </div>
               </div>
               <button onClick={() => setIsReceiptModalOpen(false)} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Listo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;