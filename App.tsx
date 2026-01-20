import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCircle, 
  Briefcase, 
  Plus, 
  Search, 
  Sparkles, 
  LogOut,
  Zap,
  CheckSquare,
  Users2,
  ShieldAlert,
  Settings as SettingsIcon,
  Key
} from 'lucide-react';
import { Property, Owner, Lead, PropertyStatus, PropertyType, UtilityBill, User, Task, PayrollRecord, CompanyConfig, Tenant, UtilityRates } from './types';
import Dashboard from './components/Dashboard';
import PropertyList from './components/PropertyList';
import OwnerList from './components/OwnerList';
import LeadsManager from './components/LeadsManager';
import PropertyForm from './components/PropertyForm';
import AIAssistant from './components/AIAssistant';
import UtilitiesManager from './components/UtilitiesManager';
import UsersManager from './components/UsersManager';
import TasksManager from './components/TasksManager';
import SettingsManager from './components/SettingsManager';
import Login from './components/Login';
import ClientPortal from './components/ClientPortal';
import TenantsManager from './components/TenantsManager';

// Basic color utility functions
function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
}

function adjustColor(hex: string, percent: number) {
  let { r, g, b } = hexToRgb(hex);

  r = Math.round(r * (100 + percent) / 100);
  g = Math.round(g * (100 + percent) / 100);
  b = Math.round(b * (100 + percent) / 100);

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return rgbToHex(r, g, b);
}

const lightenColor = (hex: string, percent: number) => adjustColor(hex, percent);
const darkenColor = (hex: string, percent: number) => adjustColor(hex, -percent);

function hexToRgba(hex: string, alpha: number) {
  let { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DEFAULT_CONFIG: CompanyConfig = {
  name: 'InmoAI Elite',
  logoUrl: '',
  address: 'Av. Libertador 4500, Buenos Aires',
  email: 'contacto@inmoai.com',
  phone: '+54 11 4444-5555',
  website: 'www.inmoai.com',
  currency: 'ARS',
  realEstateAlias: 'INMO.AI.ELITE',
  primaryColor: '#4f46e5' // Default indigo-600
};

const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Admin Root', 
    email: 'admin@inmoai.com', 
    role: 'ADMIN', 
    avatar: 'https://ui-avatars.com/api/?name=Admin+Root&background=4f46e5&color=fff',
    baseSalary: 850000,
    hireDate: '2023-01-15',
    dni: '20-12345678-9',
    bankDetails: 'CBU: 0000003100001234567890',
    payrollHistory: []
  }
];

const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', dni: '99999999', name: 'Julian Inquilino', email: 'julian@email.com', phone: '+54 11 5555-1111', contractStart: '2024-01-01', contractEnd: '2024-05-15', rentAmount: 450000 }
];

const INITIAL_OWNERS: Owner[] = [
  { id: 'o1', dni: '12345678', name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+54 11 0000-0001', paymentAlias: 'CARLOS.RODRIGUEZ.X' },
  { id: 'o2', dni: '87654321', name: 'Marta Sánchez', email: 'marta@email.com', phone: '+54 11 0000-0002', paymentAlias: 'MARTA.CASA.PROPIA' }
];

// New: Initial utility rates
const INITIAL_UTILITY_RATES: UtilityRates = {
  electricityPricePerUnit: 150, // ARS per kWh
  gasPricePerUnit: 80, // ARS per m3
  waterPricePerUnit: 120, // ARS per m3
  municipalityFixedAmount: 15000, // Fixed monthly amount for municipality
};

const App: React.FC = () => {
  // Full integration would involve replacing localStorage usage with Firebase Firestore/Storage.
  // console.log('Firebase App Initialized:', firebaseApp.name); // Removed Firebase log

  const [authType, setAuthType] = useState<'NONE' | 'STAFF' | 'OWNER' | 'TENANT'>(() => {
    const saved = localStorage.getItem('crm_auth_type');
    return (saved as any) || 'NONE';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentClient, setCurrentClient] = useState<Owner | Tenant | null>(() => {
    const saved = localStorage.getItem('crm_current_client');
    return saved ? JSON.parse(saved) : null;
  });

  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem('crm_company_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('crm_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('crm_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('crm_properties');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('crm_owners');
    return saved ? JSON.parse(saved) : INITIAL_OWNERS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<UtilityBill[]>(() => {
    const saved = localStorage.getItem('crm_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // New: Utility Rates state
  const [utilityRates, setUtilityRates] = useState<UtilityRates>(() => {
    const saved = localStorage.getItem('crm_utility_rates');
    return saved ? JSON.parse(saved) : INITIAL_UTILITY_RATES;
  });

  useEffect(() => {
    localStorage.setItem('crm_auth_type', authType);
    localStorage.setItem('crm_current_user', JSON.stringify(currentUser));
    localStorage.setItem('crm_current_client', JSON.stringify(currentClient));
    localStorage.setItem('crm_company_config', JSON.stringify(companyConfig));
    localStorage.setItem('crm_users', JSON.stringify(users));
    localStorage.setItem('crm_tenants', JSON.stringify(tenants));
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
    localStorage.setItem('crm_properties', JSON.stringify(properties));
    localStorage.setItem('crm_owners', JSON.stringify(owners));
    localStorage.setItem('crm_leads', JSON.stringify(leads));
    localStorage.setItem('crm_bills', JSON.stringify(bills));
    localStorage.setItem('crm_utility_rates', JSON.stringify(utilityRates)); // Save utility rates
  }, [authType, currentUser, currentClient, companyConfig, users, tenants, tasks, properties, owners, leads, bills, utilityRates]);

  // Dynamic Theming Effect
  useEffect(() => {
    if (companyConfig.primaryColor) {
      const baseColor = companyConfig.primaryColor;
      document.documentElement.style.setProperty('--primary-color-50', lightenColor(baseColor, 50)); // Lightest shade for backgrounds
      document.documentElement.style.setProperty('--primary-color-100', lightenColor(baseColor, 30)); // Lighter shade
      document.documentElement.style.setProperty('--primary-color-600', baseColor); // Base color
      document.documentElement.style.setProperty('--primary-color-700', darkenColor(baseColor, 10)); // Darker shade
      document.documentElement.style.setProperty('--primary-color-gradient-from', baseColor); // Gradient start
      document.documentElement.style.setProperty('--primary-color-gradient-to', darkenColor(baseColor, 20)); // Gradient end (similar to violet)
      document.documentElement.style.setProperty('--primary-color-shadow', hexToRgba(baseColor, 0.2)); // For shadows
    }
  }, [companyConfig.primaryColor]);

  const handleLogout = () => {
    setAuthType('NONE');
    setCurrentUser(null);
    setCurrentClient(null);
  };

  const addProperty = (p: Property) => setProperties(prev => [p, ...prev]);
  const addOwner = (o: Owner) => setOwners(prev => [...prev, o]);
  
  // New function to update an owner's details
  const updateOwner = (ownerId: string, updatedFields: Partial<Owner>) => {
    setOwners(prev => prev.map(o => 
      o.id === ownerId ? { ...o, ...updatedFields } : o
    ));
  };

  const addTenant = (t: Tenant, propertyId?: string) => {
    setTenants(prev => [...prev, t]);
    if (propertyId) {
      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, tenantId: t.id, status: PropertyStatus.RENTED } 
          : p
      ));
    }
  };

  // New function to update a tenant's details
  const updateTenant = (tenantId: string, updatedFields: Partial<Tenant>) => {
    setTenants(prev => prev.map(t =>
      t.id === tenantId ? { ...t, ...updatedFields } : t
    ));
  };

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
    setProperties(prev => prev.map(p => 
      p.tenantId === id 
        ? { ...p, tenantId: undefined, status: PropertyStatus.AVAILABLE } 
        : p
    ));
  };

  const addLead = (l: Lead) => setLeads(prev => [...prev, l]);
  const addBill = (b: UtilityBill) => setBills(prev => [...prev, b]);
  const updateBillStatus = (billId: string, newStatus: UtilityBill['status'], receiptData?: {paymentMethod: string, paymentDate: string, receiptId: string}) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { 
        ...bill, 
        status: newStatus,
        ...(receiptData ? { 
          receiptId: receiptData.receiptId, 
          paymentMethod: receiptData.paymentMethod, 
          paymentDate: receiptData.paymentDate 
        } : {})
      } : bill
    ));
  };
  const addUser = (u: User) => setUsers(prev => [...prev, u]);
  const deleteUser = (id: string) => setUsers(prev => users.filter(u => u.id !== id));
  const addTask = (t: Task) => setTasks(prev => [t, ...prev]);
  const updateTask = (id: string, status: Task['status']) => 
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  if (authType === 'NONE') {
    return (
      <Login 
        users={users} 
        owners={owners}
        tenants={tenants}
        config={companyConfig}
        onLoginStaff={(user) => { setAuthType('STAFF'); setCurrentUser(user); }}
        onLoginOwner={(owner) => { setAuthType('OWNER'); setCurrentClient(owner); }}
        onLoginTenant={(tenant) => { setAuthType('TENANT'); setCurrentClient(tenant); }}
      />
    );
  }

  if ((authType === 'OWNER' || authType === 'TENANT') && currentClient) {
    return (
      <ClientPortal 
        client={currentClient}
        isOwner={authType === 'OWNER'}
        properties={properties}
        bills={bills}
        config={companyConfig}
        onLogout={handleLogout}
        onUpdateBillStatus={updateBillStatus}
        // Fix: Pass the 'owners' prop to ClientPortal
        owners={owners} 
      />
    );
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={currentUser!} config={companyConfig} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary-color-gradient-from)] to-[var(--primary-color-gradient-to)] bg-clip-text text-transparent">
                    {companyConfig.name}
                </h1>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{currentUser?.name}</p>
                        <p className="text-xs text-slate-500">{currentUser?.role}</p>
                    </div>
                    <img src={currentUser?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard properties={properties} owners={owners} leads={leads} tenants={tenants} />} />
              <Route path="/properties" element={<PropertyList properties={properties} owners={owners} />} />
              <Route path="/properties/new" element={<PropertyForm onSave={addProperty} owners={owners} tenants={tenants} />} />
              <Route 
                path="/owners" 
                element={<OwnerList 
                  owners={owners} 
                  properties={properties} 
                  bills={bills} 
                  onAdd={addOwner} 
                  onUpdateBillStatus={updateBillStatus} 
                  onUpdateOwner={updateOwner} // Pass the new updateOwner function
                />} 
              />
              <Route 
                path="/tenants" 
                element={<TenantsManager 
                  tenants={tenants} 
                  properties={properties} 
                  owners={owners} 
                  onAdd={addTenant} 
                  onDelete={deleteTenant} 
                  onUpdateTenant={updateTenant} // Pass the new updateTenant function
                  config={companyConfig} // Pass company config
                  onUpdateBillStatus={updateBillStatus} // Pass updateBillStatus
                  onAddBill={addBill} // Pass the addBill function
                />} 
              />
              <Route path="/leads" element={<LeadsManager leads={leads} onAdd={addLead} />} />
              <Route path="/tasks" element={<TasksManager tasks={tasks} users={users} currentUser={currentUser!} onAdd={addTask} onUpdateStatus={updateTask} onDelete={deleteTask} />} />
              <Route 
                path="/utilities" 
                element={isAdmin ? 
                  <UtilitiesManager 
                    properties={properties} 
                    bills={bills} 
                    onAddBill={addBill} 
                    utilityRates={utilityRates} // Pass utility rates
                    onSaveRates={setUtilityRates} // Pass function to save rates
                  /> : <NoAccess />} 
              />
              <Route path="/users" element={isAdmin ? <UsersManager users={users} onAdd={addUser} onDelete={deleteUser} onUpdatePayroll={(u, r) => {}} onUpdateUser={(u, d) => {}} /> : <NoAccess />} />
              <Route path="/settings" element={isAdmin ? <SettingsManager config={companyConfig} onSave={setCompanyConfig} /> : <NoAccess />} />
              <Route path="/ai-lab" element={<AIAssistant properties={properties} leads={leads} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const NoAccess = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="p-6 bg-red-50 text-red-500 rounded-3xl mb-4"><ShieldAlert size={64} /></div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
    <p className="text-slate-500">No tienes permisos para acceder a esta sección.</p>
  </div>
);

const Sidebar: React.FC<{ user: User; config: CompanyConfig; onLogout: () => void }> = ({ user, config, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Propiedades', icon: Home, path: '/properties' },
    { name: 'Tareas', icon: CheckSquare, path: '/tasks' },
    { name: 'Propietarios', icon: UserCircle, path: '/owners' },
    { name: 'Inquilinos', icon: Key, path: '/tenants' },
    { name: 'Servicios', icon: Zap, path: '/utilities', hidden: !isAdmin },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Usuarios', icon: Users2, path: '/users', hidden: !isAdmin },
    { name: 'Configuración', icon: SettingsIcon, path: '/settings', hidden: !isAdmin },
    { name: 'AI Lab', icon: Sparkles, path: '/ai-lab' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-400 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="w-10 h-10 bg-[var(--primary-color-600)] rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-[var(--primary-color-shadow)]">
            {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} />}
          </div>
          <span className="font-bold text-lg tracking-tight truncate">{config.name}</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.hidden) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-[var(--primary-color-600)] text-white shadow-lg shadow-[var(--primary-color-shadow)]' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <item.icon size={20} /><span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-slate-800">
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors">
          <LogOut size={20} /><span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default App;