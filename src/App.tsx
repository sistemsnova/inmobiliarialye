
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCircle, 
  Briefcase, 
  Sparkles, 
  LogOut,
  Zap,
  CheckSquare,
  Users2,
  ShieldAlert,
  Settings as SettingsIcon,
  Key,
  Archive
} from 'lucide-react';
import { Property, Owner, Lead, PropertyStatus, PropertyType, UtilityBill, User, Task, PayrollRecord, CompanyConfig, Tenant, UtilityRates } from './types';
import  Dashboard  from './components/Dashboard';
import  PropertyList  from './components/PropertyList';
import  OwnerList  from './components/OwnerList';
import  LeadsManager  from './components/LeadsManager';
import  PropertyForm  from './components/PropertyForm';
import  AIAssistant  from './components/AIAssistant';
import  UtilitiesManager  from './components/UtilitiesManager';
import  UsersManager  from './components/UsersManager';
import  TasksManager  from './components/TasksManager';
import  SettingsManager  from './components/SettingsManager';
import Login from './components/Login';
import  ClientPortal  from './components/ClientPortal';
import  TenantsManager  from './components/TenantsManager';
import BackupManager from './components/BackupManager';
import { FirebaseProvider } from './context/FirebaseContext';
import { DEFAULT_CONFIG, INITIAL_USERS, NAV_ITEMS } from './constants';


// Color utilities
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

export const App: React.FC = () => {
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

  // Data States
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem('crm_company_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('crm_properties');
    return saved ? JSON.parse(saved) : [];
  });

  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('crm_owners');
    return saved ? JSON.parse(saved) : [];
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('crm_tenants');
    return saved ? JSON.parse(saved) : [];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<UtilityBill[]>(() => {
    const saved = localStorage.getItem('crm_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('crm_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [utilityRates, setUtilityRates] = useState<UtilityRates>(() => {
    const saved = localStorage.getItem('crm_utility_rates');
    return saved ? JSON.parse(saved) : {
      electricityPricePerUnit: 150,
      gasPricePerUnit: 80,
      waterPricePerUnit: 120,
      municipalityFixedAmount: 15000,
    };
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('crm_auth_type', authType);
    localStorage.setItem('crm_current_user', JSON.stringify(currentUser));
    localStorage.setItem('crm_current_client', JSON.stringify(currentClient));
    localStorage.setItem('crm_company_config', JSON.stringify(companyConfig));
    localStorage.setItem('crm_properties', JSON.stringify(properties));
    localStorage.setItem('crm_owners', JSON.stringify(owners));
    localStorage.setItem('crm_tenants', JSON.stringify(tenants));
    localStorage.setItem('crm_leads', JSON.stringify(leads));
    localStorage.setItem('crm_bills', JSON.stringify(bills));
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
    localStorage.setItem('crm_users', JSON.stringify(users));
    localStorage.setItem('crm_utility_rates', JSON.stringify(utilityRates));
  }, [authType, currentUser, currentClient, companyConfig, properties, owners, tenants, leads, bills, tasks, users, utilityRates]);

  useEffect(() => {
    if (companyConfig.primaryColor) {
      const baseColor = companyConfig.primaryColor;
      document.documentElement.style.setProperty('--primary-color-50', lightenColor(baseColor, 50));
      document.documentElement.style.setProperty('--primary-color-100', lightenColor(baseColor, 30));
      document.documentElement.style.setProperty('--primary-color-600', baseColor);
      document.documentElement.style.setProperty('--primary-color-700', darkenColor(baseColor, 10));
      document.documentElement.style.setProperty('--primary-color-gradient-from', baseColor);
      document.documentElement.style.setProperty('--primary-color-gradient-to', darkenColor(baseColor, 20));
      document.documentElement.style.setProperty('--primary-color-shadow', hexToRgba(baseColor, 0.2));
    }
  }, [companyConfig.primaryColor]);

  const handleLogout = () => {
    setAuthType('NONE');
    setCurrentUser(null);
    setCurrentClient(null);
  };

  // --- CRUD Functions ---
  const addProperty = (p: Property) => setProperties([...properties, p]);
  const addOwner = (o: Owner) => setOwners([...owners, o]);
  const updateOwner = (id: string, fields: Partial<Owner>) => 
    setOwners(owners.map(o => o.id === id ? { ...o, ...fields } : o));
  
  const addTenant = (t: Tenant, propertyId?: string) => {
    setTenants([...tenants, t]);
    if (propertyId) {
      setProperties(properties.map(p => p.id === propertyId ? { ...p, tenantId: t.id, status: PropertyStatus.RENTED } : p));
    }
  };
  const updateTenant = (id: string, fields: Partial<Tenant>) =>
    setTenants(tenants.map(t => t.id === id ? { ...t, ...fields } : t));
  const deleteTenant = (id: string) => {
    setProperties(properties.map(p => p.tenantId === id ? { ...p, tenantId: undefined, status: PropertyStatus.AVAILABLE } : p));
    setTenants(tenants.filter(t => t.id !== id));
  };

  const addLead = (l: Lead) => setLeads([...leads, l]);
  const addBill = (b: UtilityBill) => setBills([...bills, b]);
  const updateBillStatus = (id: string, status: UtilityBill['status'], data?: any) =>
    setBills(bills.map(b => b.id === id ? { ...b, status, ...data } : b));

  const addUser = (u: User) => setUsers([...users, u]);
  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));
  const updatePayroll = (userId: string, record: PayrollRecord) =>
    setUsers(users.map(u => u.id === userId ? { ...u, payrollHistory: [...u.payrollHistory, record] } : u));
  const updateUser = (userId: string, data: Partial<User>) =>
    setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));

  const addTask = (t: Task) => setTasks([...tasks, t]);
  const updateTask = (id: string, status: Task['status']) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  if (authType === 'NONE') {
    return (
      <Login 
        users={users} owners={owners} tenants={tenants} config={companyConfig}
        onLoginStaff={(u) => { setAuthType('STAFF'); setCurrentUser(u); }}
        onLoginOwner={(o) => { setAuthType('OWNER'); setCurrentClient(o); }}
        onLoginTenant={(t) => { setAuthType('TENANT'); setCurrentClient(t); }}
      />
    );
  }

  if ((authType === 'OWNER' || authType === 'TENANT') && currentClient) {
    return (
      <ClientPortal 
        client={currentClient} isOwner={authType === 'OWNER'} 
        properties={properties} bills={bills} config={companyConfig}
        onLogout={handleLogout} onUpdateBillStatus={updateBillStatus} owners={owners}
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
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.role}</p>
                </div>
                <img src={currentUser?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard properties={properties} owners={owners} leads={leads} tenants={tenants} />} />
              <Route path="/properties" element={<PropertyList properties={properties} owners={owners} />} />
              <Route path="/properties/new" element={<PropertyForm onSave={addProperty} owners={owners} tenants={tenants} />} />
              <Route path="/owners" element={<OwnerList owners={owners} properties={properties} bills={bills} onAdd={addOwner} onUpdateBillStatus={updateBillStatus} onUpdateOwner={updateOwner} />} />
              <Route path="/tenants" element={<TenantsManager tenants={tenants} properties={properties} owners={owners} onAdd={addTenant} onDelete={deleteTenant} onUpdateTenant={updateTenant} config={companyConfig} onUpdateBillStatus={updateBillStatus} onAddBill={addBill} />} />
              <Route path="/leads" element={<LeadsManager leads={leads} onAdd={addLead} />} />
              <Route path="/tasks" element={<TasksManager tasks={tasks} users={users} currentUser={currentUser!} onAdd={addTask} onUpdateStatus={updateTask} onDelete={deleteTask} />} />
              <Route path="/utilities" element={isAdmin ? <UtilitiesManager properties={properties} bills={bills} onAddBill={addBill} utilityRates={utilityRates} onSaveRates={setUtilityRates} /> : <NoAccess />} />
              <Route path="/users" element={isAdmin ? <UsersManager users={users} onAdd={addUser} onDelete={deleteUser} onUpdatePayroll={updatePayroll} onUpdateUser={updateUser} /> : <NoAccess />} />
              <Route path="/settings" element={isAdmin ? <SettingsManager config={companyConfig} onSave={setCompanyConfig} /> : <NoAccess />} />
              <Route path="/ai-lab" element={<AIAssistant properties={properties} leads={leads} />} />
              <Route path="/backup" element={isAdmin ? <BackupManager properties={properties} setProperties={setProperties} owners={owners} setOwners={setOwners} tenants={tenants} setTenants={setTenants} leads={leads} setLeads={setLeads} users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} bills={bills} setBills={setBills} companyConfig={companyConfig} setCompanyConfig={setCompanyConfig} utilityRates={utilityRates} setUtilityRates={setUtilityRates} currentUser={currentUser!} /> : <NoAccess />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export const NoAccess = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="p-6 bg-red-50 text-red-500 rounded-3xl mb-4"><ShieldAlert size={64} /></div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
    <p className="text-slate-500">No tienes permisos para acceder a esta sección.</p>
  </div>
);

export const Sidebar: React.FC<{ user: User; config: CompanyConfig; onLogout: () => void }> = ({ user, config, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'ADMIN';

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
          {NAV_ITEMS.map((item) => {
            if (item.hidden && !isAdmin) return null; // Simplified logic, as hidden items are only for admin
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