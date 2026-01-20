
import React, { useState } from 'react';
import { Property, Owner, PropertyStatus } from '../types';
import { Search, MapPin, BedDouble, Bath, Square, ChevronRight, Plus, Filter, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  properties: Property[];
  owners: Owner[];
}

const PropertyList: React.FC<Props> = ({ properties, owners }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario de Propiedades</h2>
          <p className="text-slate-500">{properties.length} propiedades en cartera.</p>
        </div>
        <Link 
          to="/properties/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <Plus size={20} />
          Nueva Propiedad
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por título, dirección..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color-600)] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(property => (
          <div key={property.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="h-56 relative overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ImageIcon size={48} />
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2">
                {property.images && property.images.length > 1 && (
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold">
                    +{property.images.length - 1} fotos
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                  property.status === PropertyStatus.AVAILABLE ? 'bg-emerald-500 text-white' :
                  property.status === PropertyStatus.RESERVED ? 'bg-amber-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {property.status}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-lg font-black text-[var(--primary-color-600)] shadow-xl">
                  {formatCurrency(property.price)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-[var(--primary-color-600)] text-[10px] font-black uppercase tracking-widest mb-1">{property.type}</p>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-[var(--primary-color-600)] transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-slate-400 mt-2 text-xs font-medium">
                  <MapPin size={14} className="text-[var(--primary-color-400)]" />
                  <span className="line-clamp-1">{property.address}, {property.neighborhood}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-4 my-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-black text-slate-800">{property.bedrooms}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dorm</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-slate-50">
                  <span className="text-xs font-black text-slate-800">{property.bathrooms}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Baños</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-black text-slate-800">{property.area}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-color-50)] flex items-center justify-center text-[10px] font-black text-[var(--primary-color-600)]">
                    {owners.find(o => o.id === property.ownerId)?.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-600">{owners.find(o => o.id === property.ownerId)?.name}</span>
                </div>
                <button className="p-2 bg-slate-50 text-slate-400 hover:bg-[var(--primary-color-600)] hover:text-white rounded-xl transition-all shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
