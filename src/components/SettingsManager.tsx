
import React, { useState, useRef } from 'react';
import { CompanyConfig } from '../types';
import { Settings, Image as ImageIcon, Globe, Mail, Phone, MapPin, Save, Briefcase, CreditCard, Palette, XCircle } from 'lucide-react';

interface Props {
  config: CompanyConfig;
  onSave: (config: CompanyConfig) => void;
}

export const SettingsManager: React.FC<Props> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<CompanyConfig>(config);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input value
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2>
          <p className="text-slate-500 text-sm">Personaliza la identidad y parámetros globales de tu agencia.</p>
        </div>
        {isSaved && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in">
            ¡Configuración guardada!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Identidad Visual</h3>
            <div className="relative group mx-auto w-32 h-32 mb-6">
              <div
                className="w-full h-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--primary-color-600)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon size={48} className="text-slate-200" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleClearLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                  title="Eliminar logo"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Haz click en el recuadro para subir un nuevo logo.</p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={20} className="text-[var(--primary-color-400)]" />
              <h3 className="font-bold">Colores de la Marca</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Color Principal</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-10 h-10 rounded-lg border-none overflow-hidden cursor-pointer"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  title="Seleccionar color principal"
                />
                <input 
                  type="text"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary-color-600)] outline-none uppercase font-mono"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Este color se usará en toda la interfaz.</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={20} className="text-[var(--primary-color-400)]" />
              <h3 className="font-bold">Pagos Agencia</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alias para Servicios</label>
              <input 
                type="text"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary-color-600)] outline-none uppercase font-mono"
                placeholder="EJ: MI.ALIA.PAGO"
                value={formData.realEstateAlias}
                onChange={e => setFormData({ ...formData, realEstateAlias: e.target.value.toUpperCase() })}
              />
              <p className="text-[10px] text-slate-400 mt-2">Este alias se mostrará a los clientes para el pago de servicios/gastos.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Briefcase size={16} />
              Información de la Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Comercial</label>
                <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp / Tel</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <button type="submit" className="w-full md:w-auto px-8 py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-2xl hover:bg-[var(--primary-color-700)] transition-all shadow-lg shadow-[var(--primary-color-shadow)] flex items-center justify-center gap-2">
                <Save size={20} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
