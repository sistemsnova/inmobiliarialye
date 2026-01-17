
import React, { useState } from 'react';
import { LeadStatus } from '../types.js';
import { MOCK_RENTALS, MOCK_TENANTS } from '../constants.js';
import LeadForm from '../components/LeadForm.js';

const Leads = ({ leads, setLeads, allProperties, allRentals = MOCK_RENTALS, allTenants = MOCK_TENANTS }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(undefined);
  const [viewingLead, setViewingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (leadData) => {
    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...leadData } : l));
    } else {
      const newLead = {
        id: `L-${Math.random().toString(36).substr(2, 5)}`,
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        dni: leadData.dni || '',
        status: leadData.status || LeadStatus.NEW,
        interestedIn: leadData.interestedIn || '',
        budget: leadData.budget || 0,
        source: leadData.source || 'Web',
        notes: leadData.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLeads([newLead, ...leads]);
    }
    setIsModalOpen(false);
    setEditingLead(undefined);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case LeadStatus.NEW: return 'bg-blue-50 text-blue-600 border-blue-100';
      case LeadStatus.CONTACTED: return 'bg-purple-50 text-purple-600 border-purple-100';
      case LeadStatus.VIEWING: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case LeadStatus.NEGOTIATION: return 'bg-orange-50 text-orange-600 border-orange-100';
      case LeadStatus.CLOSED: return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLinkedContractData = (lead) => {
    if (!lead.dni) return null;
    const tenant = allTenants.find(t => t.dni === lead.dni);
    if (!tenant) return null;
    return allRentals.find(r => r.tenantId === tenant.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Clientes & CRM</h2>
          <p className="text-slate-500 mt-1 font-medium">Historial completo, embudo de ventas y contratos activos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Nombre, Email o DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none w-72 transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingLead(undefined); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Información del Cliente</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Interés / Situación</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">DNI / ID</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Estado CRM</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map(lead => {
                const linkedProp = allProperties.find(p => p.id === lead.interestedIn);
                const hasContract = getLinkedContractData(lead);
                
                return (
                  <tr key={lead.id} className="group hover:bg-slate-50/30 transition-all duration-200 cursor-pointer" onClick={() => { setViewingLead(lead); setIsDetailOpen(true); }}>
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${hasContract ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-inner`}>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base">{lead.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      {hasContract ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📜</span>
                          <div>
                            <p className="text-sm font-black text-slate-700">Contrato Activo</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Residente en propiedad</p>
                          </div>
                        </div>
                      ) : linkedProp ? (
                        <div>
                          <p className="text-sm font-bold text-slate-700 line-clamp-1">{linkedProp.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Interesado / Prospecto</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Sin interés registrado</span>
                      )}
                    </td>
                    <td className="p-8">
                      <span className="text-sm font-bold text-slate-500 font-mono">{lead.dni || 'N/A'}</span>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingLead(lead); setIsDetailOpen(true); }}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                          title="Ver Ficha Completa"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingLead(lead); setIsModalOpen(true); }}
                          className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                          title="Editar Datos"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && viewingLead && (() => {
        const linkedContract = getLinkedContractData(viewingLead);
        const linkedProp = allProperties.find(p => p.id === (linkedContract?.propertyId || viewingLead.interestedIn));
        
        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-200">
                    {viewingLead.name[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{viewingLead.name}</h3>
                    <div className="flex gap-3 mt-2">
                      <span className="bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{viewingLead.dni}</span>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(viewingLead.status)}`}>{viewingLead.status}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Columna Contacto */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Canales de Contacto</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xl">📞</span>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</p>
                          <p className="font-bold text-slate-800">{viewingLead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xl">✉️</span>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                          <p className="font-bold text-slate-800">{viewingLead.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Notas de Seguimiento</h4>
                    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 italic text-slate-600 text-sm leading-relaxed">
                      "{viewingLead.notes || 'Sin notas adicionales para este cliente.'}"
                    </div>
                  </div>
                </div>

                {/* Columna Propiedad y Contrato */}
                <div className="space-y-8">
                  {linkedProp ? (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        {linkedContract ? 'Propiedad Arrendada' : 'Propiedad de Interés'}
                      </h4>
                      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm group">
                        <div className="h-32 overflow-hidden relative">
                          <img src={linkedProp.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          <div className="absolute inset-0 bg-slate-900/20"></div>
                        </div>
                        <div className="p-6">
                          <h5 className="font-black text-slate-800 leading-tight">{linkedProp.title}</h5>
                          <p className="text-xs text-slate-500 mt-1">{linkedProp.address}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                      No hay propiedad vinculada actualmente.
                    </div>
                  )}

                  {linkedContract ? (
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Contrato Vigente</h4>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black">ACTIVO</span>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Desde</p>
                          <p className="font-black text-lg">{linkedContract.startDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Vence el</p>
                          <p className="font-black text-lg text-amber-300">{linkedContract.endDate}</p>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-blue-100">Costo Alquiler</span>
                          <span className="text-2xl font-black">${linkedContract.monthlyRent.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs">
                             <span className="text-blue-100">Expensas/Impuestos</span>
                             <span className="font-bold">Incluidos</span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-blue-100">Servicios (Luz/Agua)</span>
                             <span className="font-bold">Segun Medidor</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Situación Comercial</h4>
                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Presupuesto Estimado</span>
                            <span className="text-xl font-black">${viewingLead.budget.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Canal de Entrada</span>
                            <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-lg">{viewingLead.source}</span>
                         </div>
                         <button className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                           Generar Propuesta de Contrato
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isModalOpen && (
        <LeadForm 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          initialData={editingLead}
          allProperties={allProperties}
        />
      )}
    </div>
  );
};

export default Leads;