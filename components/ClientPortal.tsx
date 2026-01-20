
import React, { useState } from 'react';
import { Owner, Tenant, Property, UtilityBill, CompanyConfig, UtilityType } from '../types';
import { 
  LogOut, 
  Home, 
  Receipt, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Droplets, 
  Flame, 
  MessageCircle,
  AlertCircle,
  Copy,
  Key
} from 'lucide-react';

interface Props {
  client: Owner | Tenant;
  isOwner: boolean;
  properties: Property[];
  bills: UtilityBill[];
  config: CompanyConfig;
  onLogout: () => void;
  onUpdateBillStatus: (billId: string, newStatus: UtilityBill['status']) => void;
  // Fix: Add owners to props interface
  owners: Owner[];
}

const ClientPortal: React.FC<Props> = ({ client, isOwner, properties, bills, config, onLogout, onUpdateBillStatus, owners }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillsForPayment, setSelectedBillsForPayment] = useState<UtilityBill[]>([]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  const relevantProperties = isOwner 
    ? properties.filter(p => p.ownerId === client.id)
    : properties.filter(p => p.tenantId === client.id);

  const propertyIds = relevantProperties.map(p => p.id);
  const relevantBills = bills.filter(b => propertyIds.includes(b.propertyId));
  
  const pendingBills = relevantBills.filter(b => b.status === 'PENDING');
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  const getAliasForBill = (bill: UtilityBill) => {
    if (bill.type === UtilityType.RENT) {
      const property = properties.find(p => p.id === bill.propertyId);
      if (property && property.ownerId) {
        // Fix: 'owners' is now available from props
        const owner = owners.find(o => o.id === property.ownerId);
        return owner?.paymentAlias || 'ALIAS.PROPIETARIO.NO.CONFIG';
      }
      return "ALIAS.DUENO.DIRECTO"; // Fallback if owner info not found
    }
    return config.realEstateAlias || 'INMO.AI.ELITE';
  };

  const handleSelectBill = (bill: UtilityBill, isChecked: boolean) => {
    if (isChecked) {
      setSelectedBillsForPayment(prev => [...prev, bill]);
    } else {
      setSelectedBillsForPayment(prev => prev.filter(b => b.id !== bill.id));
    }
  };

  const handleSelectAllBills = (isChecked: boolean) => {
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedBillsForPayment(pendingBills);
    } else {
      setSelectedBillsForPayment([]);
    }
  };

  const handleConfirmPayment = () => {
    selectedBillsForPayment.forEach(bill => {
      onUpdateBillStatus(bill.id, 'PAID');
    });
    setPaymentConfirmed(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBillsForPayment([]);
    setPaymentConfirmed(false);
    setSelectAll(false);
  };

  const sendWhatsAppProof = () => {
    const paidBillsSummary = selectedBillsForPayment.map(bill => {
      const propName = properties.find(p => p.id === bill.propertyId)?.title || 'tu propiedad';
      return `- *${bill.type}* (${propName}): ${formatCurrency(bill.amount)}`;
    }).join('\n');

    const message = `¡Hola! Soy ${client.name}.

He realizado el pago de los siguientes conceptos:
${paidBillsSummary}

*Monto Total Transferido:* ${formatCurrency(selectedBillsForPayment.reduce((acc, bill) => acc + bill.amount, 0))} ARS

Por favor, revisa el comprobante que adjunto a continuación. ¡Muchas gracias!`;

    window.open(`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOpenPaymentModal = () => {
    if (selectedBillsForPayment.length === 0) {
      alert('Por favor, selecciona al menos una factura para pagar.');
      return;
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--primary-color-600)] rounded-lg flex items-center justify-center">
             <Home size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-800">{config.name} | Portal ARS</span>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-500 font-bold text-sm flex items-center gap-2">
          <LogOut size={18} /> Salir
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[var(--primary-color-100)] text-[var(--primary-color-600)] flex items-center justify-center text-3xl font-bold">
                {client.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Hola, {client.name}</h2>
                <p className="text-slate-500">Valores expresados en Pesos Argentinos.</p>
              </div>
           </div>
           <div className="bg-slate-900 rounded-3xl p-6 text-white text-center md:text-left min-w-[200px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Pendiente (ARS)</p>
              <p className="text-3xl font-bold text-[var(--primary-color-400)]">{formatCurrency(totalPending)}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 space-y-6"> {/* Changed to col-span-3 to make table wider */}
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt size={18} className="text-[var(--primary-color-600)]" />
              Pagos y Facturas
            </h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[var(--primary-color-600)] focus:ring-[var(--primary-color-600)]"
                        checked={selectAll && pendingBills.length > 0}
                        onChange={(e) => handleSelectAllBills(e.target.checked)}
                        disabled={pendingBills.length === 0}
                      />
                    </th>
                    <th className="px-6 py-4">Concepto</th>
                    <th className="px-6 py-4">Propiedad</th>
                    <th className="px-6 py-4">Vencimiento</th>
                    <th className="px-6 py-4">Monto (ARS)</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {relevantBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {bill.status === 'PENDING' && (
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-[var(--primary-color-600)] focus:ring-[var(--primary-color-600)]"
                            checked={selectedBillsForPayment.some(b => b.id === bill.id)}
                            onChange={(e) => handleSelectBill(bill, e.target.checked)}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{bill.type}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                         {properties.find(p => p.id === bill.propertyId)?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                         {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(bill.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {bill.status === 'PAID' ? 'Abonado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {relevantBills.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No tienes facturas en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {selectedBillsForPayment.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleOpenPaymentModal}
                  className="px-8 py-3 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--primary-color-700)] transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={20} /> Pagar Seleccionados ({selectedBillsForPayment.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in">
            {!paymentConfirmed ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirmar Pago</h3>
                  <p className="text-slate-500 text-sm">Estas son las facturas que vas a marcar como pagadas:</p>
                </div>
                
                <div className="max-h-60 overflow-y-auto pr-2 mb-6 space-y-3">
                  {selectedBillsForPayment.map(bill => (
                    <div key={bill.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{bill.type}</p>
                        <p className="text-xs text-slate-500">{properties.find(p => p.id === bill.propertyId)?.title}</p>
                      </div>
                      <p className="font-bold text-[var(--primary-color-600)]">{formatCurrency(bill.amount)}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-100 rounded-xl mb-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Monto Total a Transferir</p>
                  <p className="text-3xl font-bold text-[var(--primary-color-600)]">{formatCurrency(selectedBillsForPayment.reduce((acc, bill) => acc + bill.amount, 0))}</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Alias de Transferencia</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold font-mono">{getAliasForBill(selectedBillsForPayment[0])}</p>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(getAliasForBill(selectedBillsForPayment[0])); alert('Alias copiado!'); }}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      title="Copiar alias"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleConfirmPayment} 
                  className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg mb-3 hover:bg-[var(--primary-color-700)] transition-colors"
                >
                  <CheckCircle2 size={20} /> Ya Pagué / Marcar como Pagado
                </button>
                <button onClick={handleClosePaymentModal} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Cancelar</button>
              </>
            ) : (
              <div className="text-center p-4">
                <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Pago Registrado!</h3>
                <p className="text-slate-600 mb-6">Por favor, envía el comprobante de pago a la inmobiliaria vía WhatsApp para que podamos verificarlo.</p>
                <button 
                  onClick={sendWhatsAppProof} 
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg mb-3 hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle size={20} /> Enviar Comprobante por WhatsApp
                </button>
                <button onClick={handleClosePaymentModal} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;