
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyType, PropertyStatus, Owner, Tenant } from '../types';
import { 
  Sparkles, Save, X, Image as ImageIcon, Loader2, Wand2, Zap, 
  Droplets, Flame, Receipt, Plus, Trash2, LayoutGrid, Info, 
  Settings, CheckSquare, MapPin, Camera 
} from 'lucide-react';
import { generatePropertyDescription } from '../services/geminiService';

interface Props {
  onSave: (property: Property) => void;
  owners: Owner[];
  tenants: Tenant[];
}

const AMENITIES_LIST = [
  'Piscina', 'SUM', 'Gimnasio', 'Parrilla', 'Seguridad 24hs', 
  'Cochera', 'Balcón', 'Terraza', 'Jardín', 'Laundry', 
  'Calefacción Central', 'Aire Acondicionado', 'Ascensor'
];

const PropertyForm: React.FC<Props> = ({ onSave, owners, tenants }) => {
  const navigate = useNavigate();
  const [loadingAI, setLoadingAI] = useState(false);
  const [tone, setTone] = useState('profesional y persuasivo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    price: 0,
    expenses: 0,
    type: PropertyType.APARTMENT,
    status: PropertyStatus.AVAILABLE,
    address: '',
    neighborhood: '',
    city: 'Buenos Aires',
    ownerId: owners[0]?.id || '',
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    coveredArea: 45,
    yearBuilt: new Date().getFullYear(),
    orientation: 'Norte',
    condition: 'Excelente',
    amenities: [],
    images: [],
    electricityContract: '',
    gasContract: '',
    waterContract: '',
    taxContract: ''
  });

  const handleAI = async () => {
    if (!formData.title || !formData.address || !formData.price) {
      alert("Completa Título, Dirección y Precio para generar el texto.");
      return;
    }
    setLoadingAI(true);
    const desc = await generatePropertyDescription(formData, tone);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: explicitly cast to File to satisfy URL.createObjectURL requirements and resolve "Argument of type 'unknown' is not assignable to parameter of type 'Blob | MediaSource'" error.
      const newImages = Array.from(files).map((file: File) => URL.createObjectURL(file));
      // En un entorno real subiríamos a Firebase Storage aquí.
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      return {
        ...prev,
        amenities: current.includes(amenity) 
          ? current.filter(a => a !== amenity) 
          : [...current, amenity]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty: Property = {
      ...formData as Property,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    onSave(newProperty);
    navigate('/properties');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Nueva Propiedad</h2>
          <p className="text-slate-500">Carga detallada con inteligencia artificial y gestión multimedia.</p>
        </div>
        <button onClick={() => navigate('/properties')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={28} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO PRINCIPAL */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECCIÓN 1: UBICACIÓN Y BÁSICOS */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="p-2 bg-[var(--primary-color-50)] text-[var(--primary-color-600)] rounded-xl"><Info size={20} /></div>
              <h3 className="text-xl font-bold text-slate-800">Información de Venta / Alquiler</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Título del Anuncio</label>
                <input required type="text" placeholder="Ej: Espectacular Penthouse con Vista al Río" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)] font-medium" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Precio (ARS $)</label>
                  <input required type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Expensas (ARS $)</label>
                  <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.expenses || ''} onChange={e => setFormData({ ...formData, expenses: Number(e.target.value) })} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Dirección y Barrio</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Dirección exacta" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  <input type="text" placeholder="Barrio / Localidad" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Tipo de Propiedad</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as PropertyType })}>
                  {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Dueño Legal</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.ownerId} onChange={e => setFormData({ ...formData, ownerId: e.target.value })}>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: DETALLES TÉCNICOS */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Settings size={20} /></div>
              <h3 className="text-xl font-bold text-slate-800">Ficha Técnica</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Habitaciones</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Baños</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">m² Totales</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.area} onChange={e => setFormData({ ...formData, area: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">m² Cubiertos</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.coveredArea} onChange={e => setFormData({ ...formData, coveredArea: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Estado</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value as any })}>
                  <option value="A Estrenar">A Estrenar</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Muy Bueno">Muy Bueno</option>
                  <option value="Bueno">Bueno</option>
                  <option value="A Refaccionar">A Refaccionar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Orientación</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.orientation} onChange={e => setFormData({ ...formData, orientation: e.target.value as any })}>
                  <option value="Norte">Norte</option>
                  <option value="Sur">Sur</option>
                  <option value="Este">Este</option>
                  <option value="Oeste">Oeste</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Año Const.</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.yearBuilt} onChange={e => setFormData({ ...formData, yearBuilt: Number(e.target.value) })} />
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: AMENITIES */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckSquare size={20} /></div>
              <h3 className="text-xl font-bold text-slate-800">Amenities & Servicios del Edificio</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {AMENITIES_LIST.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    formData.amenities?.includes(amenity) 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                  }`}
                >
                  {formData.amenities?.includes(amenity) && <Plus size={14} className="inline mr-2 rotate-45" />}
                  {amenity}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: MULTIMEDIA E IA */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* MULTIMEDIA: FOTOS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Camera size={18} className="text-[var(--primary-color-600)]" />
                Galería de Fotos
              </h3>
              <span className="text-[10px] font-black text-[var(--primary-color-400)]">{formData.images?.length || 0} ARCHIVOS</span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary-color-600)] hover:bg-[var(--primary-color-50)]/50 transition-all group"
            >
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-[var(--primary-color-600)] group-hover:bg-white transition-all">
                <Plus size={32} />
              </div>
              <span className="text-xs font-bold text-slate-400">Subir Imágenes</span>
              <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 w-full bg-[var(--primary-color-600)]/90 text-white text-[8px] font-black py-1 text-center uppercase tracking-widest">Principal</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI ASSISTANT: DESCRIPCIÓN */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={20} className="text-[var(--primary-color-400)]" />
                <span className="font-bold">Generador IA</span>
              </div>
              <select className="bg-white/10 border-none text-[10px] rounded-lg px-2 py-1 outline-none" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="profesional">Profesional</option>
                <option value="persuasivo">Persuasivo</option>
                <option value="emocional">Emocional</option>
              </select>
            </div>

            <button 
              type="button" 
              onClick={handleAI}
              disabled={loadingAI}
              className="w-full py-4 bg-[var(--primary-color-600)] hover:bg-[var(--primary-color-700)] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--primary-color-shadow)]"
            >
              {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Escribir Anuncio en ARS
            </button>

            <textarea 
              rows={10}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-xs text-slate-300 focus:ring-2 focus:ring-[var(--primary-color-600)] outline-none resize-none leading-relaxed"
              placeholder="La IA analizará todos los amenities y datos técnicos para crear el mejor anuncio posible..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* BOTÓN FINAL */}
          <button 
            type="submit"
            className="w-full py-5 bg-[var(--primary-color-600)] text-white font-black text-lg rounded-[2rem] hover:bg-[var(--primary-color-700)] transition-all shadow-xl shadow-[var(--primary-color-shadow)] flex items-center justify-center gap-3"
          >
            <Save size={24} />
            GUARDAR PROPIEDAD
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;