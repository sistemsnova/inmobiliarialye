import { 
  LayoutDashboard, 
  Home, 
  Users, 
  BadgeDollarSign, 
  Calendar, 
  Settings, 
  Sparkles, 
  Archive, 
  Zap, 
  UserCog,
  Users2, // <--- ESTA ES LA LÍNEA QUE ARREGLA EL ERROR
  CheckSquare
} from 'lucide-react';

export const DEFAULT_CONFIG = {
  name: "Sistems Nova CRM",
  primaryColor: "#ea580c",
  logoUrl: null,
  showLogoInSidebar: true
};

export const INITIAL_USERS = [
  { 
    id: '1', 
    name: 'Admin', 
    email: 'admin@inmoai.com', 
    role: 'ADMIN', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' 
  }
];

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Propiedades', path: '/properties', icon: Home },
  { name: 'Clientes', path: '/owners', icon: Users },
  { name: 'Inquilinos', path: '/tenants', icon: Users },
  { name: 'Costos Servicios', path: '/services-cost', icon: Zap },
  { name: 'Leads', path: '/leads', icon: BadgeDollarSign },
  { name: 'Tareas', path: '/tasks', icon: Calendar },
  { name: 'Personal', path: '/users', icon: Users2, hidden: true },
  { name: 'IA Lab', path: '/ai-lab', icon: Sparkles },
  { name: 'Backup', path: '/backup', icon: Archive, hidden: true },
  { name: 'Finanzas', path: '/finance', icon: DollarSign },
  { name: 'Configuración', path: '/settings', icon: Settings, hidden: true }
];