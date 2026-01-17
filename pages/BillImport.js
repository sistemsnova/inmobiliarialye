
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { parseServiceBill } from '../services/geminiService.js';

const BillImport = ({ rentals, setRentals, tenants }) => {
  const [processedBills, setProcessedBills] = useState([]);
  const fileInputRef = useRef(null);

  const getTenantName = (id) => tenants.find(t => t.id === id)?.name || 'Desconocido';

  const handleFiles = (files) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      data: null,
      status: 'pending',
      linkedRentals: []
    }));
    setProcessedBills(prev => [...prev, ...newFiles]);
  };

  const processAllWithIA = async () => {
    const billsToProcess = processedBills.filter(b => b.status === 'pending');
    
    for (let bill of billsToProcess) {
      setProcessedBills(prev => prev.map(b => b.file === bill.file ? { ...b, status: 'processing' } : b));
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const result = await parseServiceBill(base64, bill.file.type);
        
        if (result && result.contractNumber) {
          const targetTenant = tenants.find(t => {
             const cNumber = String(result.contractNumber).trim();
             if (result.serviceType === 'Luz') return t.electricityContract === cNumber;
             if (result.serviceType === 'Agua') return t.waterContract === cNumber;
             if (result.serviceType === 'Gas') return t.gasContract === cNumber;
             return false;
          });

          const linked = targetTenant ? rentals.filter(r => r.tenantId === targetTenant.id) : [];
          
          setProcessedBills(prev => prev.map(b => 
            b.file === bill.file ? { ...b, data: result, status: 'success', linkedRentals: linked } : b
          ));
        } else {
          setProcessedBills(prev => prev.map(b => b.file === bill.file ? { ...b, status: 'error' } : b));
        }
      };
      reader.readAsDataURL(bill.file);
    }
  };

  const handleApplyCharges = () => {
    let updatedRentals = [...rentals];
    let appliedCount = 0;

    processedBills.forEach(bill => {
      if (bill.status === 'success' && bill.data && bill.linkedRentals.length > 0) {
        const totalBillAmount = bill.data.totalAmount;
        const numRentals = bill.linkedRentals.length;
        
        const totalConsumption = bill.linkedRentals.reduce((sum, r) => {
            const meterValue = bill.data?.serviceType === 'Luz' ? r.meters.electricity : 
                               bill.data?.serviceType === 'Agua' ? r.meters.water : r.meters.gas;
            return sum + (meterValue || 1);
        }, 0);

        bill.linkedRentals.forEach(rental => {
          const meterValue = bill.data?.serviceType === 'Luz' ? rental.meters.electricity : 
                             bill.data?.serviceType === 'Agua' ? rental.meters.water : rental.meters.gas;
          
          const sharePercentage = numRentals > 1 ? (meterValue || 1) / totalConsumption : 1;
          const finalAmount = Math.round(totalBillAmount * sharePercentage);

          const newCharge = {
            id: `CBILL-${Math.random().toString(36).substr(2, 5)}`,
            type: bill.data?.serviceType || 'Otros',
            amount: finalAmount,
            dueDate: bill.data?.dueDate || new Date().toISOString().split('T')[0],
            status: 'Pendiente',
            description: `Factura Importada (Contrato: ${bill.data?.contractNumber}) ${numRentals > 1 ? '- Cuota prorrateada' : ''}`
          };

          updatedRentals = updatedRentals.map(r => 
            r.id === rental.id ? { ...r, charges: [...(r.charges || []), newCharge], debt: r.debt + newCharge.amount } : r
          );
          appliedCount++;
        });
      }
    });

    setRentals(updatedRentals);
    setProcessedBills([]);
    alert(`Se han generado ${appliedCount} cargos en las cuentas de los clientes vinculados por Nº de contrato.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Importación Inteligente de Facturas</h2>
          <p className="text-slate-500 mt-1 font-medium">Sube facturas de servicios y deja que la IA las asigne a los inquilinos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setProcessedBills([])}
            className="px-6 py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600"
          >
            Limpiar Lista
          </button>
          <button 
            disabled={processedBills.length === 0}
            onClick={processAllWithIA}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            ✨ Procesar con Gemini IA
          </button>
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
      >
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">
          📄
        </div>
        <h3 className="text-xl font-black text-slate-800">Arrastra tus facturas aquí</h3>
        <p className="text-slate-400 font-medium mt-2">Formatos aceptados: JPG, PNG, PDF (Edesur, Metrogas, AySA, etc.)</p>
        <input type="file" ref={fileInputRef} multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" accept="image/*,application/pdf" />
      </div>

      {processedBills.length > 0 && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
             <h4 className="font-black text-slate-800">Archivos en cola ({processedBills.length})</h4>
             <button 
               onClick={handleApplyCharges}
               disabled={!processedBills.some(b => b.status === 'success')}
               className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50"
             >
               Aplicar Cargos a Cuentas
             </button>
          </div>
          <div className="divide-y divide-slate-50">
            {processedBills.map((bill, idx) => (
              <div key={idx} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                   {bill.file.type.includes('image') ? (
                     <img src={bill.preview} className="w-full h-full object-cover" alt="Bill" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-xs uppercase">PDF</div>
                   )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <p className="font-black text-slate-800 truncate text-sm">{bill.file.name}</p>
                  <div className="flex gap-4">
                    {bill.status === 'processing' && <span className="text-[10px] font-black text-blue-500 uppercase animate-pulse">Analizando...</span>}
                    {bill.status === 'error' && <span className="text-[10px] font-black text-red-500 uppercase">Error en lectura</span>}
                    {bill.status === 'success' && bill.data && (
                      <div className="flex items-center gap-4">
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-black">LEÍDO ✓</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contrato ID: <span className="text-slate-800">{bill.data.contractNumber}</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Importe: <span className="text-blue-600">${bill.data.totalAmount.toLocaleString()}</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Servicio: <span className="text-slate-800">{bill.data.serviceType}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-64 text-right">
                  {bill.linkedRentals.length > 0 ? (
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Vinculado a:</p>
                       {bill.linkedRentals.map(r => (
                         <p key={r.id} className="text-xs font-bold text-slate-700">{getTenantName(r.tenantId)}</p>
                       ))}
                       {bill.linkedRentals.length > 1 && <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase">Prorrateo Activado</span>}
                    </div>
                  ) : (
                    bill.status === 'success' && <span className="text-[10px] font-black text-red-400 uppercase italic">Nº de Contrato no encontrado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <span className="text-2xl mb-4 block">🔍</span>
            <h5 className="font-black text-slate-800 mb-2">Escaneo Multiformato</h5>
            <p className="text-slate-500 text-xs leading-relaxed">Gemini IA analiza el documento buscando el Nº de cliente o contrato específico del prestador de servicio.</p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <span className="text-2xl mb-4 block">🤝</span>
            <h5 className="font-black text-slate-800 mb-2">Asignación por Nº Contrato</h5>
            <p className="text-slate-500 text-xs leading-relaxed">El sistema vincula la factura directamente con el inquil