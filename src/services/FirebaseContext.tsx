import React, { createContext, useContext } from 'react';

const FirebaseContext = createContext<any>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Aquí simulamos las funciones de Firebase pero usando LocalStorage
  const value = {
    updateProduct: async (id: string, data: any) => {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const updated = products.map((p: any) => p.id === id ? { ...p, ...data } : p);
      localStorage.setItem('products', JSON.stringify(updated));
    },
    fetchProductsPaginatedAndFiltered: async () => {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      return { products };
    },
    // Añade aquí más funciones si otros módulos las piden
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);