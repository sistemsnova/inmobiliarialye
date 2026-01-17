// This file was previously App.tsx, renamed to App.jsx for consistency.
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Desktop from './pages/Desktop';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AIStudio from './pages/AIStudio';
import UnifiedCRM from './pages/UnifiedCRM';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Users from './pages/Users';
import Settings from './pages/Settings';
import SuperAdminPanel from './pages/SuperAdminPanel';
import ClientPortal from './pages/ClientPortal';
import UtilityManagement from './pages/UtilityManagement';
import BillImport from './pages/BillImport';
import Supervision from './pages/Supervision';
import Tutorial from './pages/Tutorial';
import RentalImport from './pages/RentalImport';
import { MOCK_TENANTS, MOCK_PROPERTIES, MOCK_LEADS, MOCK_TASKS, MOCK_USERS, MOCK_CASHBOXES, MOCK_TRANSACTIONS, MOCK_RENTALS, INITIAL_MODULE_SETTINGS, INITIAL_COMPANY_SETTINGS, INITIAL_DESKTOP_SHORTCUTS } from './constants';
import { persistenceService, AppDatabase } from './services/persistenceService';
import { Transaction, Property, ModuleSettings, Rental, Tenant, Lead, User, Task } from './types';
import { canAccess } from './utils/permissions';

const INITIAL_DB: AppDatabase = {
  properties: MOCK_PROPERTIES,
  leads: MOCK_LEADS,
  tasks: MOCK_TASKS,
  tenants: MOCK_TENANTS,
  rentals: MOCK_RENTALS,
  users: MOCK_USERS,
  cashBoxes: MOCK_CASHBOXES,
  transactions: MOCK_TRANSACTIONS,
  moduleSettings: INITIAL_MODULE_SETTINGS,
  companySettings: INITIAL_COMPANY_SETTINGS,
  desktopShortcuts: INITIAL_DESKTOP_SHORTCUTS,
  version: '2.6.0 Cloud',
  lastBackup: new Date().toISOString()
};

type AuthState = {
  role: 'Admin' | 'Agente' | 'Gerente' | 'SuperAdmin' | 'client' | null;
  user?: User | Tenant; // Make user type more specific
};

const App: React.FC = () => {
  const [db, setDb] = useState<AppDatabase>(INITIAL_DB);
  const [isSyncing, setIsSyncing] = useState(true);
  const [auth, setAuth] = useState<AuthState>({ role: null });
  const [activeTab, setActiveTab] = useState('desktop');
  
  const [staffUsername, setStaffUsername] = useState('');
  const [tenantDni, setTenantDni] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined; // Make unsubscribe optional

    const initFirebasePersistence = async () => {
      setIsSyncing(true);
      // Carga los datos iniciales o crea el documento en Firestore si no existe.
      const initialCloudData = await persistenceService.loadInitialData(INITIAL_DB);
      setDb(initialCloudData); // Establece el estado inicial con los datos de la nube
      setIsSyncing(false); // La carga inicial ha terminado

      // Ahora nos suscribimos a los cambios en tiempo real
      unsubscribe = persistenceService.subscribeToChanges((updatedDb) => {
        setDb(updatedDb);
        // isSyncing ya está en false, ya que las actualizaciones posteriores son incrementales
      });
    };

    initFirebasePersistence();

    return () => {
      // Desuscribirse del listener de Firebase cuando el componente se desmonta
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

  const saveToCloud = async (newDb: AppDatabase) => {
    // Al guardar en la nube, no actualizamos el estado local directamente aquí.
    // Confiamos en el listener onSnapshot de Firebase para que nos envíe la actualización
    // y luego setDb la aplique al estado. Esto asegura que la fuente de verdad es la nube.
    await persistenceService.save(newDb);
  };

  const updateDbState = (newFields: Partial<AppDatabase>) => {
    setDb(prev => {
      const updated = { ...prev, ...newFields };
      // Realizamos un guardado optimista local, pero la fuente de verdad será Firebase.
      // El listener de onSnapshot actualizará el estado con los datos de la nube.
      persistenceService.save(updated); 
      return updated;
    });
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = staffUsername.trim().toLowerCase();
    const staff = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (staff) {
      setAuth({ role: staff.role as any, user: staff });
      setActiveTab('desktop');
      setError('');
    } else {
      setError('Nombre de usuario no encontrado.');
    }
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDni = tenantDni.trim().toLowerCase();
    const tenant = db.tenants.find(t => t.dni.toLowerCase() === cleanDni);
    if (tenant) { 
      setAuth({ role: 'client', user: tenant }); 
      setError(''); 
    } else { 
      setError('DNI de inquilino no encontrado.'); 
    }
  };

  const handleLogout = () => { 
    setAuth({ role: null }); 
    setStaffUsername(''); 
    setTenantDni('');
    setError(''); 
  };

  const handleAddTransaction = (tx: Transaction) => {
    setDb(prev => {
      const newTransactions = [tx, ...prev.transactions];
      const newCashBoxes = prev.cashBoxes.map(box => {
        if (box.id === tx.cashBoxId) {
          return { ...box, balance: box.balance + (tx.type === 'Ingreso' ? tx.amount : -tx.amount) };
        }
        return box;
      });
      const updated = { ...prev, transactions: newTransactions, cashBoxes: newCashBoxes };
      persistenceService.save(updated); // Guardar en Firebase
      return updated; // Retorno optimista, será sobrescrito por onSnapshot
    });
  };

  const renderContent = () => {
    if (auth.role !== 'client' && !canAccess(auth.role, activeTab)) {
      return <Desktop db={db} setActiveTab={setActiveTab} onUpdateShortcuts={(s) => updateDbState({desktopShortcuts: s})} userRole={auth.role || undefined} />;
    }

    const isModuleActive = (key: keyof ModuleSettings) => db.moduleSettings[key];
    const fallback = <Desktop db={db} setActiveTab={setActiveTab} onUpdateShortcuts={(s) => updateDbState({desktopShortcuts: s})} userRole={auth.role || undefined} />;

    switch (activeTab) {
      case 'desktop': return fallback;
      // Fix: Pass properties and leads to Dashboard
      case 'dashboard': return isModuleActive('dashboard') ? <Dashboard properties={db.properties} leads={db.leads} /> : fallback;
      case 'supervision': return <Supervision rentals={db.rentals} tenants={db.tenants} properties={db.properties} setActiveTab={setActiveTab} />;
      case 'properties': return isModuleActive('properties') ? <Properties properties={db.properties} setProperties={(p: Property[]) => updateDbState({ properties: p})} /> : fallback;
      case 'crm': return (isModuleActive('leads') || isModuleActive('rentals')) ? (
        <UnifiedCRM 
          // Pasamos los setters para que los módulos puedan actualizar el estado y se sincronice con Firebase
          rentals={db.rentals}
          setRentals={(r) => updateDbState({ rentals: r})}
          tenants={db.tenants}
          setTenants={(t) => updateDbState({ tenants: t})}
          properties={db.properties}
          // Fix: Pass setProperties, leads, and setLeads
          setProperties={(p: Property[]) => updateDbState({ properties: p})}
          leads={db.leads}
          setLeads={(l: Lead[]) => updateDbState({ leads: l})}
          cashBoxes={db.cashBoxes}
          onAddTransaction={handleAddTransaction}
          companyName={db.companySettings.name}
        />
      ) : fallback;
      case 'utilities': return <UtilityManagement rentals={db.rentals} setRentals={(r) => updateDbState({ rentals: r})} tenants={db.tenants} />;
      case 'bill-import': return <BillImport rentals={db.rentals} setRentals={(r) => updateDbState({ rentals: r})} tenants={db.tenants} />;
      case 'rental-import': return <RentalImport 
                                      properties={db.properties} 
                                      setProperties={(p: Property[]) => updateDbState({properties: p})}
                                      tenants={db.tenants}
                                      setTenants={(t: Tenant[]) => updateDbState({tenants: t})}
                                      rentals={db.rentals}
                                      setRentals={(r: Rental[]) => updateDbState({rentals: r})}
                                    />;
      // Fix: Pass tasks, setTasks, and users to Tasks
      case 'tasks': return isModuleActive('tasks') ? <Tasks tasks={db.tasks} setTasks={(t: Task[]) => updateDbState({ tasks: t})} users={db.users} /> : fallback;
      case 'finances': return isModuleActive('finances') ? <Finances db={db} setDb={(updater: any) => {
          if (typeof updater === 'function') {
            setDb(prev => {
              const updated = updater(prev);
              persistenceService.save(updated);
              return updated;
            });
          } else {
            updateDbState(updater);
          }
      }} /> : fallback;
      // Fix: Pass users and setUsers to Users
      case 'users': return isModuleActive('users') ? <Users users={db.users} setUsers={(u: User[]) => updateDbState({ users: u})} userRole={auth.role || undefined} /> : fallback;
      case 'ai-studio': return isModuleActive('aiStudio') ? <AIStudio /> : fallback;
      case 'tutorial': return <Tutorial />;
      case 'settings': return <Settings db={db} onRestore={(d) => saveToCloud(d)} onUpdateCompany={(c) => updateDbState({ companySettings: c})} />;
      case 'master-control': return auth.role === 'SuperAdmin' ? <SuperAdminPanel settings={db.moduleSettings} onUpdateSettings={(s) => updateDbState({ moduleSettings: s})} /> : fallback;
      default: return fallback;
    }
  };

  const renderBranding = (size: 'sm' | 'lg') => {
    if (db.companySettings.displayType === 'logo' && db.companySettings.logoUrl) {
      return <img src={db.companySettings.logoUrl} alt={db.companySettings.name} className={size === 'lg' ? "h-16 object-contain mb-4" : "h-10 object-contain"} />;
    }
    const parts = db.companySettings.name.split(' ');
    const first = parts[0] || '';
    const rest = parts.slice(1).join(' ');
    return (
      <h1 className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} font-black text-slate-900 flex items-center gap-2 tracking-tighter`}>
        <span className="text-blue-600">{first}</span>
        {rest && <span className={size === 'lg' ? 'text-slate-900' : 'text-white'}>{rest}</span>}
      </h1>
    );
  };

  if (auth.role === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[4rem] shadow-2xl overflow-hidden relative z-10 border border-slate-800/20">
          <div className="p-16 bg-slate-50 flex flex-col justify-center">
            <div className="mb-12">
              {renderBranding('lg')}
              <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">Gestión Cloud Multiusuario.</p>
              {isSyncing && <p className="text-blue-600 text-[10px] font-black uppercase mt-4 animate-pulse">Sincronizando seguridad...</p>}
            </div>
            
            <form onSubmit={handleStaffLogin} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Acceso Staff (Usuario)</label>
                 <input 
                   type="text" 
                   value={staffUsername} 
                   onChange={(e) => setStaffUsername(e.target.value)} 
                   placeholder="Nombre de usuario" 
                   className="w-full p-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 font-bold" 
                 />
               </div>
               {error && staffUsername !== '' && <p className="text-red-500 text-xs font-bold px-2">❌ {error}</p>}
               <button type="submit" className="w-full p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all font-black text-sm uppercase tracking-widest shadow-xl">Ingresar Equipo</button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
               <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">Credenciales Demo</p>
               <div className="grid grid-cols-1 gap-1 mt-2">
                 <button onClick={() => { setStaffUsername('creator'); setError(''); }} className="text-[9px] text-blue-600 hover:underline font-bold text-left">🛡️ SuperAdmin: creator</button>
                 <button onClick={() => { setStaffUsername('juan'); setError(''); }} className="text-[9px] text-slate-500 hover:underline font-bold text-left">🏢 Admin: juan</button>
                 <button onClick={() => { setStaffUsername('alejandro'); setError(''); }} className="text-[9px] text-slate-500 hover:underline font-bold text-left">👤 Agente: alejandro</button>
               </div>
            </div>
          </div>
          
          <div className="p-16 bg-white flex flex-col justify-center border-l border-slate-100">
             <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3"><span className="text-blue-500">🏠</span> Portal Inquilinos</h2>
                <p className="text-slate-500 mt-2">Accede con tu DNI para ver tus recibos.</p>
             </div>
             <form onSubmit={handleClientLogin} className="space-y-6">
                <input 
                  type="text" 
                  value={tenantDni} 
                  onChange={(e) => setTenantDni(e.target.value)} 
                  placeholder="DNI del Inquilino" 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black" 
                />
                {error && tenantDni !== '' && <p className="text-red-500 text-xs font-bold">❌ {error}</p>}
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-2xl transition-all">Ingresar al Portal</button>
             </form>
             <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Inquilino Demo: 12345678X</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (auth.role === 'client' && auth.user) {
    // Fix: Pass rentals and properties to ClientPortal
    return <ClientPortal tenant={auth.user as Tenant} onLogout={handleLogout} rentals={db.rentals} properties={db.properties} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} moduleSettings={db.moduleSettings} companySettings={db.companySettings} userRole={auth.role || undefined} />
      <main className="ml-64 flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 sticky top-0 bg-slate-50/80 backdrop-blur-md z-40 py-2">
          <div className="flex items-center gap-4">
             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isSyncing ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
               {isSyncing ? 'Sincronizando...' : 'Conectado ✓'}
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{db.companySettings.name} | Rango: {auth.role}</p>
          </div>
          <div className="flex items-center gap-6" onClick={handleLogout}>
            <div className="text-right cursor-pointer hover:opacity-70 transition-opacity">
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Cerrar Sesión</p>
              <p className="text-[10px] text-slate-400 font-bold">{auth.user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center text-white font-bold">
              {auth.role?.[0]}
            </div>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;