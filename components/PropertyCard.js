
import React from 'react';
import { PropertyStatus } from '../types.js';

const PropertyCard = ({ property, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case PropertyStatus.AVAILABLE: return 'bg-green-100 text-green-700';
      case PropertyStatus.RESERVED: return 'bg-yellow-100 text-yellow-700';
      case PropertyStatus.SOLD: return 'bg-red-100 text-red-700';
      case PropertyStatus.RENTED: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col h-full">
      <div className="relative h-52 overflow-hidden shrink-0">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-slate-900 font-bold shadow-md border border-slate-100">
          ${property.price.toLocaleString()}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{property.title}</h3>
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
            📍 {property.address}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-1.5 h-14 overflow-hidden content-start">
            {property.amenities.map(amenity => (
              <span key={amenity} className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-100">
                {amenity}
              </span>
            ))}
            {property.amenities.length === 0 && (
              <span className="text-slate-300 italic text-[10px]">Sin características especificadas</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 shrink-0">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Hab.</span>
              <span className="font-bold text-slate-700">{property.beds}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Baños</span>
              <span className="font-bold text-slate-700">{property.baths}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Area</span>
              <span className="font-bold text-slate-700">{property.sqft} m²</span>
            </div>
          </div>
          <button 
            onClick={() => onSelect?.(property)}
            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;