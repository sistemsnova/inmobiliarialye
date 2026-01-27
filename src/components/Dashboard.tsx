
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Property, Owner, Lead, PropertyStatus, Tenant } from '../types';
import { TrendingUp, Home, Users, UserPlus, DollarSign, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  properties: Property[];
  owners: Owner[];
  leads: Lead[];
  tenants: Tenant[];
}

export const Dashboard: React.FC<Props> = ({ properties, owners, leads, tenants }) => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Propiedades', value: properties.length, icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Propietarios', value: owners.length, icon: Users, color: 'text-[var(--primary-color-600)]', bg: 'bg-[var(--primary-color-100)]' },
    { label: 'Nuevos Leads', value: leads.filter(l => l.status === 'NEW').length, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Valor Cartera (ARS)', value: `$${(properties.reduce((acc, p) => acc + p.price, 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const statusData = [
    { name: 'Disponibles', value: properties.filter(p => p.status === PropertyStatus.AVAILABLE).length },
    { name: 'Reservadas', value: properties.filter(p => p.status === PropertyStatus.RESERVED).length },
    { name: 'Cerradas', value: properties.filter(p => p.status === PropertyStatus.SOLD || p.status === PropertyStatus.RENTED).length },
  ];

  const COLORS = ['var(--primary-color-600)', '#f59e0b', '#10b981']; // Primary color, Amber, Emerald

  // Contract Expiration Logic
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  const expiringSoon = tenants.filter(t => {
    if (!t.contractEnd) return false;
    const end = new Date(t.contractEnd);
    return end >= today && end <= nextMonth;
  });

  const expired = tenants.filter(t => {
    if (!t.contractEnd) return false;
    const end = new Date(t.contractEnd);
    return end < today;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
          <p className="text-slate-500">Bienvenido de nuevo, aquí tienes el resumen de hoy en Pesos Argentinos.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color-600)] text-white rounded-lg hover:bg-[var(--primary-color-700)] transition-shadow shadow-sm font-medium">
          <TrendingUp size={18} />
          Reporte de Mercado
        </button>
      </div>

      {/* Alertas de Vencimiento */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden animate-in slide-in-from-top-4">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" />
              Alertas de Contratos
            </h3>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Atención Requerida</span>
          </div>
          <div className="p-2">
             {expired.map(t => (
               <div key={t.id} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl mb-2 last:mb-0 border border-red-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name} <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded ml-2 uppercase">Vencido</span></p>
                      <p className="text-xs text-slate-500">Contrato venció el: {t.contractEnd}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/tenants')} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
               </div>
             ))}
             {expiringSoon.map(t => (
               <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl mb-2 last:mb-0 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-all">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} /> Vence en menos de un mes ({t.contractEnd})
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/tenants')} className="p-2 hover:bg-amber-100 rounded-full text-amber-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución de Propiedades</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="var(--primary-color-600)" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Estado de Inventario</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {statusData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-slate-600">{d.name}</span>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
