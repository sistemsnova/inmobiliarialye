import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Home, Users, UserCircle, Briefcase, Sparkles, 
  LogOut, Zap, ShieldAlert, Settings as SettingsIcon, Archive, DollarSign,
  Calendar, CheckSquare, Users2
} from 'lucide-react';

// Conexión Cloud a Firebase
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// Definición de Tipos
import { Property, Owner, Lead, User, Task, CompanyConfig, Tenant, UtilityBill, Transaction } from './types';

// Componentes del Sistema
import Dashboard from './components/Dashboard';
import PropertyList from './components/PropertyList';
import OwnerList from './components/OwnerList';
import LeadsManager from './components/LeadsManager';
import PropertyForm from './components/PropertyForm';
import AIAssistant from './components/AIAssistant';
import UtilitiesManager from './components/UtilitiesManager';
import UsersManager from './components/UsersManager';
import { TasksManager } from './components/TasksManager';
import SettingsManager from './components/SettingsManager';
import Login from './components/Login';
import ClientPortal from './components/ClientPortal';
import TenantsManager from './components/TenantsManager';
import { DollarSign } from 'lucide-react';
import BackupManager from './components/BackupManager';

// Módulos Nuevos
import { ServicesCost } from './modules/ServicesCost';
import { Finance } from './modules/Finance'; // <--- NUEVO MÓDULO
import { DEFAULT_CONFIG, INITIAL_USERS, NAV_ITEMS } from './constants';

export const App: React.FC = () => {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [authType, setAuthType] = useState<'NONE' | 'STAFF' | 'OWNER' | 'TENANT'>('NONE');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentClient, setCurrentClient] = useState<Owner | Tenant | null>(null);

  // --- ESTADOS DE DATOS (Sincronizados en tiempo real con Firebase) ---
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(DEFAULT_CONFIG);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<Transaction[]>([]);

  // --- ESCUCHADORES CLOUD (Sincronización Total entre Computadoras) ---
  useEffect(() => {
    // 1. Configuración de Empresa
    const unsubConfig = onSnapshot(doc(db, 'config', 'company'), (snap) => {
      if (snap.exists()) setCompanyConfig(snap.data() as CompanyConfig);
    });

    // 2. Colecciones principales
    const unsubProps = onSnapshot(collection(db, 'properties'), (snap) => {
      setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Property[]);
    });
    const unsubOwners = onSnapshot(collection(db, 'owners'), (snap) => {
      setOwners(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Owner[]);
    });
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      setTenants(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Tenant[]);
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as User[]);
    });
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Lead[]);
    });
    const unsubFinance = onSnapshot(collection(db, 'finance'), (snap) => {
      setFinanceTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
    });

    return () => {
      unsubConfig(); unsubProps(); unsubOwners(); unsubTenants(); unsubUsers(); unsubLeads(); unsubFinance();
    };
  }, []);

  const handleLogout = () => {
    setAuthType('NONE');
    setCurrentUser(null);
    setCurrentClient(null);
  };

  const saveConfig = async (newConfig: CompanyConfig) => {
    await setDoc(doc(db, 'config', 'company'), newConfig);
  };

  // --- CONTROL DE ACCESO ---
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

  // --- PORTAL CLIENTES ---
  if ((authType === 'OWNER' || authType === 'TENANT') && currentClient) {
    return (
      <ClientPortal 
        client={currentClient} isOwner={authType === 'OWNER'} 
        properties={properties} bills={bills} config={companyConfig}
        onLogout={handleLogout} onUpdateBillStatus={() => {}} owners={owners}
      />
    );
  }

  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={currentUser!} config={companyConfig} onLogout={handleLogout} />
        
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header Sincronizado */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
             <div className="flex items-center gap-4">
                <h1 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">
                  {companyConfig.name}
                </h1>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">Sincronización Cloud Activa</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{currentUser?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                   <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="Avatar" />
                </div>
             </div>
          </header>

          {/* Rutas y Módulos */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
            <div className="max-w-7xl mx-auto h-full">
              <Routes>
                <Route path="/" element={<Dashboard properties={properties} owners={owners} leads={leads} tenants={tenants} />} />
                <Route path="/properties" element={<PropertyList properties={properties} owners={owners} />} />
                <Route path="/owners" element={<OwnerList owners={owners} properties={properties} bills={bills} onAdd={()=>{}} onUpdateBillStatus={()=>{}} onUpdateOwner={()=>{}} />} />
                <Route path="/tenants" element={<TenantsManager tenants={tenants} properties={properties} owners={owners} onAdd={()=>{}} onDelete={()=>{}} onUpdateTenant={()=>{}} config={companyConfig} onUpdateBillStatus={()=>{}} onAddBill={()=>{}} />} />
                
                {/* --- MÓDULOS ADMINISTRATIVOS --- */}
                <Route path="/services-cost" element={<ServicesCost />} /> 
                <Route path="/finance" element={<Finance />} /> {/* ✅ RUTA FINANCIERA ACTIVA */}
                <Route path="/leads" element={<LeadsManager leads={leads} onAdd={()=>{}} />} />
                <Route path="/tasks" element={<TasksManager />} />
                <Route path="/users" element={isAdmin ? <UsersManager /> : <Navigate to="/" />} />
                <Route path="/ai-lab" element={<AIAssistant properties={properties} leads={leads} />} />
                <Route path="/settings" element={isAdmin ? <SettingsManager config={companyConfig} onSave={saveConfig} /> : <Navigate to="/" />} />
                <Route path="/backup" element={isAdmin ? <BackupManager properties={properties} setProperties={setProperties} owners={owners} setOwners={setOwners} tenants={tenants} setTenants={setTenants} leads={leads} setLeads={setLeads} users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} bills={bills} setBills={setBills} companyConfig={companyConfig} setCompanyConfig={setCompanyConfig} utilityRates={{} as any} setUtilityRates={()=>{}} currentUser={currentUser!} /> : <Navigate to="/" />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
};

// --- COMPONENTE SIDEBAR ---
const Sidebar: React.FC<{ user: User; config: CompanyConfig; onLogout: () => void }> = ({ user, config, onLogout }) => {
  const location = useLocation();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-400 shrink-0 border-r border-white/5 shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3 text-white mb-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
             <Briefcase size={20} />
          </div>
          <span className="font-black text-lg tracking-tighter italic">SISTEMS NOVA</span>
        </div>
        
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.hidden && !isAdmin) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'hover:bg-slate-800'}`}>
                <item.icon size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"><LogOut size={18} /> Salir</button>
      </div>
    </aside>
  );
};

export default App;