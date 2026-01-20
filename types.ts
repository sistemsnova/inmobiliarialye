
export enum PropertyStatus {
  AVAILABLE = 'Disponible',
  RESERVED = 'Reservado',
  SOLD = 'Vendido',
  RENTED = 'Alquilado'
}

export enum PropertyType {
  HOUSE = 'Casa',
  APARTMENT = 'Apartamento',
  LAND = 'Terreno',
  COMMERCIAL = 'Local Comercial',
  OFFICE = 'Oficina',
  PENTHOUSE = 'Penthouse',
  DUPLEX = 'Duplex'
}

export enum UtilityType {
  ELECTRICITY = 'Luz',
  GAS = 'Gas',
  WATER = 'Agua',
  TAXES = 'Impuestos',
  RENT = 'Alquiler',
  MANAGEMENT_FEE = 'Honorarios',
  TENANT_PAYMENT_CREDIT = 'Pago a Cuenta/Adelanto' // New type for tenant payments/advances
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  expenses?: number; // Expensas en ARS
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  neighborhood?: string;
  city?: string;
  ownerId: string;
  tenantId?: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // m2 totales
  coveredArea?: number; // m2 cubiertos
  yearBuilt?: number;
  orientation?: 'Norte' | 'Sur' | 'Este' | 'Oeste' | 'NE' | 'NO' | 'SE' | 'SO';
  condition?: 'A Estrenar' | 'Excelente' | 'Muy Bueno' | 'Bueno' | 'A Refaccionar';
  amenities: string[];
  images: string[]; // Múltiples fotos
  createdAt: string;
  // Suministros
  electricityContract?: string;
  gasContract?: string;
  waterContract?: string;
  taxContract?: string;
}

export interface Owner {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  paymentAlias?: string;
}

export interface Tenant {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone: string;
  contractStart: string;
  contractEnd: string;
  rentAmount: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId?: string;
  interest: 'BUY' | 'RENT' | 'SELL';
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATION' | 'CLOSED';
}

// Added PayrollRecord interface to fix "Module './types' has no exported member 'PayrollRecord'" errors
export interface PayrollRecord {
  id: string;
  amount: number;
  type: 'SALARY' | 'BONUS' | 'ADVANCE';
  description: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'AGENT';
  email: string;
  avatar?: string;
  baseSalary: number;
  hireDate: string;
  dni?: string;
  // Added bankDetails field to fix errors in App.tsx and UsersManager.tsx
  bankDetails?: string;
  // Updated payrollHistory to use PayrollRecord type
  payrollHistory: PayrollRecord[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignedTo: string;
  createdBy: string;
}

// Added UtilityBill interface to fix "Module './types' has no exported member 'UtilityBill'" errors
export interface UtilityBill {
  id: string;
  propertyId: string;
  type: UtilityType;
  amount: number;
  usage?: number; // Optional usage for consumption-based bills (e.g., kWh, m³)
  date: string; // Due date (or payment date for TENANT_PAYMENT_CREDIT)
  contractNumber: string;
  status: 'PENDING' | 'PAID';
  // New fields for receipt generation
  receiptId?: string;
  paymentMethod?: string;
  paymentDate?: string; // Date when the payment was actually received/registered
  description?: string; // New field for custom description for payments/advances
}

// Updated UtilityRates interface
export interface UtilityRates {
  electricityPricePerUnit: number; // Price per kWh
  gasPricePerUnit: number;         // Price per m³
  waterPricePerUnit: number;       // Price per m³
  municipalityFixedAmount: number; // Fixed monthly amount for municipality/taxes
}

export interface CompanyConfig {
  name: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  currency: string;
  realEstateAlias: string;
  primaryColor: string; // New field for theme customization
}
