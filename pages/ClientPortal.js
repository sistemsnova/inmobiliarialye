
import React, { useState } from 'react';

const ClientPortal = ({ tenant, onLogout, rentals, properties }) => {
  const tenantRentals = rentals.filter(r => r.tenantId === tenant.id);
  const [activeRentalIdx, setActiveRentalIdx] = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentRental = tenantRentals[activeRentalIdx];
  const currentProperty = currentRental ? properties.find(p => p.id === currentRental.propertyId) : null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setIsPayModalOpen(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Header Mobile Optimized */}
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
              <span className="text-blue-600">Cloud</span>Estate
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden xs:block">
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase">Inquilino</p>
              <p className="text-xs md:text-sm font-black text-slate-800 truncate max-w-[100px] md:max-w-none">{tenant.name.split(' ')[0]}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 md:px-4 md:py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-[10px] md:text-xs font-black rounded-xl transition-all uppercase tracking-widest"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {!currentRental ? (
          <div className="text-center py-20 bg-white rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-200">
            <span className="text-5xl md:text-6xl block mb-4">🏠</span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">No tienes contratos activos</h2>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Main Section: Card Deuda & Historial */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              
              {/* Card Deuda - Mobile Optimized */}
              <div className="bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <p className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2">Saldo Total a Pagar</p>
                  <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">${currentRental.debt.toLocaleString()}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">📍</div>
                        <p className="text-xs md:text-sm font-bold text-slate-300 truncate">{currentProperty?.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">📅</div>
                        <p className="text-xs md:text-sm font-bold text-slate-300">Vence: {currentRental.endDate}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsPayModalOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-900/60 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>💳</span> Pagar Ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Historial de Pagos - Card Style for Mobile */}
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">📑</span>
                  Movimientos Recientes
                </h3>
                
                {/* Mobile: List of Cards | Desktop: Table */}
                <div className="space-y-4 md:hidden">
                  {currentRental.payments.length === 0 ? (
                    <p className="text-center text-slate-400 py-10 text-xs font-bold uppercase">Sin movimientos</p>
                  ) : (
                    currentRental.payments.map(payment => (
                      <div key={payment.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{payment.date}</p>
                          <p className="font-black text-slate-800 text-sm">{payment.concept}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                            payment.status === 'Pagado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">${payment.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Version Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentRental.payments.map(payment => (
                        <tr key={payment.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 text-sm text-slate-600">{payment.date}</td>
                          <td className="py-6 font-black text-slate-800">{payment.concept}</td>
                          <td className="py-6 font-black text-slate-900 text-lg">${payment.amount.toLocaleString()}</td>
                          <td className="py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              payment.status === 'Pagado' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Section: Suministros & Propiedad */}
            <div className="space-y-6 md:space-y-8">
              
              {/* Suministros - Large Tap Targets */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="text-sm md:text-lg font-black text-slate-800 mb-6 uppercase tracking-widest">Estado de Suministros</h4>
                <div className="space-y-4">
                  <div className="p-4 md:p-5 bg-blue-50/30 rounded-2xl md:rounded-[2rem] border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xl md:text-2xl">⚡</span>
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Energía</p>
                        <p className="text-lg md:text-xl font-black text-slate-800">{currentRental.meters.electricity} <span className="text-[10px] font-bold text-slate-400 uppercase">kWh</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-5 bg-cyan-50/30 rounded-2xl md:rounded-[2rem] border border-cyan-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xl md:text-2xl">💧</span>
                      <div>
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Agua</p>
                        <p className="text-lg md:text-xl font-black text-slate-800">{currentRental.meters.water} <span className="text-[10px] font-bold text-slate-400 uppercase">m³</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 bg-orange-50/30 rounded-2xl md:rounded-[2rem] border border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xl md:text-2xl">🔥</span>
                      <div>
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Gas</p>
                        <p className="text-lg md:text-xl font-black text-slate-800">{currentRental.meters.gas} <span className="text-[10px] font-bold text-slate-400 uppercase">m³</span></p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center font-black uppercase mt-2">Sincronizado: {currentRental.meters.lastUpdated}</p>
                </div>
              </div>

              {/* Tu Inmueble Compact for Mobile */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm group">
                <h4 className="text-sm md:text-lg font-black text-slate-800 mb-4 uppercase tracking-widest">Tu Inmueble</h4>
                <div className="rounded-2xl overflow-hidden mb-4 h-24 md:h-32 relative">
                  <img src={currentProperty?.imageUrl} alt="Propiedad" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <p className="font-black text-slate-800 text-sm truncate">{currentProperty?.title}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase truncate">{currentProperty?.address}</p>
              </div>
            </div>

          </div>
        )}
      </main>

      {isPayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
            <div className="p-8 md:p-10 text-center">
              {!paymentSuccess ? (
                <>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl mx-auto mb-6 shadow-inner">
                    💳
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Confirmar Pago</h3>
                  <p className="text-slate-500 text-sm mb-8">Vas a abonar tu saldo pendiente de <span className="font-black text-blue-600">${currentRental.debt.toLocaleString()}</span></p>
                  
                  <div className="space-y-3 text-left mb-8">
                    <button className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center hover:border-blue-500 transition-all active:bg-blue-50">
                      <span className="flex items-center gap-3 font-black text-slate-700 text-sm">
                        <span className="text-xl">💳</span> Tarjeta de Crédito
                      </span>
                      <span className="text-blue-600 text-xs">Seleccionar</span>
                    </button>
                    <button className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center hover:border-blue-500 transition-all active:bg-blue-50">
                      <span className="flex items-center gap-3 font-black text-slate-700 text-sm">
                        <span className="text-xl">🏧</span> Transferencia / CBU
                      </span>
                      <span className="text-blue-600 text-xs">Seleccionar</span>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <button 
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 disabled:opacity-50 order-1 md:order-2"
                    >
                      {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
                    </button>
                    <button onClick={() => setIsPayModalOpen(false)} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest order-2 md:order-1">Cancelar</button>
                  </div>
                </>
              ) : (
                <div className="py-10 animate-in zoom-in-95">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl md:text-5xl mx-auto mb-6 shadow-xl shadow-green-200">
                    ✓
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tighter">¡Pago Realizado!</h3>
                  <p className="text-slate-500 font-medium">Recibirás el comprobante en tu email en unos minutos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;