import React, { useState } from 'react';
import { Tenant, Property, Owner, PropertyStatus, CompanyConfig, UtilityBill } from '../types';
import { Plus, Search, Mail, Phone, Calendar, User, CreditCard, X, Key, Home, UserCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import TenantProfile from './TenantProfile';

interface Props {
  tenants: Tenant[];
  properties: Property[];
  owners: Owner[];
  onAdd: (tenant: Tenant, propertyId?: string) => void;
  onDelete: (id: string) => void;
  onUpdateTenant: (tenantId: string, updatedFields: Partial<Tenant>) => void; // New prop
  config: CompanyConfig; // New prop
  onUpdateBillStatus: (billId: string, newStatus: UtilityBill['status'], receiptData?: {paymentMethod: string, paymentDate: string, receiptId: string}) => void; // New prop
  // Add onAddBill to TenantsManager props
  onAddBill: (bill: UtilityBill) => void;
}

const TenantsManager: React.FC<Props> = ({ tenants, properties, owners, onAdd, onDelete, onUpdateTenant, config, onUpdateBillStatus, onAddBill }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    name: '',
    dni: '',
    email: '',
    phone: '',
    rentAmount: 0,
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: ''
  });

  const allBills = JSON.parse(localStorage.getItem('crm_bills') || '[]');
  const availableProperties = properties.filter(p => p.status === PropertyStatus.AVAILABLE);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.dni.includes(searchTerm)
  );

  const isExpiringSoon = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const end = new Date(dateStr);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const end = new Date(dateStr);
    return end < today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = Date.now().toString();
    onAdd({ ...newTenant as Tenant, id: tenantId }, selectedPropId);
    setShowModal(false);
    setNewTenant({ name: '', dni: '', email: '', phone: '', rentAmount: 0, contractStart: new Date().toISOString().split('T')[0], contractEnd: '' });
    setSelectedPropId('');
  };

  const getOwnerName = (propId: string) => {
    const prop = properties.find(p => p.id === propId);
    if (!prop) return '';
    return owners.find(o => o.id === prop.ownerId)?.name || 'Desconocido';
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  if (selectedTenant) {
    return (
      <TenantProfile 
        tenant={selectedTenant}
        properties={properties}
        owners={owners}
        bills={allBills}
        onBack={() => setSelectedTenantId(null)}
        onUpdateTenant={onUpdateTenant} // Pass the new prop here
        config={config} // Pass company config
        onUpdateBillStatus={onUpdateBillStatus} // Pass updateBillStatus
        // Pass the onAddBill function to TenantProfile
        onAddBill={onAddBill}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo de Inquilinos</h2>
          <p className="text-slate-500">Gestión de alquileres en pesos argentinos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md font-semibold"
        >
          <Plus size={20} /> Registrar Inquilino
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o DNI..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(tenant => {
          const property = properties.find(p => p.tenantId === tenant.id);
          const owner = property ? owners.find(o => o.id === property.ownerId) : null;
          const expiring = isExpiringSoon(tenant.contractEnd);
          const expired = isExpired(tenant.contractEnd);
          
          return (
            <div 
              key={tenant.id} 
              onClick={() => setSelectedTenantId(tenant.id)}
              className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all group cursor-pointer relative ${
                expired ? 'border-red-200' : expiring ? 'border-amber-200' : 'border-slate-100'
              }`}
            >
              {expired && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <AlertTriangle size={10} /> CONTRATO VENCIDO
                </div>
              )}
              {expiring && !expired && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <AlertTriangle size={10} /> VENCE PRÓXIMAMENTE
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform ${
                  expired ? 'bg-red-50 text-red-600' : expiring ? 'bg-amber-50 text-amber-600' : 'bg-[var(--primary-color-50)] text-[var(--primary-color-600)]'
                }`}>
                  {tenant.name.charAt(0)}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">DNI</span>
                  <span className="text-sm font-bold text-slate-700">{tenant.dni}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-[var(--primary-color-600)] transition-colors">{tenant.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="pt-3 border-t border-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--primary-color-600)] font-bold">
                    <Home size={14} /> {property ? property.title : 'Sin propiedad'}
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${expired ? 'text-red-500' : expiring ? 'text-amber-600' : 'text-slate-400'}`}>
                    <Calendar size={12} /> Vence: {tenant.contractEnd || 'Indefinido'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 bg-slate-50 -mx-6 px-6 py-4 rounded-b-3xl">
                <div className="text-xs">
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Mensualidad</span>
                  <span className="text-slate-800 font-bold text-lg">{formatCurrency(tenant.rentAmount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink size={18} className="text-slate-300 group-hover:text-[var(--primary-color-600)] transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Añadir Inquilino / Cliente</h3>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Monto Alquiler Mensual (ARS $)</label>
                  <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={newTenant.rentAmount} onChange={e => setNewTenant({...newTenant, rentAmount: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">DNI (Para Acceso)</label>
                  <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={newTenant.dni} onChange={e => setNewTenant({...newTenant, dni: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Asociar a Propiedad</label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none appearance-none bg-no-repeat bg-[right_1rem_center] text-sm"
                    value={selectedPropId}
                    onChange={e => setSelectedPropId(e.target.value)}
                  >
                    <option value="">Seleccionar propiedad...</option>
                    {availableProperties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Inicio Contrato</label>
                  <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={newTenant.contractStart} onChange={e => setNewTenant({...newTenant, contractStart: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Vencimiento Contrato</label>
                  <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={newTenant.contractEnd} onChange={e => setNewTenant({...newTenant, contractEnd: e.target.value})} />
                </div>
              </div>
              <button className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl mt-4 shadow-lg">Registrar Contrato en Pesos</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsManager;