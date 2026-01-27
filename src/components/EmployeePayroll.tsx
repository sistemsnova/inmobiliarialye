
import React, { useState } from 'react';
import { User, PayrollRecord } from '../types';
import { 
  ArrowLeft, 
  Wallet, 
  History, 
  PlusCircle, 
  DollarSign, 
  Calendar, 
  Briefcase,
  TrendingDown,
  TrendingUp,
  CreditCard,
  User as UserIcon,
  Save,
  Check
} from 'lucide-react';

interface Props {
  user: User;
  onBack: () => void;
  onUpdatePayroll: (userId: string, record: PayrollRecord) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

export const EmployeePayroll: React.FC<Props> = ({ user, onBack, onUpdatePayroll, onUpdateUser }) => {
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [newRecord, setNewRecord] = useState<Partial<PayrollRecord>>({
    amount: 0,
    type: 'SALARY',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  const totalPaid = user.payrollHistory
    .filter(r => r.type === 'SALARY' || r.type === 'BONUS')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalAdvances = user.payrollHistory
    .filter(r => r.type === 'ADVANCE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePayroll(user.id, { ...newRecord as PayrollRecord, id: Date.now().toString() });
    setShowAddRecord(false);
    setNewRecord({ amount: 0, type: 'SALARY', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const saveName = () => {
    if (tempName.trim() === '') return;
    onUpdateUser(user.id, { name: tempName });
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ficha de Empleado: {user.name}</h2>
          <p className="text-slate-500 text-sm">Sueldos expresados en Pesos Argentinos (ARS).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
              <Briefcase size={18} className="text-[var(--primary-color-600)]" />
              Datos Contractuales
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sueldo Base Mensual</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-800">{formatCurrency(user.baseSalary || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-[var(--primary-color-400)]" />
              Resumen Financiero (ARS)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-xs font-medium">Total Pagado</span>
                <span className="font-bold">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-xs font-medium">Total Adelantos</span>
                <span className="font-bold">{formatCurrency(totalAdvances)}</span>
              </div>
            </div>
            <button onClick={() => setShowAddRecord(true)} className="w-full mt-6 py-3 bg-[var(--primary-color-600)] hover:bg-[var(--primary-color-700)] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg">
              <PlusCircle size={18} /> Nuevo Registro
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Monto (ARS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.payrollHistory.length > 0 ? user.payrollHistory.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${record.type === 'SALARY' ? 'bg-[var(--primary-color-100)] text-[var(--primary-color-700)]' : 'bg-emerald-100 text-emerald-700'}`}>
                        {record.type === 'SALARY' ? 'Sueldo' : 'Bono'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(record.amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-300">No hay movimientos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in">
            <h3 className="text-xl font-bold mb-6">Nuevo Registro de Pago (ARS)</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monto ($ ARS)</label>
                <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newRecord.amount} onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})} />
              </div>
              <button className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg">Confirmar Registro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
