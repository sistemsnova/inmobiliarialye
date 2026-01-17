
import React, { useState } from 'react';
import PropertyCard from '../components/PropertyCard.js';
import PropertyForm from '../components/PropertyForm.js';
import { PropertyStatus } from '../types.js';

const Properties = ({ properties, setProperties }) => {
  const [filter, setFilter] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const filtered = filter === 'All' 
    ? properties 
    : properties.filter(p => p.type === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case PropertyStatus.AVAILABLE: return 'bg-green-100 text-green-700';
      case PropertyStatus.RESERVED: return 'bg-yellow-100 text-yellow-700';
      case PropertyStatus.SOLD: return 'bg-red-100 text-red-700';
      case PropertyStatus.RENTED: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSaveProperty = (propertyData) => {
    const newProperty = {
      id: propertyData.id || `PROP-${Math.random().toString(36).substr(2, 5)}`,
      title: propertyData.title || 'Propiedad sin título',
      address: propertyData.address || 'Dirección no especificada',
      price: propertyData.price || 0,
      type: propertyData.type || 'Casa',
      beds: propertyData.beds || 0,
      baths: propertyData.baths || 0,
      sqft: propertyData.sqft || 0,
      status: propertyData.status || PropertyStatus.AVAILABLE,
      imageUrl: propertyData.imageUrl || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      description: propertyData.description || '',
      amenities: propertyData.amenities || []
    };

    if (propertyData.id) {
      setProperties(properties.map(p => p.id === propertyData.id ? newProperty : p));
    } else {
      setProperties([newProperty, ...properties]);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Listados del Portafolio</h2>
          <p className="text-slate-500 mt-1 font-medium">Gestiona y haz seguimiento de tus propiedades disponibles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
          >
            <option value="All">Todos los Tipos</option>
            <option value="Casa">Casas</option>
            <option value="Apartamento">Apartamentos</option>
            <option value="Comercial">Comerciales</option>
          </select>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
          >
            + Nueva Propiedad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onSelect={(p) => setSelectedProperty(p)} 
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center text-slate-400">
            <span className="text-5xl mb-4 block">🏡</span>
            <p className="font-medium">No hay propiedades que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <PropertyForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveProperty}
          initialData={selectedProperty || undefined}
        />
      )}
    </div>
  );
};

export default Properties;