import React, { useState } from 'react';
import { Tenant, Property, Owner, UtilityBill, UtilityType, CompanyConfig } from '../types';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Zap, 
  Droplets, 
  Flame, 
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCircle,
  Key,
  Calendar,
  Pencil, // Added for edit button
  Save, // Added for save button
  X, // Added for cancel button
  Printer, // Added for print button
  DollarSign,
  PlusCircle // New icon for "Registrar Nuevo Pago"
} from 'lucide-react';
import ReceiptViewer from './ReceiptViewer'; // Import new ReceiptViewer component

interface Props {
  tenant: Tenant;
  properties: Property[];
  owners: Owner[];
  bills: UtilityBill[];
  onBack: () => void;
  onUpdateTenant: (tenantId: string, updatedFields: Partial<Tenant>) => void;
  config: CompanyConfig; // New prop
  onUpdateBillStatus: (billId: string, newStatus: UtilityBill['status'], receiptData?: {paymentMethod: string, paymentDate: string, receiptId: string}) => void; // New prop
  // Add onAddBill to TenantProfile props
  onAddBill: (bill: UtilityBill) => void;
}

const TenantProfile: React.FC<Props> = ({ tenant, properties, owners, bills, onBack, onUpdateTenant, config, onUpdateBillStatus, onAddBill }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Tenant>>(tenant);
  const [isSaved, setIsSaved] = useState(false); // State for save confirmation
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false);
  const [showRegisterPaymentModal, setShowRegisterPaymentModal] = useState(false); // New state for manual payment modal
  const [showReceiptViewerModal, setShowReceiptViewerModal] = useState(false);
  const [billToProcess, setBillToProcess] = useState<UtilityBill | null>(null);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualPaymentConcept, setManualPaymentConcept] = useState('');
  const [manualPaymentAmount, setManualPaymentAmount] = useState<number | ''>('');


  const property = properties.find(p => p.tenantId === tenant.id);
  const owner = property ? owners.find(o => o.id === property.ownerId) : null;
  
  // Get all bills associated with the property the tenant occupies
  // Include bills of type TENANT_PAYMENT_CREDIT (which represent payments/advances)
  const tenantBills = property ? bills.filter(b => b.propertyId === property.id || (b.type === UtilityType.TENANT_PAYMENT_CREDIT && b.description?.includes(tenant.id))) : [];
  
  const pendingBills = tenantBills.filter(b => b.status === 'PENDING' && b.type !== UtilityType.TENANT_PAYMENT_CREDIT);
  
  // Calculate total debt: sum of pending bills, subtract tenant credits
  const totalDebt = tenantBills.reduce((acc, b) => {
    if (b.status === 'PENDING' && b.type !== UtilityType.TENANT_PAYMENT_CREDIT) {
      return acc + b.amount; // Add pending debts
    }
    if (b.type === UtilityType.TENANT_PAYMENT_CREDIT && b.status === 'PAID') {
      return acc - b.amount; // Subtract paid credits/advances
    }
    return acc;
  }, 0);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!editFormData.name || !editFormData.email || !editFormData.phone || !editFormData.dni || !editFormData.rentAmount || !editFormData.contractStart || !editFormData.contractEnd) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    onUpdateTenant(tenant.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      dni: editFormData.dni,
      rentAmount: Number(editFormData.rentAmount),
      contractStart: editFormData.contractStart,
      contractEnd: editFormData.contractEnd,
    });
    setIsEditing(false);
    setIsSaved(true); // Show confirmation message
    setTimeout(() => setIsSaved(false), 3000); // Hide after 3 seconds
  };

  const handleCancel = () => {
    setEditFormData(tenant); // Revert changes
    setIsEditing(false);
  };

  const handleOpenPaymentModalForReceipt = (bill: UtilityBill) => {
    setBillToProcess(bill);
    setPaymentMethod(bill.paymentMethod || 'Efectivo'); // Default method or pre-filled if already paid
    setPaymentDate(bill.paymentDate || new Date().toISOString().split('T')[0]); // Default date or pre-filled
    setShowPaymentConfirmationModal(true);
  };

  const handleGenerateReceipt = (bill: UtilityBill, paymentMethod: string, paymentDate: string) => {
    const newReceiptId = bill.receiptId || `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`;
    
    // Update bill status and add receipt details
    onUpdateBillStatus(bill.id, 'PAID', {
      paymentMethod,
      paymentDate,
      receiptId: newReceiptId
    });

    const propertyForReceipt = properties.find(p => p.id === bill.propertyId);
    
    setReceiptDetails({
      company: config,
      tenant: tenant,
      property: propertyForReceipt,
      bill: { ...bill, paymentMethod, paymentDate, receiptId: newReceiptId },
    });
    
    setShowPaymentConfirmationModal(false);
    setShowReceiptViewerModal(true);
  };

  const handleRegisterManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPaymentConcept.trim() || manualPaymentAmount === '' || manualPaymentAmount <= 0) {
      alert('Por favor, completa el concepto y un monto válido.');
      return;
    }

    const newBillId = `MANUAL-${Date.now().toString()}`;
    const newReceiptId = `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`;

    const newManualPaymentBill: UtilityBill = {
      id: newBillId,
      propertyId: property?.id || 'UNASSIGNED', // Associate with tenant's current property or a generic ID
      type: UtilityType.TENANT_PAYMENT_CREDIT,
      amount: manualPaymentAmount as number,
      date: paymentDate, // This is the payment date, not a due date
      contractNumber: `MANUAL-${newBillId.slice(-6)}`,
      status: 'PAID', // It's a payment, so it's already paid
      description: manualPaymentConcept, // Custom concept
      receiptId: newReceiptId,
      paymentMethod: paymentMethod,
      paymentDate: paymentDate,
    };

    // Use the onAddBill prop here
    onAddBill(newManualPaymentBill); // Add this new "credit" bill

    const propertyForReceipt = properties.find(p => p.id === newManualPaymentBill.propertyId);
    setReceiptDetails({
      company: config,
      tenant: tenant,
      property: propertyForReceipt,
      bill: newManualPaymentBill,
    });

    // Reset fields and close modal
    setManualPaymentConcept('');
    setManualPaymentAmount('');
    setPaymentMethod('Efectivo');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setShowRegisterPaymentModal(false);
    setShowReceiptViewerModal(true);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[var(--primary-color-600)] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ficha del Inquilino</h2>
          <p className="text-slate-500 text-sm">Información contractual y estado de cuenta.</p>
        </div>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in w-fit mx-auto">
          ¡Inquilino actualizado!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-[var(--primary-color-50)] hover:text-[var(--primary-color-600)] transition-colors"
              title={isEditing ? 'Cancelar edición' : 'Editar información'}
            >
              {isEditing ? <X size={18} /> : <Pencil size={18} />}
            </button>
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-[var(--primary-color-50)] text-[var(--primary-color-600)] text-[10px] font-bold px-2 py-1 rounded-md uppercase">Activo</span>
            </div>
            <div className="w-24 h-24 rounded-3xl bg-[var(--primary-color-50)] text-[var(--primary-color-600)] flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-2 border-white shadow-sm">
              {(isEditing ? editFormData.name : tenant.name)?.charAt(0)}
            </div>
            
            {isEditing ? (
              <>
                <input 
                  type="text" 
                  name="name"
                  value={editFormData.name || ''} 
                  onChange={handleEditChange} 
                  className="w-full text-xl font-bold text-slate-800 text-center mb-2 px-3 py-2 border border-slate-200 rounded-lg outline-none" 
                  required
                />
                <p className="text-xs text-slate-400 font-mono mb-6">DNI: 
                  <input 
                    type="number" 
                    name="dni"
                    value={editFormData.dni || ''} 
                    onChange={handleEditChange} 
                    className="inline-block w-24 ml-2 px-2 py-1 border border-slate-200 rounded-lg text-sm text-center outline-none" 
                    required
                  />
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800">{tenant.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-6">DNI: {tenant.dni}</p>
              </>
            )}
            
            <div className="space-y-3 text-left">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={editFormData.email || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={editFormData.phone || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={handleSave} className="flex-1 py-3 bg-[var(--primary-color-600)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--primary-color-700)] transition-colors shadow-lg">
                      <Save size={18} /> Guardar
                    </button>
                    <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                      <X size={18} /> Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a href={`mailto:${tenant.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 text-sm hover:bg-[var(--primary-color-50)] hover:text-[var(--primary-color-600)] transition-colors">
                    <Mail size={18} className="text-[var(--primary-color-400)]" />
                    <span className="truncate">{tenant.email}</span>
                  </a>
                  <a href={`tel:${tenant.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 text-sm hover:bg-[var(--primary-color-50)] hover:text-[var(--primary-color-600)] transition-colors">
                    <Phone size={18} className="text-[var(--primary-color-400)]" />
                    <span>{tenant.phone}</span>
                  </a>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
               <div className="bg-slate-900 rounded-2xl p-4 text-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deuda Total</p>
                  <p className={`text-2xl font-bold ${totalDebt > 0 ? 'text-rose-400' : (totalDebt < 0 ? 'text-blue-400' : 'text-emerald-400')}`}>
                    {formatCurrency(totalDebt)}
                  </p>
               </div>
            </div>
          </div>

          {/* Contract Context */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
             <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
               <Key size={18} className="text-[var(--primary-color-600)]" />
               Datos del Alquiler
             </h4>
             <div className="space-y-4">
                <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase block">Propiedad</span>
                   <p className="text-sm font-bold text-slate-700">{property ? property.title : 'No asignada'}</p>
                   <p className="text-xs text-slate-500">{property?.address}</p>
                </div>
                {owner && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Propietario / Dueño</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                        {owner.name.charAt(0)}
                      </div>
                      <p className="text-xs font-medium text-slate-600">{owner.name}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Inicio Contrato</span>
                      {isEditing ? (
                        <input 
                          type="date" 
                          name="contractStart"
                          value={editFormData.contractStart || ''} 
                          onChange={handleEditChange} 
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none" 
                          required
                        />
                      ) : (
                        <p className="text-xs font-bold text-slate-700">{tenant.contractStart}</p>
                      )}
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Vencimiento Contrato</span>
                      {isEditing ? (
                        <input 
                          type="date" 
                          name="contractEnd"
                          value={editFormData.contractEnd || ''} 
                          onChange={handleEditChange} 
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none" 
                          required
                        />
                      ) : (
                        <p className="text-xs font-bold text-slate-700">{tenant.contractEnd || 'Indefinido'}</p>
                      )}
                   </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Monto Alquiler Mensual (ARS $)</span>
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="rentAmount"
                      value={editFormData.rentAmount || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm font-bold outline-none" 
                      required
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">${tenant.rentAmount.toLocaleString()}</p>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Financial List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={20} className="text-[var(--primary-color-600)]" />
                Historial de Recibos y Servicios
              </h3>
              {totalDebt > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
                  <AlertCircle size={14} /> {pendingBills.length} Pagos Atrasados
                </span>
              )}
               <button 
                onClick={() => setShowRegisterPaymentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md font-semibold text-sm"
              >
                <PlusCircle size={18} /> Nuevo Recibo
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Concepto</th>
                    <th className="px-6 py-4">Vencimiento/Pago</th>
                    <th className="px-6 py-4">Importe</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tenantBills.length > 0 ? [...tenantBills].sort((a,b) => b.date.localeCompare(a.date)).map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            bill.type === UtilityType.RENT ? 'bg-[var(--primary-color-50)] text-[var(--primary-color-600)]' :
                            bill.type === UtilityType.ELECTRICITY ? 'bg-yellow-50 text-yellow-600' :
                            bill.type === UtilityType.TENANT_PAYMENT_CREDIT ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {bill.type === UtilityType.RENT ? <Key size={16} /> : 
                             bill.type === UtilityType.ELECTRICITY ? <Zap size={16} /> :
                             bill.type === UtilityType.TENANT_PAYMENT_CREDIT ? <DollarSign size={16} /> :
                             <Receipt size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{bill.description || bill.type}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Ref: {bill.contractNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(bill.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-bold ${bill.type === UtilityType.TENANT_PAYMENT_CREDIT ? 'text-blue-600' : 'text-slate-800'}`}>
                          {bill.type === UtilityType.TENANT_PAYMENT_CREDIT ? '+' : ''}{formatCurrency(bill.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${
                          bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {bill.status === 'PAID' ? 'Abonado' : 'Pendiente'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {bill.status === 'PENDING' && bill.type !== UtilityType.TENANT_PAYMENT_CREDIT ? (
                          <button 
                            onClick={() => handleOpenPaymentModalForReceipt(bill)}
                            className="text-[var(--primary-color-600)] hover:text-[var(--primary-color-800)] font-bold text-[10px] bg-[var(--primary-color-50)] hover:bg-[var(--primary-color-100)] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto w-fit"
                          >
                            <DollarSign size={14} /> Registrar Pago & Recibo
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenPaymentModalForReceipt(bill)} // Re-use for viewing receipt, assuming payment info is stored
                            className="text-[var(--primary-color-600)] hover:text-[var(--primary-color-800)] font-bold text-[10px] bg-[var(--primary-color-50)] hover:bg-[var(--primary-color-100)] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto w-fit"
                          >
                            <Receipt size={14} /> Ver Recibo
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <Receipt size={64} />
                          <p className="text-sm font-medium">Este inquilino no tiene facturas cargadas aún.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-[var(--primary-color-600)] rounded-3xl p-6 text-white flex items-center justify-between shadow-xl shadow-[var(--primary-color-shadow)]">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                   <AlertCircle size={24} />
                </div>
                <div>
                   <h4 className="font-bold">Notificar Deuda</h4>
                   <p className="text-xs text-[var(--primary-color-100)]">Envía un recordatorio por WhatsApp con el saldo pendiente.</p>
                </div>
             </div>
             <button className="px-6 py-3 bg-white text-[var(--primary-color-600)] font-bold rounded-xl text-sm hover:bg-[var(--primary-color-50)] transition-all">
                Enviar Aviso
             </button>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal for Receipt */}
      {showPaymentConfirmationModal && billToProcess && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Registrar Pago & Recibo</h3>
              <button onClick={() => setShowPaymentConfirmationModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleGenerateReceipt(billToProcess, paymentMethod, paymentDate); }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Concepto:</label>
                <p className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{billToProcess.description || billToProcess.type} ({formatCurrency(billToProcess.amount)})</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Método de Pago:</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  placeholder="Ej: Efectivo, Transferencia, Tarjeta"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Pago:</label>
                <input 
                  type="date" 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={paymentDate} 
                  onChange={e => setPaymentDate(e.target.value)} 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--primary-color-700)] transition-colors mt-4">
                Confirmar Pago & Generar Recibo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Register Manual Payment Modal */}
      {showRegisterPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Registrar Nuevo Pago o Adelanto</h3>
              <button onClick={() => setShowRegisterPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleRegisterManualPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Concepto del Recibo:</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={manualPaymentConcept} 
                  onChange={e => setManualPaymentConcept(e.target.value)}
                  placeholder="Ej: Adelanto de alquiler, Pago parcial de expensas"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monto Recibido (ARS $):</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={manualPaymentAmount} 
                  onChange={e => setManualPaymentAmount(Number(e.target.value))}
                  placeholder="Ej: 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Método de Pago:</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  placeholder="Ej: Transferencia Bancaria, Efectivo"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Pago:</label>
                <input 
                  type="date" 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                  value={paymentDate} 
                  onChange={e => setPaymentDate(e.target.value)} 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--primary-color-700)] transition-colors mt-4">
                Confirmar y Generar Recibo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {showReceiptViewerModal && receiptDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold">Recibo de Pago</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color-600)] text-white rounded-xl font-bold hover:bg-[var(--primary-color-700)] transition-colors shadow-md print:hidden"
                >
                  <Printer size={18} /> Imprimir
                </button>
                <button onClick={() => setShowReceiptViewerModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 print:hidden"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ReceiptViewer {...receiptDetails} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantProfile;