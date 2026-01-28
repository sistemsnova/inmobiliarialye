// --- ENUMS (Categorías) ---
export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  SOLD = 'SOLD'
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND'
}

export enum UtilityType {
  ELECTRICITY = 'ELECTRICITY',
  GAS = 'GAS',
  WATER = 'WATER',
  TAX = 'TAX'
}

// --- ROLES DE PERSONAL ---
export type UserRole = 'ADMIN' | 'STAFF' | 'AGENT' | 'MANAGER' | 'RECEPTION' | 'OWNER' | 'TENANT';

// --- INTERFACES ---
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole; // Ahora usa el tipo UserRole extendido
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: any;
  payrollHistory?: PayrollRecord[];
}

export interface PayrollRecord {
  id: string;
  date: string;
  amount: number;
  concept: string;
}

export interface Property {
  id: string;
  address: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  ownerId: string;
  tenantId?: string;
  description?: string;
  images?: string[];
}

export interface Owner {
  id: string;
  name: string;
  cuit: string;
  email: string;
  phone: string;
  whatsapp?: string;
  balance: number;
}

export interface Tenant extends Owner {
  propertyId?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON';
  interest?: string;
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  tenantId: string;
  type: UtilityType;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: any; // Firebase Timestamp
  status: 'TODO' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CompanyConfig {
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  showLogoInSidebar: boolean;
}

export interface UtilityRates {
  electricityPricePerUnit: number;
  gasPricePerUnit: number;
  waterPricePerUnit: number;
  municipalityFixedAmount: number;
}

export interface Transaction {
  id: string;
  date: any; // Firebase Timestamp
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'ALQUILER' | 'COMISION' | 'REPARACION' | 'IMPUESTO' | 'OTROS';
}