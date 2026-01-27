
import React, { useState } from 'react';
import { Owner, Property, UtilityBill } from '../types';
import { Plus, Mail, Phone, Home, Search, MoreVertical, X, ExternalLink, CreditCard, Fingerprint } from 'lucide-react';
import { OwnerProfile } from './OwnerProfile';

interface Props {
  owners: Owner[];
  properties: Property[];
  bills: UtilityBill[];
  onAdd: (owner: Owner) => void;
  onUpdateBillStatus: (billId: string, newStatus: UtilityBill['status']) => void; 
  onUpdateOwner: (ownerId: string, updatedFields: Partial<Owner>) => void; // Added prop
}

export const OwnerList: React.FC<Props> = ({ owners, properties, bills, onAdd, onUpdateBillStatus, onUpdateOwner }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState({ name: '', email: '', phone: '', dni: '', paymentAlias: '' });

  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.dni.includes(searchTerm) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...newOwner, id: Date.now().toString() });
    setShowModal(false);
    setNewOwner({ name: '', email: '', phone: '', dni: '', paymentAlias: '' });
  };

  const selectedOwner = owners.find(o => o.id === selectedOwnerId);

  if (selectedOwner) {
    return (
      <OwnerProfile 
        owner={selectedOwner} 
        properties={properties} 
        bills={bills} 
        onBack={() => setSelectedOwnerId(null)} 
        onUpdateBillStatus={onUpdateBillStatus} 
        onUpdateOwner={onUpdateOwner} // Pass the new prop here
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio de Propietarios</h2>
          <p className="text-slate-500">Gestión de contactos, DNI para acceso y alias de cobro.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md font-semibold"
        >
          <Plus size={20} />
          Añadir Propietario
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o email..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color-600)] outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Propietario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">DNI Acceso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOwners.length > 0 ? filteredOwners.map(owner => {
                const ownerProps = properties.filter(p => p.ownerId === owner.id);
                return (
                  <tr key={owner.id} className="hover:bg-[var(--primary-color-50)] transition-colors group cursor-pointer" onClick={() => setSelectedOwnerId(owner.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-color-50)] flex items-center justify-center text-[var(--primary-color-600)] font-bold group-hover:bg-[var(--primary-color-600)] group-hover:text-white transition-colors">
                          {owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{owner.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{owner.paymentAlias || 'Alias no config.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                       {owner.dni}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Mail size={12} /> {owner.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Phone size={12} /> {owner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOwnerId(owner.id); }}
                        className="flex items-center gap-2 ml-auto text-[var(--primary-color-600)] text-xs font-bold hover:bg-[var(--primary-color-50)] px-3 py-2 rounded-lg transition-all"
                      >
                        Perfil & Saldos
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No hay resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Nuevo Propietario</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                    <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={newOwner.name} onChange={e => setNewOwner({ ...newOwner, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Fingerprint size={12} /> DNI (Login Portal)</label>
                    <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={newOwner.dni} onChange={e => setNewOwner({ ...newOwner, dni: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><CreditCard size={12} /> Alias de Cobro</label>
                    <input className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" placeholder="PARA ALQUILERES" value={newOwner.paymentAlias} onChange={e => setNewOwner({ ...newOwner, paymentAlias: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input required type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={newOwner.email} onChange={e => setNewOwner({ ...newOwner, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono (WhatsApp)</label>
                    <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={newOwner.phone} onChange={e => setNewOwner({ ...newOwner, phone: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md mt-4">Guardar Registro</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
