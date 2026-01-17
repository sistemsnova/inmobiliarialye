
import React, { useState } from 'react';
import UserForm from '../components/UserForm.js';

const Users = ({ users, setUsers, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(undefined);
  const [selectedUserPayroll, setSelectedUserPayroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isReadOnly = userRole === 'Gerente';

  const [payrollForm, setPayrollForm] = useState({
    amount: 0,
    type: 'Adelanto',
    concept: ''
  });

  const handleSave = (userData) => {
    if (isReadOnly) return;
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      const newUser = {
        id: `U-${Math.random().toString(36).substr(2, 5)}`,
        name: userData.name || '',
        username: userData.username || (userData.name?.toLowerCase().replace(/\s/g, '') || 'nuevo_user'),
        email: userData.email || '',
        role: userData.role || 'Agente',
        avatar: userData.avatar || `https://i.pravatar.cc/150?u=${Math.random()}`,
        baseSalary: userData.baseSalary || 0,
        payrollHistory: []
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  const calculatePending = (user) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const advances = user.payrollHistory
      .filter(pt => pt.type === 'Adelanto' && new Date(pt.date).getMonth() === currentMonth && new Date(pt.date).getFullYear() === currentYear)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return Math.max(0, user.baseSalary - advances);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Equipo</h2>
          <p className="text-slate-500 mt-1">Nivel de acceso: <span className="text-blue-600 font-bold">{userRole}</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
             <input 
               type="text" 
               placeholder="Buscar miembro..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
             />
          </div>
          {!isReadOnly && (
            <button 
              onClick={() => { setEditingUser(undefined); setIsModalOpen(true); }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-xl"
            >
              + Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex items-center gap-4">
              <img src={user.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover border border-slate-100" alt={user.name} />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                <div className="flex gap-2 items-center">
                   <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white">
                    {user.role}
                   </span>
                   <span className="text-[10px] font-bold text-blue-400">@{user.username}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sueldo Base</span>
                <span className="text-sm font-black text-slate-800">${user.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Resto Mes</span>
                <span className="text-sm font-black text-blue-600">${calculatePending(user).toLocaleString()}</span>
              </div>
            </div>

            {!isReadOnly && (
              <div className="mt-6">
                <button 
                  onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                  className="w-full py-3 bg-white border border-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  Configurar Perfil
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <UserForm 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          initialData={editingUser}
        />
      )}
    </div>
  );
};

export default Users;