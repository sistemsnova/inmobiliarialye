
import React from 'react';
import { canAccess } from '../utils/permissions.js';

const Sidebar = ({ activeTab, setActiveTab, moduleSettings, companySettings, userRole }) => {
  const allMenuItems = [
    { id: 'desktop', label: 'Escritorio', icon: '🖥️' },
    { id: 'dashboard', label: 'Tablero', icon: '📊', key: 'dashboard' },
    { id: 'supervision', label: 'Supervisión', icon: '🚨', key: 'rentals' },
    { id: 'properties', label: 'Propiedades', icon: '🏠', key: 'properties' },
    { id: 'crm', label: 'Inquilinos y Contratos', icon: '👥', key: 'rentals' },
    { id: 'utilities', label: 'Consumos IA', icon: '⚡', key: 'rentals' },
    { id: 'bill-import', label: 'Importar Facturas', icon: '📑', key: 'rentals' },
    { id: 'rental-import', label: 'Importar Alquileres', icon: '📥', key: 'rentals' },
    { id: 'tasks', label: 'Tareas', icon: '✅', key: 'tasks' },
    { id: 'finances', label: 'Finanzas y Cajas', icon: '💰', key: 'finances' },
    { id: 'users', label: 'Usuarios Equipo', icon: '👤', key: 'users' },
    { id: 'ai-studio', label: 'Asistente IA', icon: '✨', key: 'aiStudio' },
    { id: 'tutorial', label: 'Guía de Uso', icon: '🎓' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!canAccess(userRole, item.id)) return false;
    if (!item.key) return true;
    return moduleSettings[item.key];
  });

  const renderBrand = () => {
    if (companySettings.displayType === 'logo' && companySettings.logoUrl) {
      return (
        <div className="h-12 flex items-center">
          <img 
            src={companySettings.logoUrl} 
            alt={companySettings.name} 
            className="max-h-full max-w-[180px] object-contain filter brightness-0 invert" 
          />
        </div>
      );
    }
    const nameParts = companySettings.name.split(' ');
    const firstName = nameParts[0] || '';
    const restName = nameParts.slice(1).join(' ');
    return (
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 truncate">
        <span className="text-blue-500">{firstName}</span>
        {restName && <span>{restName}</span>}
      </h1>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 transition-all flex flex-col">
      <div className="p-6">
        {renderBrand()}
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold truncate">
          {userRole} - Panel
        </p>
      </div>

      <nav className="mt-6 px-4 space-y-2 overflow-y-auto flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mb-8 mx-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {userRole?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Sesión Activa</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;