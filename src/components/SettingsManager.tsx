import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Building2, Palette, 
  Save, ShieldCheck, Globe, Image as ImageIcon,
  CheckCircle2, Loader2, Info
} from 'lucide-react';
import { CompanyConfig } from '../types';

interface SettingsManagerProps {
  config: CompanyConfig;
  onSave: (newConfig: CompanyConfig) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<CompanyConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulamos guardado (Aquí podrías usar setDoc en Firebase)
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Configuración General</h1>
          <p className="text-slate-500 font-medium italic">Personaliza la identidad y el diseño de tu CRM.</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-orange-900/20 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar Cambios
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL IZQUIERDO: IDENTIDAD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="text-orange-600" /> Identidad de la Inmobiliaria
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Comercial</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Color Principal (Hex)</label>
                <div className="flex gap-3">
                   <input 
                    type="color" 
                    className="w-14 h-14 rounded-xl cursor-pointer border-none bg-transparent"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-mono font-bold uppercase"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">URL del Logo (Opcional)</label>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border">
                    {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-300" />}
                 </div>
                 <input 
                  type="text" 
                  placeholder="https://tu-sitio.com/logo.png"
                  className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-medium text-sm"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
             <Info className="text-blue-600 shrink-0" />
             <p className="text-xs font-medium text-blue-800 leading-relaxed">
                <strong>Consejo Profesional:</strong> El color principal se aplicará a todos los botones, iconos y degradados del sistema automáticamente para mantener la coherencia de tu marca.
             </p>
          </div>
        </div>

        {/* PANEL DERECHO: ESTADO */}
        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-6">Vista Previa</h3>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                       <div style={{ backgroundColor: formData.primaryColor }} className="w-8 h-8 rounded-lg shadow-lg"></div>
                       <p className="font-bold text-sm">{formData.name}</p>
                    </div>
                    <div style={{ backgroundColor: formData.primaryColor }} className="w-full py-2 rounded-lg text-center text-[10px] font-black uppercase tracking-widest">
                       Botón de Prueba
                    </div>
                 </div>
              </div>
              <Palette className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 -rotate-12" />
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <ShieldCheck className="mx-auto text-green-500 mb-4" size={32} />
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Sistema Protegido</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Solo los usuarios con rango ADMIN pueden modificar estos parámetros.</p>
           </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 right-10 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-500">
           <CheckCircle2 />
           <p className="font-black uppercase text-xs tracking-widest">¡Configuración Actualizada!</p>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;