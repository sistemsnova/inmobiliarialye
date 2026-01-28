import React, { useState, useEffect } from 'react';
import { 
  Zap, Calculator, Save, History, 
  Loader2, Search, CheckCircle2, XCircle,
  FileText, Clock, Settings, ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { Tenant, UtilityType } from '../types';

export const ServicesCost: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [billsPlanilla, setBillsPlanilla] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [rates, setRates] = useState({ ELECTRICITY: 150, GAS: 80, WATER: 1200, TAX: 500 });

  const [billing, setBilling] = useState({
    tenantId: '',
    serviceType: 'ELECTRICITY' as UtilityType,
    prevReading: '',
    currReading: '',
  });

  useEffect(() => {
    const unsubRates = onSnapshot(doc(db, 'config', 'utility_rates'), (snap) => {
      if (snap.exists()) setRates(snap.data() as any);
    });

    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      setTenants(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Tenant[]);
    });

    const unsubPlanilla = onSnapshot(query(collection(db, 'utility_bills'), orderBy('date', 'desc')), (snap) => {
      setBillsPlanilla(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubRates(); unsubTenants(); unsubPlanilla(); };
  }, []);

  const consumption = Number(billing.currReading) - Number(billing.prevReading);
  const unitPrice = rates[billing.serviceType as keyof typeof rates] || 0;
  const totalAmount = (consumption > 0 ? consumption * unitPrice : 0) + rates.TAX;

  const handleSaveBill = async () => {
    if (!billing.tenantId || consumption < 0) return alert("Verifique los datos");
    setIsSaving(true);
    try {
      const selectedTenant = tenants.find(t => t.id === billing.tenantId);
      await addDoc(collection(db, 'utility_bills'), {
        tenantId: billing.tenantId,
        tenantName: selectedTenant?.name || "Sin Nombre",
        tenantCuit: selectedTenant?.cuit || "",
        type: billing.serviceType,
        consumption,
        totalAmount,
        status: 'PENDING',
        date: serverTimestamp(),
      });
      alert("Guardado correctamente.");
      setBilling({ ...billing, prevReading: '', currReading: '' });
    } catch (e) {
      alert("Error de conexión");
    } finally { setIsSaving(false); }
  };

  const handleUpdateRates = async (field: string, value: number) => {
    const newRates = { ...rates, [field]: value };
    await setDoc(doc(db, 'config', 'utility_rates'), newRates);
  };

  const filteredPlanilla = billsPlanilla.filter(b => 
    b.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in text-left pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Liquidación de Servicios</h1>
        <p className="text-slate-500 font-medium italic">Sincronización en tiempo real para todos los inquilinos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-6">
          <h3 className="text-xs font-black uppercase text-orange-500 flex items-center gap-2">
            <Settings size={18} /> Tarifas Globales ($)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">KW Luz</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl font-bold text-orange-400" 
                value={rates.ELECTRICITY} onChange={(e) => handleUpdateRates('ELECTRICITY', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">m³ Gas</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl font-bold text-orange-400" 
                value={rates.GAS} onChange={(e) => handleUpdateRates('GAS', Number(e.target.value))} />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
             <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold outline-none" value={billing.tenantId} onChange={(e)=>setBilling({...billing, tenantId: e.target.value})}>
                <option value="" className="text-slate-900">Elegir Inquilino...</option>
                {tenants.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>)}
             </select>
             <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Ant." className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black" value={billing.prevReading} onChange={(e)=>setBilling({...billing, prevReading: e.target.value})} />
                <input type="number" placeholder="Act." className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black" value={billing.currReading} onChange={(e)=>setBilling({...billing, currReading: e.target.value})} />
             </div>
             <button onClick={handleSaveBill} disabled={isSaving || !billing.tenantId} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
               {isSaving ? <Loader2 className="animate-spin" /> : <Save />} REGISTRAR COBRO
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <History className="text-blue-600" /> Planilla General
            </h3>
            <input type="text" placeholder="Filtrar..." className="p-2 bg-slate-50 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Inquilino</th>
                  <th className="pb-4 text-right">Monto</th>
                  <th className="pb-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPlanilla.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-400">{h.date?.toDate().toLocaleDateString()}</td>
                    <td className="py-4 font-bold text-slate-800">{h.tenantName}</td>
                    <td className="py-4 text-right font-black text-lg text-slate-900">${h.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-center">
                       {h.status === 'PENDING' ? 
                        <span className="flex items-center justify-center gap-1 text-amber-600 font-black text-[9px] uppercase bg-amber-50 px-2 py-1 rounded-full">
                          <Clock size={10}/> Pendiente
                        </span> :
                        <span className="flex items-center justify-center gap-1 text-green-600 font-black text-[9px] uppercase bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle2 size={10}/> Cobrado
                        </span>
                       }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};