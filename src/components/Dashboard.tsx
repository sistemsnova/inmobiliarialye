import React from 'react';
import { 
  TrendingUp, Home, Users, UserPlus, 
  DollarSign, AlertTriangle, Calendar, ChevronRight,
  ArrowUpRight, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Property, Owner, Lead, Tenant, PropertyStatus } from '../types';

// Datos de ejemplo para el gráfico de rendimiento mensual
const data = [
  { name: 'Ene', valor: 4000 },
  { name: 'Feb', valor: 3000 },
  { name: 'Mar', valor: 5000 },
  { name: 'Abr', valor: 4500 },
  { name: 'May', valor: 6000 },
];

interface DashboardProps {
  properties: Property[];
  owners: Owner[];
  leads: Lead[];
  tenants: Tenant[];
}

const Dashboard: React.FC<DashboardProps> = ({ properties, owners, leads, tenants }) => {
  
  // Cálculos rápidos para las tarjetas
  const totalProperties = properties.length;
  const activeTenants = tenants.length;
  const totalLeads = leads.length;
  const rentedCount = properties.filter(p => p.status === PropertyStatus.RENTED).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Dashboard General</h1>
        <p className="text-slate-500 font-medium">Resumen operativo de Sistems Nova en tiempo real.</p>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Propiedades" value={totalProperties} icon={<Home />} color="text-blue-600" bg="bg-blue-50" trend="+3 este mes" />
        <StatCard title="Inquilinos" value={activeTenants} icon={<Users />} color="text-purple-600" bg="bg-purple-50" trend="Activos" />
        <StatCard title="Oportunidades" value={totalLeads} icon={<TrendingUp />} color="text-green-600" bg="bg-green-50" trend="+12% de conversión" />
        <StatCard title="Alquiladas" value={rentedCount} icon={<Activity />} color="text-orange-600" bg="bg-orange-50" trend={`${Math.round((rentedCount/totalProperties)*100) || 0}% de ocupación`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRÁFICO PRINCIPAL: Aquí está la corrección técnica */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-600" /> Rendimiento de la Cartera
            </h3>
            <span className="flex items-center gap-1 text-green-500 font-black text-[10px] bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <ArrowUpRight size={12} /> +24.5% Anual
            </span>
          </div>
          
          {/* ✅ SOLUCIÓN AL ERROR DE WIDTH/HEIGHT: DIV con altura fija h-[400px] */}
          <div className="h-[400px] w-full min-h-[300px]"> 
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#ea580c" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALERTAS Y TAREAS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-black uppercase tracking-widest text-[10px] text-orange-500 mb-6 flex items-center gap-2">
                  <AlertTriangle size={14} /> Alertas Críticas
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-xs font-medium text-slate-300">3 Contratos vencen este mes</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <p className="text-xs font-medium text-slate-300">Liquidación de servicios pendiente</p>
                   </div>
                </div>
                <button className="w-full mt-8 py-4 bg-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-900/40 hover:bg-orange-500 transition-all">
                  Ver todas las tareas
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente pequeño para las tarjetas (KPIs)
const StatCard = ({ title, value, icon, color, bg, trend }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:scale-[1.02]">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{trend}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
