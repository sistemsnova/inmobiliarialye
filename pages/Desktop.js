
import React, { useState } from 'react';
import { persistenceService } from '../services/persistenceService.js';
import { canAccess } from '../utils/permissions.js';

const Desktop = ({ db, setActiveTab, onUpdateShortcuts, userRole }) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const allShortcutsData = [
    { id: 'properties', label: 'Propiedades', icon: '🏠', color: 'bg-blue-500', desc: `${db.properties.length} listados`, key: 'properties' },
    { id: 'rentals', label: 'Contratos', icon: '🔑', color: 'bg-indigo-500', desc: `${db.rentals.length} activos`, key: 'rentals' },
    { id: 'crm', label: 'Clientes CRM', icon: '👥', color: 'bg-emerald-500', desc: `${db.leads.length} leads + ${db.tenants.length} inquilinos`, key: 'leads' },
    { id: 'tasks', label: 'Mi Agenda', icon: '✅', color: 'bg-amber-500', desc: `${db.tasks.filter(t => !t.completed).length} pendientes`, key: 'tasks' },
    { id: 'finances', label: 'Caja Fuerte', icon: '💰', color: 'bg-rose-500', desc: 'Gestión de dinero', key: 'finances' },
    { id: 'users', label: 'Mi Equipo', icon: '👤', color: 'bg-violet-500', desc: `${db.users.length} miembros`, key: 'users' },
    { id: 'ai-studio', label: 'Laboratorio IA', icon: '✨', color: 'bg-cyan-500', desc: 'Gemini Pro Activo', key: 'aiStudio' },
    { id: 'dashboard', label: 'Estadísticas', icon: '📊', color: 'bg-slate-700', desc: 'Reportes globales', key: 'dashboard' },
  ];

  const visibleShortcuts = allShortcutsData.filter(s => 
    canAccess(userRole, s.id) &&
    db.moduleSettings[s.key] && 
    db.desktopShortcuts.includes(s.id)
  );

  const toggleShortcut = (id) => {
    if (db.desktopShortcuts.includes(id)) {
      onUpdateShortcuts(db.desktopShortcuts.filter(sid => sid !== id));
    } else {
      onUpdateShortcuts([...db.desktopShortcuts, id]);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">¡Hola de nuevo! 👋</h2>
          <p className="text-slate-500 text-lg mt-2 font-medium">Acceso nivel: <span className="text-blue-600 font-bold">{userRole}</span></p>
        </div>
        <button 
          onClick={() => setIsCustomizeModalOpen(true)}
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
        >
          ⚙️ Personalizar Accesos
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {visibleShortcuts.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{item.label}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.desc}</p>
          </button>
        ))}

        {visibleShortcuts.length === 0 && (
          <div className="col-span-full py-20 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 italic">
            <span className="text-4xl mb-2">📥</span>
            <p>No tienes accesos directos configurados para tu rol.</p>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex items-center justify-between shadow-xl">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Seguridad</p>
            <h4 className="text-2xl font-black">Sesión Protegida</h4>
            <p className="text-slate-500 text-sm mt-2">Nivel de acceso: {userRole}</p>
          </div>
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-2xl">
            🛡️
          </div>
        </div>
      </div>

      {isCustomizeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Accesos Permitidos</h3>
                <p className="text-sm text-slate-500">Módulos habilitados para tu rango.</p>
              </div>
              <button onClick={() => setIsCustomizeModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">✕</button>
            </div>
            <div className="p-8 space-y-3">
              {allShortcutsData.map(item => {
                const isPermitted = canAccess(userRole, item.id);
                const isEnabledByAdmin = db.moduleSettings[item.key];
                const isPinned = db.desktopShortcuts.includes(item.id);

                if (!isPermitted || !isEnabledByAdmin) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleShortcut(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isPinned ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    {isPinned && <span className="text-blue-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desktop;