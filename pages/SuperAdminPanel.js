
import React from 'react';

const SuperAdminPanel = ({ settings, onUpdateSettings }) => {
  const toggleModule = (module) => {
    onUpdateSettings({
      ...settings,
      [module]: !settings[module]
    });
  };

  const modules = [
    { id: 'dashboard', label: 'Tablero Estadístico', icon: '📊', desc: 'Gráficos y métricas generales' },
    { id: 'properties', label: 'Gestión de Propiedades', icon: '🏠', desc: 'Inventario y publicación' },
    { id: 'rentals', label: 'Módulo Alquileres', icon: '🔑', desc: 'Contratos y cobros recurrentes' },
    { id: 'leads', label: 'CRM & Clientes', icon: '👥', desc: 'Embudo de ventas y leads' },
    { id: 'tasks', label: 'Agenda & Tareas', icon: '✅', desc: 'Gestión de actividades de equipo' },
    { id: 'finances', label: 'Cajas & Finanzas', icon: '💰', desc: 'Control de dinero y transacciones' },
    { id: 'users', label: 'Recursos Humanos', icon: '👤', desc: 'Gestión de empleados y sueldos' },
    { id: 'aiStudio', label: 'Laboratorio IA', icon: '✨', desc: 'Asistente Gemini Pro' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <span className="text-9xl">🛡️</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4">Control Maestro de Licencia</h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Como Creador del Sistema, tienes el poder de habilitar o deshabilitar módulos específicos. 
            Los cambios afectan a todos los usuarios de esta instancia de inmediato.
          </p>
          <div className="mt-8 flex items-center gap-4">
             <span className="px-4 py-2 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest">Estado: Modo Desarrollador</span>
             <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID de Cliente: CLOUD-774-ESTATE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id} 
            className={`p-8 rounded-[2.5rem] border transition-all flex items-center justify-between ${
              settings[mod.id] 
                ? 'bg-white border-slate-100 shadow-sm' 
                : 'bg-slate-50 border-slate-200 grayscale opacity-70'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                settings[mod.id] ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'
              }`}>
                {mod.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">{mod.label}</h4>
                <p className="text-sm text-slate-500">{mod.desc}</p>
              </div>
            </div>

            <button 
              onClick={() => toggleModule(mod.id)}
              className={`relative w-16 h-8 rounded-full transition-all flex items-center px-1 ${
                settings[mod.id] ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                settings[mod.id] ? 'translate-x-8' : 'translate-x-0'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex items-center gap-6">
        <span className="text-4xl text-amber-600">⚠️</span>
        <div>
          <h5 className="font-bold text-amber-900">Nota Importante</h5>
          <p className="text-sm text-amber-700">
            Al desactivar un módulo, el Administrador local no podrá acceder a él bajo ninguna circunstancia. 
            Esto es útil para planes de suscripción o mantenimiento programado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;