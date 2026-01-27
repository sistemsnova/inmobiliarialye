
import React, { useState } from 'react';
import { User, User as UserType, PayrollRecord } from '../types';
import { Plus, Shield, Mail, Trash2, X, Wallet, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import EmployeePayroll from './EmployeePayroll';

interface Props {
  users: UserType[];
  onAdd: (user: UserType) => void;
  onDelete: (id: string) => void;
  onUpdatePayroll: (userId: string, record: PayrollRecord) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

const UsersManager: React.FC<Props> = ({ users, onAdd, onDelete, onUpdatePayroll, onUpdateUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<UserType>>({ 
    name: '', 
    email: '', 
    role: 'AGENT',
    baseSalary: 1200,
    hireDate: new Date().toISOString().split('T')[0],
    dni: '',
    bankDetails: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newUser as UserType,
      id: Date.now().toString(),
      avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
      payrollHistory: []
    });
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'AGENT', baseSalary: 1200, hireDate: new Date().toISOString().split('T')[0] });
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  if (selectedUser) {
    return (
      <EmployeePayroll 
        user={selectedUser} 
        onBack={() => setSelectedUserId(null)} 
        onUpdatePayroll={onUpdatePayroll}
        onUpdateUser={onUpdateUser}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500">Administra los accesos, roles y sueldos de tu equipo.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl font-bold hover:bg-[var(--primary-color-700)] transition-all shadow-md"
        >
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-[var(--primary-color-100)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-slate-50" />
                <div>
                  <h3 className="font-bold text-slate-800">{user.name}</h3>
                  <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'text-[var(--primary-color-600)]' : 'text-slate-400'}`}>
                    <Shield size={10} /> {user.role}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setSelectedUserId(user.id)}
                  className="p-2 text-slate-300 hover:text-[var(--primary-color-600)] hover:bg-[var(--primary-color-50)] rounded-lg transition-all"
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => onDelete(user.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail size={14} className="opacity-50" /> {user.email}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Wallet size={14} className="opacity-50" /> Sueldo: <span className="font-bold text-slate-800">${user.baseSalary?.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => setSelectedUserId(user.id)}
                  className="text-[10px] font-bold text-[var(--primary-color-600)] hover:underline"
                >
                  Ver Ficha Laboral
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Añadir Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Datos Personales</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                    <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Corporativo</label>
                    <input required type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">DNI / Documento</label>
                    <input className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.dni} onChange={e => setNewUser({...newUser, dni: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Datos Laborales</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Rol de Acceso</label>
                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                      <option value="AGENT">Agente (Acceso Limitado)</option>
                      <option value="ADMIN">Administrador (Acceso Total)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Sueldo Base Mensual ($)</label>
                    <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.baseSalary} onChange={e => setNewUser({...newUser, baseSalary: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Ingreso</label>
                    <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newUser.hireDate} onChange={e => setNewUser({...newUser, hireDate: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">CBU / Datos Bancarios</label>
                <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" rows={2} value={newUser.bankDetails} onChange={e => setNewUser({...newUser, bankDetails: e.target.value})} />
              </div>

              <button className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl mt-4 shadow-lg shadow-[var(--primary-color-shadow)]">
                Guardar Usuario y Ficha Laboral
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;