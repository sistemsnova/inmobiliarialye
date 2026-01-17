
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Finances = ({ db, setDb }) => {
  const cashBoxes = db.cashBoxes;
  const transactions = db.transactions;

  const [activeSubTab, setActiveSubTab] = useState('analytics');
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState(null);

  const [avgCommission, setAvgCommission] = useState(500000); 
  const [targetProfit, setTargetProfit] = useState(2000000);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayTxs = transactions.filter(t => t.date === todayStr);
    const monthlyTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTxs.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
    const expenses = monthlyTxs.filter(t => t.type === 'Egreso').reduce((acc, t) => acc + t.amount, 0);
    const todayIncome = todayTxs.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
    const todayExpenses = todayTxs.filter(t => t.type === 'Egreso').reduce((acc, t) => acc + t.amount, 0);
    
    const profit = income - expenses;
    const margin = income > 0 ? (profit / income) * 100 : 0;

    const breakEvenSales = avgCommission > 0 ? Math.ceil(expenses / avgCommission) : 0;
    const targetSales = avgCommission > 0 ? Math.ceil((expenses + targetProfit) / avgCommission) : 0;

    const categoryData = Object.entries(
      monthlyTxs.filter(t => t.type === 'Egreso').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return { 
      income, expenses, profit, margin, breakEvenSales, targetSales, categoryData,
      todayIncome, todayExpenses, todayBalance: todayIncome - todayExpenses 
    };
  }, [transactions, avgCommission, targetProfit]);

  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'Ingreso',
    concept: '',
    cashBoxId: cashBoxes[0]?.id || '',
    category: 'Varios'
  });

  const [boxForm, setBoxForm] = useState({ name: '', description: '', balance: 0 });

  const handleRegisterTx = () => {
    if (!txForm.amount || !txForm.concept || !txForm.cashBoxId) return;

    const newTx = {
      id: `TR-${Math.random().toString(36).substr(2, 5)}`,
      date: txForm.date || new Date().toISOString().split('T')[0],
      amount: Number(txForm.amount),
      type: txForm.type,
      concept: txForm.concept,
      cashBoxId: txForm.cashBoxId,
      category: txForm.category || 'Varios'
    };

    setDb((prevDb) => {
      const newTransactions = [newTx, ...prevDb.transactions];
      const newCashBoxes = prevDb.cashBoxes.map((box) => {
        if (box.id === newTx.cashBoxId) {
          const change = newTx.type === 'Ingreso' ? newTx.amount : -newTx.amount;
          return { ...box, balance: box.balance + change };
        }
        return box;
      });
      return { ...prevDb, transactions: newTransactions, cashBoxes: newCashBoxes };
    });

    setIsTxModalOpen(false);
    setTxForm({ date: new Date().toISOString().split('T')[0], amount: 0, type: 'Ingreso', concept: '', cashBoxId: cashBoxes[0]?.id || '', category: 'Varios' });
  };

  const handleOpenBoxModal = (box = null) => {
    if (box) { setEditingBox(box); setBoxForm(box); }
    else { setEditingBox(null); setBoxForm({ name: '', description: '', balance: 0 }); }
    setIsBoxModalOpen(true);
  };

  const handleSaveBox = () => {
    if (!boxForm.name) return;
    
    setDb((prevDb) => {
      let newBoxes;
      if (editingBox) {
        newBoxes = prevDb.cashBoxes.map((box) => box.id === editingBox.id ? { ...box, name: boxForm.name, description: boxForm.description, balance: Number(boxForm.balance) } : box);
      } else {
        const newBox = { id: `CB-${Math.random().toString(36).substr(2, 5)}`, name: boxForm.name, description: boxForm.description || '', balance: Number(boxForm.balance) || 0 };
        newBoxes = [...prevDb.cashBoxes, newBox];
      }
      return { ...prevDb, cashBoxes: newBoxes };
    });

    setIsBoxModalOpen(false);
    setEditingBox(null);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro Financiero</h2>
          <p className="text-slate-500 mt-1 font-medium">Tesorería profesional integrada con facturación.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTxModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
          >
            <span>💸</span> Movimiento Manual
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm overflow-x-auto">
        {(['analytics', 'moves', 'boxes', 'closure']).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'analytics' ? '📈 Rendimiento' : tab === 'moves' ? '📑 Diario' : tab === 'boxes' ? '🏦 Cuentas' : '🔐 Cierre de Caja'}
          </button>
        ))}
      </div>

      {activeSubTab === 'analytics' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos (Hoy)</p>
              <h3 className="text-2xl font-black text-green-600">${stats.todayIncome.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos (Hoy)</p>
              <h3 className="text-2xl font-black text-red-500">${stats.todayExpenses.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Punto de Equilibrio</p>
              <h3 className="text-2xl font-black text-blue-600">{stats.breakEvenSales} Ventas</h3>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Caja Total</p>
              <h3 className="text-2xl font-black text-blue-400">${cashBoxes.reduce((acc, b) => acc + b.balance, 0).toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-800 mb-6">Pérdidas y Ganancias (P&L)</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className="text-sm font-black text-slate-400 uppercase">Ingresos Operativos</span>
                  <span className="text-xl font-black text-green-600">+ ${stats.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className="text-sm font-black text-slate-400 uppercase">Gastos Administrativos</span>
                  <span className="text-xl font-black text-red-500">- ${stats.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-lg font-black text-slate-800 uppercase">Resultado Neto</span>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${stats.profit.toLocaleString()}
                    </span>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">Rentabilidad: {stats.margin.toFixed(1)}%</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'closure' && (
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-blue-200">🔐</div>
            <h3 className="text-3xl font-black text-slate-900">Cierre de Caja Diario</h3>
            <p className="text-slate-500 mt-2 font-medium">Revisa los saldos antes de finalizar la jornada.</p>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase">Saldo Inicial del Día</span>
                  <span className="text-sm font-black text-slate-800">${(cashBoxes.reduce((acc, b) => acc + b.balance, 0) - stats.todayBalance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-black text-green-600 uppercase">(+) Ingresos Totales</span>
                  <span className="text-sm font-black text-green-600">${stats.todayIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-black text-red-600 uppercase">(-) Gastos Totales</span>
                  <span className="text-sm font-black text-red-600">${stats.todayExpenses.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between">
                  <span className="text-sm font-black text-slate-900 uppercase">Balance de Hoy</span>
                  <span className={`text-xl font-black ${stats.todayBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${stats.todayBalance.toLocaleString()}
                  </span>
                </div>
             </div>

             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-center">
                <span className="text-2xl">📝</span>
                <p className="text-xs text-amber-700 font-medium">Asegúrate de haber arqueado los valores físicos contra los saldos digitales antes de exportar el balance.</p>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => alert("Balance exportado a Excel/PDF")} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Exportar Resumen</button>
                <button className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Finalizar y Cerrar</button>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'moves' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Concepto</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6 text-sm text-slate-500 font-medium">{tx.date}</td>
                  <td className="p-6 text-sm font-black text-slate-800">{tx.concept}</td>
                  <td className={`p-6 text-right font-black text-sm ${tx.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'Ingreso' ? '+' : '-'} ${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'boxes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {cashBoxes.map(box => (
            <div key={box.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🏦</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{box.name}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">${box.balance.toLocaleString()}</h3>
              <p className="text-slate-500 text-xs mt-4 font-medium leading-relaxed">{box.description}</p>
              <button 
                onClick={() => handleOpenBoxModal(box)}
                className="mt-8 w-full py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                Configurar Cuenta
              </button>
            </div>
          ))}
          <button 
            onClick={() => handleOpenBoxModal()}
            className="p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <span className="text-3xl mb-2">+</span>
            <span className="font-black text-[10px] uppercase tracking-widest">Añadir Cuenta</span>
          </button>
        </div>
      )}

      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800">Operación Manual</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                {(['Ingreso', 'Egreso']).map(type => (
                  <button key={type} onClick={() => setTxForm({...txForm, type})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${txForm.type === type ? (type === 'Ingreso' ? 'bg-green-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg') : 'text-slate-400'}`}>
                    {type === 'Ingreso' ? '➕ Ingreso' : '➖ Egreso'}
                  </button>
                ))}
              </div>
              <input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: Number(e.target.value)})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-3xl outline-none" placeholder="0" />
              <input type="text" value={txForm.concept} onChange={e => setTxForm({...txForm, concept: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Concepto del movimiento..." />
              <select value={txForm.cashBoxId} onChange={e => setTxForm({...txForm, cashBoxId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
                {cashBoxes.map(box => <option key={box.id} value={box.id}>{box.name}</option>)}
              </select>
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
              <button onClick={() => setIsTxModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
              <button onClick={handleRegisterTx} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl uppercase text-[10px]">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {isBoxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800">{editingBox ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
              <button onClick={() => setIsBoxModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <input type="text" value={boxForm.name} onChange={e => setBoxForm({...boxForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" placeholder="Nombre de la cuenta..." />
              <textarea value={boxForm.description} onChange={e => setBoxForm({...boxForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none font-medium" placeholder="Descripción..."></textarea>
              <input type="number" value={boxForm.balance} onChange={e => setBoxForm({...boxForm, balance: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" placeholder="Saldo Inicial" />
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
              <button onClick={() => setIsBoxModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
              <button onClick={handleSaveBox} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl uppercase text-[10px]">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCRM;