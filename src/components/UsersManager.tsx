import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Trash2, ShieldCheck, UserCog, Loader2, X, Shield } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { User, UserRole } from '../types';

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'AGENT' as UserRole });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...newUser,
        status: 'ACTIVE',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'AGENT' });
    } catch (error) { alert("Error al crear acceso."); }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase italic">Personal Autorizado</h1>
        <button onClick={() => setShowModal(true)} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-orange-700 transition-all">
          <UserPlus size={18} /> Nuevo Acceso
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr><th className="px-8 py-5">Colaborador</th><th className="px-8 py-5 text-center">Rango</th><th className="px-8 py-5 text-right">Acción</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-20 font-bold text-slate-300 uppercase animate-pulse">Sincronizando...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <img src={u.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
                    <div><p className="font-bold text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={async () => { if(window.confirm("¿Eliminar?")) await deleteDoc(doc(db, 'users', u.id!)); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 z-[110]">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in">
             {/* ... (mismo formulario del mensaje anterior) ... */}
             <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={20}/></button>
             <h2 className="text-2xl font-black mb-8 text-slate-900">Activar Acceso</h2>
             <form onSubmit={handleCreate} className="space-y-4">
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Nombre" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value="AGENT">Agente</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Generar Credenciales</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;