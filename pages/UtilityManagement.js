
import React, { useState, useRef } from 'react';
import { readMeterImage } from '../services/geminiService.js';

const UtilityManagement = ({ rentals, setRentals, tenants }) => {
  const [globalRates, setGlobalRates] = useState({
    electricity: 45.5,
    water: 120.0,
    gas: 85.0
  });

  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [activeRentalForIA, setActiveRentalForIA] = useState(null);
  const [activeServiceForIA, setActiveServiceForIA] = useState('electricity');
  const fileInputRef = useRef(null);

  const getTenantName = (id) => tenants.find(t => t.id === id)?.name || 'Desconocido';

  const handleUpdateReading = (rentalId, service, value) => {
    const updatedRentals = rentals.map(r => {
      if (r.id === rentalId) {
        return {
          ...r,
          meters: { 
            ...r.meters, 
            [service]: value, 
            lastUpdated: new Date().toISOString().split('T')[0] 
          }
        };
      }
      return r;
    });
    setRentals(updatedRentals);
  };

  const calculateCharge = (rental, service) => {
    const currentReading = Number(rental.meters[service] || 0);
    
    if (currentReading <= 0) return null;

    const rate = globalRates[service];
    
    const totalAmount = Math.round(currentReading * rate);

    if (totalAmount <= 0) return null;

    return {
      id: `C-${Math.random().toString(36).substr(2, 5)}`,
      type: (service === 'electricity' ? 'Luz' : service === 'water' ? 'Agua' : 'Gas'),
      amount: totalAmount,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      description: `Consumo registrado: ${currentReading} unidades a tasa $${rate}/ud.`
    };
  };

  const handleGenerateCharge = (rental, service) => {
    const newCharge = calculateCharge(rental, service);
    
    if (!newCharge) {
        alert("La lectura debe ser mayor a 0 para generar un cargo.");
        return;
    }

    const updatedRentals = rentals.map(r => {
      if (r.id === rental.id) {
        const currentCharges = r.charges || [];
        return {
          ...r,
          charges: [...currentCharges, newCharge],
          debt: r.debt + newCharge.amount
        };
      }
      return r;
    });

    setRentals(updatedRentals);
    alert(`Cargo de ${newCharge.type} generado por $${newCharge.amount.toLocaleString()} para ${getTenantName(rental.tenantId)}`);
  };

  const handleLiquidateAll = () => {
    if (!confirm("¿Deseas liquidar Luz, Agua y Gas para TODOS los contratos con lecturas actuales?")) return;

    let totalCreated = 0;
    const updatedRentals = rentals.map(rental => {
        const newCharges = [];
        (['electricity', 'water', 'gas']).forEach(s => {
            const charge = calculateCharge(rental, s);
            if (charge) {
              newCharges.push(charge);
              totalCreated++;
            }
        });

        if (newCharges.length > 0) {
            const extraDebt = newCharges.reduce((sum, c) => sum + c.amount, 0);
            return {
                ...rental,
                charges: [...(rental.charges || []), ...newCharges],
                debt: rental.debt + extraDebt
            };
        }
        return rental;
    });

    if (totalCreated === 0) {
      alert("No hay lecturas pendientes de liquidar (todas están en 0).");
    } else {
      setRentals(updatedRentals);
      alert(`Liquidación masiva completada. Se generaron ${totalCreated} nuevos cargos de servicios.`);
    }
  };

  const handleOpenIA = (rentalId, service) => {
    setActiveRentalForIA(rentalId);
    setActiveServiceForIA(service);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && activeRentalForIA) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setIsProcessingIA(true);
        try {
          const reading = await readMeterImage(reader.result);
          if (!isNaN(reading) && reading > 0) {
            handleUpdateReading(activeRentalForIA, activeServiceForIA, reading);
          } else {
            alert("No se pudo extraer una lectura válida. Asegúrate que los números del medidor sean visibles.");
          }
        } catch (err) {
          alert("Error de conexión con el servicio de IA.");
        }
        setIsProcessingIA(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Consumos y Tarifas</h2>
          <p className="text-slate-500 mt-1 font-medium">Controla las lecturas de medidores y liquida servicios con IA.</p>
        </div>
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio kW Luz</span>
              <input 
                type="number" 
                value={globalRates.electricity} 
                onChange={e => setGlobalRates({...globalRates, electricity: Number(e.target.value)})}
                className="text-sm font-black text-blue-600 outline-none w-16"
              />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio m³ Agua</span>
              <input 
                type="number" 
                value={globalRates.water} 
                onChange={e => setGlobalRates({...globalRates, water: Number(e.target.value)})}
                className="text-sm font-black text-blue-600 outline-none w-16"
              />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio m³ Gas</span>
              <input 
                type="number" 
                value={globalRates.gas} 
                onChange={e => setGlobalRates({...globalRates, gas: Number(e.target.value)})}
                className="text-sm font-black text-orange-600 outline-none w-16"
              />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ Energía (kW)</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">💧 Agua (m³)</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">🔥 Gas (m³)</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deuda Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rentals.map(rental => (
                <tr key={rental.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="p-8">
                    <p className="font-black text-slate-800">{getTenantName(rental.tenantId)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Contrato: {rental.id}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={rental.meters.electricity} 
                        onChange={e => handleUpdateReading(rental.id, 'electricity', Number(e.target.value))}
                        className="w-24 p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        onClick={() => handleOpenIA(rental.id, 'electricity')}
                        className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Leer medidor con IA"
                      >
                        📸
                      </button>
                      <button 
                         onClick={() => handleGenerateCharge(rental, 'electricity')}
                         className="text-[9px] font-black text-blue-600 uppercase underline hover:text-blue-800"
                      >
                         Liquidar
                      </button>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={rental.meters.water} 
                        onChange={e => handleUpdateReading(rental.id, 'water', Number(e.target.value))}
                        className="w-24 p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        onClick={() => handleOpenIA(rental.id, 'water')}
                        className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Leer medidor con IA"
                      >
                        📸
                      </button>
                      <button 
                         onClick={() => handleGenerateCharge(rental, 'water')}
                         className="text-[9px] font-black text-blue-600 uppercase underline hover:text-blue-800"
                      >
                         Liquidar
                      </button>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={rental.meters.gas} 
                        onChange={e => handleUpdateReading(rental.id, 'gas', Number(e.target.value))}
                        className="w-24 p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button 
                        onClick={() => handleOpenIA(rental.id, 'gas')}
                        className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        title="Leer medidor con IA"
                      >
                        📸
                      </button>
                      <button 
                         onClick={() => handleGenerateCharge(rental, 'gas')}
                         className="text-[9px] font-black text-orange-600 uppercase underline hover:text-orange-800"
                      >
                         Liquidar
                      </button>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                     <p className={`text-sm font-black ${rental.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${rental.debt.toLocaleString()}
                     </p>
                     <span className="text-[10px] text-slate-400 font-bold">Ref: {rental.meters.lastUpdated}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isProcessingIA && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-4 animate-bounce">
              <span className="text-5xl">✨</span>
              <h3 className="text-xl font-black text-slate-900">IA Procesando Lectura...</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Analizando fotografía del medidor</p>
           </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="bg-blue-600 p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200">
        <div className="max-w-md">
           <h4 className="text-2xl font-black">Liquidación Automática Masiva</h4>
           <p className="text-blue-100 text-sm mt-2">Genera cargos para todos los contratos que tengan lecturas cargadas pero no liquidadas aún.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleLiquidateAll} 
             className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
           >
             Liquidar Todo el Mes
           </button>
        </div>
      </div>
    </div>
  );
};

export default UtilityManagement;