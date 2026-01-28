import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, 
  Plus, Search, Trash2, Calendar, 
  PieChart, ArrowUpRight, ArrowDownRight,
  Loader2, Save, X, Wallet
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Transaction } from '../types';

export const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({ amount: '', description: '', type: 'INCOME', category: 'ALQUILER' });

  // 1. Escuchar movimientos en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'finance'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Cálculos de Balance
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'finance'), {
        ...newTx,
        amount: Number(newTx.amount),
        date: serverTimestamp()
      });
      setShowModal(false);
      setNewTx({ amount: '', description: '', type: 'INCOME', category: 'ALQUILER' });
    } catch (err) { alert("Error al guardar movimiento"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Gestión Financiera</h1>
          <p className="text-slate-500 font-medium italic">Control de ingresos, gastos y rentabilidad de la inmobiliaria.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95">
          <Plus size={18} /> Registrar Movimiento
        </button>
      </header>

      {/* TARJETAS DE ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><ArrowUpRight /></div>
              <span className="text-[10px] font-black text-green-600 uppercase">Ingresos</span>
           </div>
           <h3 className="text-3xl font-black text-slate-800">${totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><ArrowDownRight /></div>
              <span className="text-[10px] font-black text-red-600 uppercase">Egresos</span>
           </div>
           <h3 className="text-3xl font-black text-slate-800">${totalExpense.toLocaleString()}</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><DollarSign /></div>
                 <span className="text-[10px] font-black text-orange-400 uppercase">Balance Neto</span>
              </div>
              <h3 className="text-3xl font-black">${balance.toLocaleString()}</h3>
           </div>
           <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 -rotate-12" />
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/20">
           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><PieChart size={16} className="text-orange-600" /> Libro Diario Cloud</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Fecha</th>
                <th className="px-8 py-5">Descripción / Categoría</th>
                <th className="px-8 py-5 text-right">Monto</th>
                <th className="px-8 py-5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center font-bold text-slate-300 animate-pulse">Sincronizando Finanzas...</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-slate-400">{t.date?.toDate().toLocaleDateString()}</td>
                    <td className="px-8 py-6">
                       <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                       <p className="text-[10px] text-slate-400 font-black uppercase">{t.category}</p>
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-lg ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                       <button onClick={() => deleteDoc(doc(db, 'finance', t.id))} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 z-[120]">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-lg shadow-2xl animate-in zoom-in">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">Nuevo Registro</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full"><X/></button>
             </div>
             <form onSubmit={handleSave} className="space-y-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                   <button type="button" onClick={() => setNewTx({...newTx, type: 'INCOME'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newTx.type === 'INCOME' ? 'bg-white text-green-600 shadow-md' : 'text-slate-400'}`}>Ingreso</button>
                   <button type="button" onClick={() => setNewTx({...newTx, type: 'EXPENSE'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newTx.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-md' : 'text-slate-400'}`}>Egreso</button>
                </div>
                <input required type="number" placeholder="Monto ($)" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-2xl outline-none" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" placeholder="Concepto / Descripción" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value as any})}>
                   <option value="ALQUILER">Alquiler</option>
                   <option value="COMISION">Comisión</option>
                   <option value="REPARACION">Reparación</option>
                   <option value="IMPUESTO">Impuesto</option>
                   <option value="OTROS">Otros</option>
                </select>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Confirmar Registro Cloud</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};