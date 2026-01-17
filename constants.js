
import { PropertyStatus, LeadStatus } from './types.js';

export const INITIAL_MODULE_SETTINGS = {
  properties: true,
  rentals: true,
  leads: true,
  tasks: true,
  finances: true,
  users: true,
  aiStudio: true,
  dashboard: true
};

export const INITIAL_DESKTOP_SHORTCUTS = [
  'properties',
  'rentals',
  'leads',
  'tasks',
  'finances',
  'users',
  'ai-studio',
  'dashboard'
];

export const INITIAL_COMPANY_SETTINGS = {
  name: 'Gestión Inmobiliaria',
  logoUrl: '',
  address: 'Dirección de la Empresa',
  phone: '+54 11 0000 0000',
  email: 'admin@inmobiliaria.com',
  displayType: 'name',
  emailSettings: {
    provider: 'gmail',
    senderEmail: 'admin@inmobiliaria.com'
  }
};

export const MOCK_USERS = [
  { 
    id: 'SUPER_CREATOR', 
    name: 'Creador Master', 
    username: 'creator',
    role: 'SuperAdmin', 
    email: 'creator@cloudestate.pro', 
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    baseSalary: 1000000,
    payrollHistory: []
  },
  { 
    id: 'U3', 
    name: 'Juan Román', 
    username: 'juan',
    role: 'Admin', 
    email: 'juan@cloudestate.pro', 
    avatar: 'https://i.pravatar.cc/150?u=u3',
    baseSalary: 900000,
    payrollHistory: []
  },
  { 
    id: 'U1', 
    name: 'Alejandro Pérez', 
    username: 'alejandro',
    role: 'Agente', 
    email: 'alejandro@cloudestate.pro', 
    avatar: 'https://i.pravatar.cc/150?u=u1',
    baseSalary: 450000,
    payrollHistory: [
      { id: 'PT1', date: '2024-05-01', amount: 450000, type: 'Sueldo', concept: 'Sueldo Abril' },
      { id: 'PT2', date: '2024-05-15', amount: 50000, type: 'Adelanto', concept: 'Adelanto gastos personales' }
    ]
  },
  { 
    id: 'U2', 
    name: 'Laura Martínez', 
    username: 'laura',
    role: 'Gerente', 
    email: 'laura@cloudestate.pro', 
    avatar: 'https://i.pravatar.cc/150?u=u2',
    baseSalary: 750000,
    payrollHistory: [
      { id: 'PT3', date: '2024-05-01', amount: 750000, type: 'Sueldo', concept: 'Sueldo Abril' }
    ]
  }
];

export const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Villa de Lujo con Vistas al Mar',
    address: 'Calle del Mar 123, Mar del Plata',
    price: 350000000,
    type: 'Casa',
    beds: 5,
    baths: 4,
    sqft: 450,
    status: PropertyStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    description: 'Hermosa villa de lujo ubicada en una zona exclusiva con impresionantes vistas al mar y comodidades modernas.',
    amenities: ['Piscina', 'Cochera Doble', 'Seguridad 24hs', 'Quincho']
  },
  {
    id: '2',
    title: 'Ático Moderno en el Centro',
    address: 'Av. Corrientes 450, CABA',
    price: 180000000,
    type: 'Apartamento',
    beds: 3,
    baths: 2,
    sqft: 180,
    status: PropertyStatus.RENTED,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    description: 'Espacioso ático con vistas panorámicas de la ciudad y acabados de alta gama.',
    amenities: ['Balcón Terraza', 'Losa Radiante', 'Gimnasio', 'Sum']
  },
  {
    id: '3',
    title: 'Casa Suburbana Minimalista',
    address: 'Pilar del Este, Buenos Aires',
    price: 95000000,
    type: 'Casa',
    beds: 4,
    baths: 3,
    sqft: 220,
    status: PropertyStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Casa familiar perfecta en un vecindario tranquilo con un gran patio trasero.',
    amenities: ['Jardín', 'Parrilla', 'Cochera', 'Lavadero']
  }
];

export const MOCK_TENANTS = [
  { id: 'T1', name: 'Carlos Mendoza', dni: '12345678X', phone: '+54 11 2222 3333', email: 'carlos.m@example.com' },
  { id: 'T2', name: 'Elena Rius', dni: '87654321Y', phone: '+54 11 5555 4444', email: 'elena.rius@example.com' }
];

export const MOCK_RENTALS = [
  {
    id: 'R1',
    propertyId: '2',
    tenantId: 'T1',
    monthlyRent: 450000,
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    debt: 520000,
    meters: { electricity: 4520, water: 310, gas: 120, lastUpdated: '2024-04-15' },
    charges: [
      { id: 'C1', type: 'Alquiler', amount: 450000, dueDate: '2024-05-01', status: 'Pendiente', description: 'Mes Mayo 2024' },
      { id: 'C2', type: 'Luz', amount: 45000, dueDate: '2024-05-15', status: 'Pendiente', description: 'Periodo 04/24' },
      { id: 'C3', type: 'Agua', amount: 25000, dueDate: '2024-05-15', status: 'Pendiente', description: 'Periodo 04/24' }
    ],
    payments: [
      { id: 'P1', date: '2024-04-01', amount: 450000, concept: 'Alquiler Abril', status: 'Pagado' }
    ]
  }
];

export const MOCK_LEADS = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com', phone: '+54 11 6000 0001', status: LeadStatus.NEW, interestedIn: '1', budget: 400000000, source: 'Web', createdAt: '2024-05-01' },
  { id: '2', name: 'María García', email: 'maria@example.com', phone: '+54 11 6000 0002', status: LeadStatus.VIEWING, interestedIn: '2', budget: 200000000, source: 'Zillow', createdAt: '2024-05-05' },
  { id: '3', name: 'Roberto Smith', email: 'robert@example.com', phone: '+54 11 6000 0003', status: LeadStatus.NEGOTIATION, interestedIn: '1', budget: 350000000, source: 'Referido', createdAt: '2024-05-10' }
];

export const MOCK_TASKS = [
  { id: '1', title: 'Llamar a Juan Pérez por la Villa', dueDate: '2024-05-20', priority: 'Alta', completed: false, assignedTo: 'U1' },
  { id: '2', title: 'Actualizar listados web', dueDate: '2024-05-21', priority: 'Media', completed: true, assignedTo: 'all' },
  { id: '3', title: 'Reunión de cierre por el Ático', dueDate: '2024-05-22', priority: 'Alta', completed: false, assignedTo: 'U2' }
];

export const MOCK_CASHBOXES = [
  { id: 'CB1', name: 'Caja Principal', balance: 1250000, description: 'Caja general de la inmobiliaria' },
  { id: 'CB2', name: 'Fondo Alquileres', balance: 850000, description: 'Fondos recaudados de rentas' },
  { id: 'CB3', name: 'Caja Gastos', balance: 120000, description: 'Caja chica para mantenimiento' }
];

export const MOCK_TRANSACTIONS = [
  { id: 'TR1', date: '2024-05-15', amount: 450000, type: 'Ingreso', concept: 'Cobro Alquiler Unidad 2', cashBoxId: 'CB2', category: 'Alquileres' },
  { id: 'TR2', date: '2024-05-16', amount: 15000, type: 'Egreso', concept: 'Reparación de cañería', cashBoxId: 'CB3', category: 'Mantenimiento' },
  { id: 'TR3', date: '2024-05-17', amount: 80000, type: 'Ingreso', concept: 'Comisión Venta Terreno', cashBoxId: 'CB1', category: 'Comisiones' }
];