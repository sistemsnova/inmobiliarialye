
import React, { useState } from 'react';

const UserForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      username: '',
      email: '',
      role: 'Agente',
      baseSalary: 0,
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      payrollHistory: []
    }
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {initialData ? 'Editar Usuario' : 'Nuevo Miembro del Equipo'}
            </h3>
            <p className="text-sm text-slate-500">Define los accesos y el rol en la plataforma.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img 
                src={formData.avatar} 
                className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-inner object-cover" 
                alt="Preview" 
              />
              <button 
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                onClick={(e) => {
                   e.preventDefault();
                   setFormData({...formData, avatar: `https://i.pravatar.cc/150?u=${Math.random()}`});
                }}
                title="Cambiar avatar aleatorio"
              >
                🔄
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="Ej: Laura Martínez"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sueldo Base (Mensual)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  required
                  value={formData.baseSalary}
                  onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full p-4 pl-8 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de Usuario (Login)</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600"
                placeholder="lauram"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="laura@cloudestate.pro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rol en el Equipo</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
            >
              <option value="Admin">Admin (Control Total)</option>
              <option value="Gerente">Gerente (Gestión Estratégica)</option>
              <option value="Agente">Agente (Operativo / CRM)</option>
            </select>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            {initialData ? 'Guardar Cambios' : 'Dar de Alta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;