
import React, { useState } from 'react';
import { Owner, Property, UtilityBill, UtilityType } from '../types';
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
  MessageCircle, 
  Fingerprint, 
  Briefcase,
  Pencil, // Added for edit button
  Save, // Added for save button
  X, // Added for cancel button
  // Added CreditCard import to fix "Cannot find name 'CreditCard'" error
  CreditCard
} from 'lucide-react';

interface Props {
  owner: Owner;
  properties: Property[];
  bills: UtilityBill[];
  onBack: () => void;
  onUpdateBillStatus: (billId: string, newStatus: UtilityBill['status']) => void; 
  onUpdateOwner: (ownerId: string, updatedFields: Partial<Owner>) => void; // Added prop
}

export const OwnerProfile: React.FC<Props> = ({ owner, properties, bills, onBack, onUpdateBillStatus, onUpdateOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Owner>>(owner);

  const ownerProperties = properties.filter(p => p.ownerId === owner.id);
  
  // Get all bills associated with any of the owner's properties
  const propertyIds = ownerProperties.map(p => p.id);
  const ownerBills = bills.filter(b => propertyIds.includes(b.propertyId));
  
  const pendingBills = ownerBills.filter(b => b.status === 'PENDING');
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  const sendWhatsAppNotification = (bill: UtilityBill) => {
    const propName = properties.find(p => p.id === bill.propertyId)?.title || 'propiedad';
    const message = `Hola ${owner.name}! Te informamos sobre un movimiento de cuenta:
Concepto: ${bill.type}
Propiedad: ${propName}
Monto: ${formatCurrency(bill.amount)}
Estado: ${bill.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
Fecha: ${new Date(bill.date).toLocaleDateString()}

Gracias por tu gestión!`;
    window.open(`https://wa.me/${owner.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = () => {
    if (!editFormData.name || !editFormData.email || !editFormData.phone || !editFormData.dni) {
      alert('Por favor, completa todos los campos obligatorios (Nombre, Email, Teléfono, DNI).');
      return;
    }
    onUpdateOwner(owner.id, editFormData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditFormData(owner); // Revert changes
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[var(--primary-color-600)] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Perfil del Propietario</h2>
          <p className="text-slate-500">Gestión detallada y estado de cuentas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center relative">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-[var(--primary-color-50)] hover:text-[var(--primary-color-600)] transition-colors"
              title={isEditing ? 'Cancelar edición' : 'Editar información'}
            >
              {isEditing ? <X size={18} /> : <Pencil size={18} />}
            </button>
            <div className="w-24 h-24 rounded-full bg-[var(--primary-color-100)] text-[var(--primary-color-600)] flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-md">
              {(isEditing ? editFormData.name : owner.name)?.charAt(0)}
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
                <p className="text-sm text-slate-500 mb-6">Propietario verificado</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800">{owner.name}</h3>
                <p className="text-sm text-slate-500 mb-6">Propietario verificado</p>
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
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Fingerprint size={12} /> DNI (Login Portal)</label>
                    <input 
                      type="number" 
                      name="dni"
                      value={editFormData.dni || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><CreditCard size={12} /> Alias de Cobro</label>
                    <input 
                      type="text" 
                      name="paymentAlias"
                      value={editFormData.paymentAlias || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" 
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={handleSaveChanges} className="flex-1 py-3 bg-[var(--primary-color-600)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--primary-color-700)] transition-colors shadow-lg">
                      <Save size={18} /> Guardar
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                      <X size={18} /> Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-600 text-sm">
                    <Mail size={18} className="text-[var(--primary-color-500)]" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-slate-600 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-[var(--primary-color-500)]" />
                      <span>{owner.phone}</span>
                    </div>
                    <button 
                      onClick={() => window.open(`https://wa.me/${owner.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                      className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                      title="Enviar mensaje de WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500 font-medium">Deuda Pendiente</span>
                  <span className={`text-lg font-bold ${totalPending > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    ${totalPending.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${totalPending > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: totalPending > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Home size={18} className="text-[var(--primary-color-400)]" />
              Propiedades ({ownerProperties.length})
            </h4>
            <div className="space-y-3">
              {ownerProperties.map(p => (
                <div key={p.id} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <p className="text-sm font-bold truncate group-hover:text-[var(--primary-color-400)] transition-colors">{p.title}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {p.address}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
             <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
               <Fingerprint size={18} className="text-[var(--primary-color-600)]" />
               Acceso al Portal
             </h4>
             <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">DNI de Usuario</span>
                <p className="text-sm font-bold text-slate-700">{owner.dni}</p>
             </div>
             <p className="text-xs text-slate-500">
               Utiliza este DNI para ingresar al portal de propietarios y consultar el estado de tus propiedades y pagos.
             </p>
          </div>
        </div>

        {/* Bills and Payments Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={20} className="text-[var(--primary-color-600)]" />
                Servicios por Abonar y Pagados
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  <Clock size={12} /> {pendingBills.length} Pendientes
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Servicio / Contrato</th>
                    <th className="px-6 py-4">Propiedad</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Importe</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ownerBills.length > 0 ? ownerBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            bill.type === UtilityType.ELECTRICITY ? 'bg-yellow-50 text-yellow-600' :
                            bill.type === UtilityType.WATER ? 'bg-blue-50 text-blue-600' :
                            bill.type === UtilityType.GAS ? 'bg-orange-50 text-orange-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {bill.type === UtilityType.ELECTRICITY && <Zap size={16} />}
                            {bill.type === UtilityType.WATER && <Droplets size={16} />}
                            {bill.type === UtilityType.GAS && <Flame size={16} />}
                            {bill.type === UtilityType.TAXES && <Receipt size={16} />}
                            {bill.type === UtilityType.RENT && <Home size={16} />}
                            {bill.type === UtilityType.MANAGEMENT_FEE && <Briefcase size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{bill.type}</p>
                            <p className="text-[10px] text-slate-400">{bill.contractNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 max-w-[150px] truncate">
                          {properties.find(p => p.id === bill.propertyId)?.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 font-medium">{new Date(bill.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">${bill.amount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full w-fit ${
                          bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {bill.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {bill.status === 'PENDING' ? (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => onUpdateBillStatus(bill.id, 'PAID')}
                              className="text-[var(--primary-color-600)] font-bold text-xs hover:underline px-2 py-1 bg-[var(--primary-color-50)] rounded-md"
                              title="Marcar esta factura como pagada"
                            >
                              Marcar Pago
                            </button>
                            <button 
                              onClick={() => sendWhatsAppNotification(bill)}
                              className="text-emerald-600 font-bold text-xs hover:underline px-2 py-1 bg-emerald-50 rounded-md"
                              title="Enviar recordatorio de pago por WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => sendWhatsAppNotification(bill)}
                            className="text-emerald-600 font-bold text-xs hover:underline px-2 py-1 bg-emerald-50 rounded-md"
                            title="Enviar comprobante de pago por WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <Receipt size={48} />
                          <p className="text-sm font-medium">No se encontraron facturas para este propietario.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl h-fit">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Nota de Liquidación</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                Recuerda que los pagos realizados fuera de término pueden generar intereses moratorios según las tarifas configuradas en el módulo de Servicios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
