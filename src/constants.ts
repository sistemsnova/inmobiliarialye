import { 
  LayoutDashboard, Home, Users, BadgeDollarSign, 
  Calendar, Settings, Sparkles, Archive 
} from 'lucide-react';

export const DEFAULT_CONFIG = {
  name: "InmoAI CRM",
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
  { name: 'Leads', path: '/leads', icon: BadgeDollarSign },
  { name: 'Tareas', path: '/tasks', icon: Calendar },
  { name: 'IA Lab', path: '/ai-lab', icon: Sparkles },
  { name: 'Backup', path: '/backup', icon: Archive, hidden: true },
  { name: 'Configuración', path: '/settings', icon: Settings, hidden: true }
];