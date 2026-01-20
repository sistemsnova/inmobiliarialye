
import React from 'react';
import { CompanyConfig, Tenant, Property, UtilityBill, UtilityType } from '../types';
import { Phone, Mail, MapPin, Briefcase } from 'lucide-react';

interface ReceiptViewerProps {
  company: CompanyConfig;
  tenant: Tenant;
  property: Property | undefined;
  bill: UtilityBill;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ company, tenant, property, bill }) => {

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  const isCredit = bill.type === UtilityType.TENANT_PAYMENT_CREDIT;

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-lg shadow-md max-w-2xl mx-auto print:shadow-none print:border-none print:p-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div id="receipt-print-area" className="flex flex-col space-y-8">
        {/* Company Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Company Logo" className="h-16 w-auto object-contain" />
            ) : (
              <div className="w-16 h-16 bg-[var(--primary-color-600)] rounded-xl flex items-center justify-center text-white">
                <Briefcase size={32} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-800">{company.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={12} /> {company.address}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="flex items-center gap-1.5 justify-end">
              <Mail size={14} className="text-slate-400" /> {company.email}
            </p>
            <p className="flex items-center gap-1.5 justify-end">
              <Phone size={14} className="text-slate-400" /> {company.phone}
            </p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-slate-50 p-6 rounded-xl flex justify-between items-center text-slate-700">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">{isCredit ? 'COMPROBANTE DE PAGO' : 'RECIBO DE PAGO'}</p>
            <p className="text-2xl font-black text-[var(--primary-color-600)]">#{bill.receiptId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-400">Fecha de Emisión</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {/* Tenant and Property Details */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">PAGADO POR</p>
            <p className="text-lg font-bold text-slate-800">{tenant.name}</p>
            <p className="text-sm text-slate-600">DNI: {tenant.dni}</p>
            <p className="text-sm text-slate-600">Email: {tenant.email}</p>
            <p className="text-sm text-slate-600">Tel: {tenant.phone}</p>
          </div>
          {property && (
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">PROPIEDAD ASOCIADA</p>
              <p className="text-lg font-bold text-slate-800">{property.title}</p>
              <p className="text-sm text-slate-600">{property.address}, {property.neighborhood}</p>
              <p className="text-sm text-slate-600">Alquiler Mensual: {formatCurrency(property.price)}</p>
            </div>
          )}
        </div>

        {/* Items Paid */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-xs font-bold uppercase text-slate-400 mb-4">{isCredit ? 'DETALLE DEL PAGO RECIBIDO' : 'DETALLE DEL PAGO'}</p>
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Concepto</th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Período/Fecha</th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.description || bill.type} ({bill.contractNumber})</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(bill.date).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">
                    {isCredit ? '+' : ''}{formatCurrency(bill.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total and Payment Info */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">MÉTODO DE PAGO:</span>
              <span className="text-sm text-slate-600 font-bold">{bill.paymentMethod || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black text-slate-900 border-t border-slate-200 pt-3">
              <span>TOTAL {isCredit ? 'RECIBIDO' : 'PAGADO'}:</span>
              <span className="text-[var(--primary-color-600)]">
                {isCredit ? '+' : ''}{formatCurrency(bill.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-100 mt-8">
          <p className="text-sm text-slate-500 mb-6">
            Este {isCredit ? 'comprobante' : 'recibo'} confirma el pago {isCredit ? 'recibido' : 'realizado'} de los conceptos detallados. <br /> Gracias por su confianza.
          </p>
          <div className="flex justify-around text-xs text-slate-600">
            <div className="flex flex-col items-center">
              <span className="border-t border-slate-300 w-48 pt-2">Firma de Inmobiliaria</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="border-t border-slate-300 w-48 pt-2">Firma de Inquilino</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;