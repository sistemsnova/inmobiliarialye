
import React, { useState, useRef } from 'react';
import { PropertyStatus } from '../types.js';

const PropertyForm = ({ onClose, onSave, initialData }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      address: '',
      price: 0,
      type: 'Casa',
      beds: 1,
      baths: 1,
      sqft: 0,
      status: PropertyStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      description: '',
      amenities: []
    }
  );

  const [newAmenity, setNewAmenity] = useState('');
  const [imagePreview, setImagePreview] = useState(formData.imageUrl || '');

  const handleAddAmenity = () => {
    if (newAmenity && !formData.amenities?.includes(newAmenity)) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), newAmenity]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter(a => a !== amenity)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData({ ...formData, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {initialData ? 'Editar Propiedad' : 'Publicar Nueva Propiedad'}
            </h3>
            <p className="text-sm text-slate-500">Completa los datos técnicos y visuales del inmueble.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Sección de Imagen */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Fotografía de Portada</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="md:col-span-1 h-48 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group overflow-hidden relative"
              >
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Preview" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl mb-2 block">📸</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Subir Imagen</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/90 px-4 py-2 rounded-xl text-[10px] font-black text-blue-600 uppercase shadow-lg">Cambiar Foto</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">O pega una URL de imagen</p>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={handleUrlChange}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Recomendamos imágenes en formato horizontal (16:9) para una mejor visualización en el portal.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Título del Anuncio</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Ático Duplex en Palermo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Precio (ARS)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Ubicación Completa</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Calle, Número, Ciudad"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tipo</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold"
              >
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Comercial">Comercial</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Hab.</label>
              <input
                type="number"
                value={formData.beds}
                onChange={e => setFormData({ ...formData, beds: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Baños</label>
              <input
                type="number"
                value={formData.baths}
                onChange={e => setFormData({ ...formData, baths: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">m²</label>
              <input
                type="number"
                value={formData.sqft}
                onChange={e => setFormData({ ...formData, sqft: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Comodidades / Características</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddAmenity()}
                className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="Ej: Wi-Fi, Piscina, Balcón..."
              />
              <button
                onClick={handleAddAmenity}
                className="bg-slate-800 text-white px-6 rounded-xl hover:bg-slate-700 transition-all font-bold"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.amenities?.map(a => (
                <span key={a} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border border-blue-100">
                  {a} <button onClick={() => removeAmenity(a)} className="hover:text-red-500 ml-1">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Descripción Detallada</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed"
              placeholder="Describe las ventajas de esta propiedad para captar la atención de los clientes..."
            />
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all uppercase text-[10px] tracking-widest"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all uppercase text-[10px] tracking-widest"
          >
            Guardar Propiedad
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;