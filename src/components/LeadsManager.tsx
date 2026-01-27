
import React, { useState } from 'react';
import { Lead } from '../types';
import { UserPlus, Filter, Mail, Phone, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  leads: Lead[];
  onAdd: (lead: Lead) => void;
}

export const LeadsManager: React.FC<Props> = ({ leads, onAdd }) => {
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'CONTACTED'>('ALL');

  const filtered = leads.filter(l => filter === 'ALL' || l.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'CONTACTED': return 'bg-amber-100 text-amber-700';
      case 'NEGOTIATION': return 'bg-purple-100 text-purple-700';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Leads & Clientes Potenciales</h2>
          <p className="text-slate-500">Haz seguimiento a tus prospectos y cierra más ventas.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md font-semibold">
          <UserPlus size={20} />
          Nuevo Lead
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 w-fit rounded-xl">
        {['ALL', 'NEW', 'CONTACTED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'ALL' ? 'Todos' : f === 'NEW' ? 'Nuevos' : 'Contactados'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(lead => (
          <div key={lead.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-[var(--primary-color-200)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[var(--primary-color-50)] group-hover:text-[var(--primary-color-600)] transition-colors">
                <UserPlus size={24} />
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-lg mb-1">{lead.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
              <Calendar size={12} /> Interesado en {lead.interest === 'BUY' ? 'Compra' : 'Alquiler'}
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                   <Mail size={14} className="opacity-60" />
                </div>
                {lead.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Phone size={14} className="opacity-60" />
                </div>
                {lead.phone}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                Ver Perfil
              </button>
              <button className="px-3 py-2 bg-[var(--primary-color-50)] text-[var(--primary-color-600)] rounded-lg hover:bg-[var(--primary-color-600)] hover:text-white transition-all">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
