
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.js';
import Desktop from './pages/Desktop.js';
import Dashboard from './pages/Dashboard.js';
import Properties from './pages/Properties.js';
import AIStudio from './pages/AIStudio.js';
import UnifiedCRM from './pages/UnifiedCRM.js';
import Tasks from './pages/Tasks.js';
import Finances from './pages/Finances.js';
import Users from './pages/Users.js';
import Settings from './pages/Settings.js';
import SuperAdminPanel from './pages/SuperAdminPanel.js';
import ClientPortal from './pages/ClientPortal.js';
import UtilityManagement from './pages/UtilityManagement.js';
import BillImport from './pages/BillImport.js';
import Supervision from './pages/Supervision.js';
import Tutorial from './pages/Tutorial.js';
import RentalImport from './pages/RentalImport.js';
import { MOCK_TENANTS, MOCK_PROPERTIES, MOCK_LEADS, MOCK_TASKS, MOCK_USERS, MOCK_CASHBOXES, MOCK_TRANSACTIONS, MOCK_RENTALS, INITIAL_MODULE_SETTINGS, INITIAL_COMPANY_SETTINGS, INITIAL_DESKTOP_SHORTCUTS } from './constants.js';
import { persistenceService } from './services/persistenceService.js';
import { canAccess } from './utils/permissions.js';

const INITIAL_DB = {
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

const App = () => {
  const [db, setDb] = useState(INITIAL_DB);
  const [isSyncing, setIsSyncing] = useState(true);
  const [auth, setAuth] = useState({ role: null });
  const [activeTab, setActiveTab] = useState('desktop');
  
  const [staffUsername, setStaffUsername] = useState('');
  const [tenantDni, setTenantDni] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe;

    const initFirebasePersistence = async () => {
      setIsSyncing(true);
      const initialCloudData = await persistenceService.loadInitialData(INITIAL_DB);
      setDb(initialCloudData);
      setIsSyncing(false);

      unsubscribe = persistenceService.subscribeToChanges((updatedDb) => {
        setDb(updatedDb);
      });
    };

    initFirebasePersistence();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const saveToCloud = async (newDb) => {
    await persistenceService.save(newDb);
  };

  const updateDbState = (newFields) => {
    setDb(prev => {
      const updated = { ...prev, ...newFields };
      persistenceService.save(updated); 
      return updated;
    });
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    const cleanUsername = staffUsername.trim().toLowerCase();
    const staff = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (staff) {
      setAuth({ role: staff.role, user: staff });
      setActiveTab('desktop');
      setError('');
    } else {
      setError('Nombre de usuario no encontrado.');
    }
  };

  const handleClientLogin = (e) => {
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

  const handleAddTransaction = (tx) => {
    setDb(prev => {
      const newTransactions = [tx, ...prev.transactions];
      const newCashBoxes = prev.cashBoxes.map(box => {
        if (box.id === tx.cashBoxId) {
          return { ...box, balance: box.balance + (tx.type === 'Ingreso' ? tx.amount : -tx.amount) };
        }
        return box;
      });
      const updated = { ...prev, transactions: newTransactions, cashBoxes: newCashBoxes };
      persistenceService.save(updated);
      return updated;
    });
  };

  const renderContent = () => {
    if (auth.role !== 'client' && !canAccess(auth.role, activeTab)) {
      return <Desktop db={db} setActiveTab={setActiveTab} onUpdateShortcuts={(s) => updateDbState({desktopShortcuts: s})} userRole={auth.role} />;
    }

    const isModuleActive = (key) => db.moduleSettings[key];
    const fallback = <Desktop db={db} setActiveTab={setActiveTab} onUpdateShortcuts={(s) => updateDbState({desktopShortcuts: s})} userRole={auth.role} />;

    switch (activeTab) {
      case 'desktop': return fallback;
      case 'dashboard': return isModuleActive('dashboard') ? <Dashboard properties={db.properties} leads={db.leads} /> : fallback;
      case 'supervision': return <Supervision rentals={db.rentals} tenants={db.tenants} properties={db.properties} setActiveTab={setActiveTab} />;
      case 'properties': return isModuleActive('properties') ? <Properties properties={db.properties} setProperties={(p) => updateDbState({ properties: p})} /> : fallback;
      case 'crm': return (isModuleActive('leads') || isModuleActive('rentals')) ? (
        <UnifiedCRM 
          rentals={db.rentals}
          setRentals={(r) => updateDbState({ rentals: r})}
          tenants={db.tenants}
          setTenants={(t) => updateDbState({ tenants: t})}
          properties={db.properties}
          setProperties={(p) => updateDbState({ properties: p})}
          leads={db.leads}
          setLeads={(l) => updateDbState({ leads: l})}
          cashBoxes={db.cashBoxes}
          onAddTransaction={handleAddTransaction}
          companyName={db.companySettings.name}
        />
      ) : fallback;
      case 'utilities': return <UtilityManagement rentals={db.rentals} setRentals={(r) => updateDbState({ rentals: r})} tenants={db.tenants} />;
      case 'bill-import': return <BillImport rentals={db.rentals} setRentals={(r) => updateDbState({ rentals: r})} tenants={db.tenants} />;
      case 'rental-import': return <RentalImport 
                                      properties={db.properties} 
                                      setProperties={(p) => updateDbState({properties: p})}
                                      tenants={db.tenants}
                                      setTenants={(t) => updateDbState({tenants: t})}
                                      rentals={db.rentals}
                                      setRentals={(r) => updateDbState({rentals: r})}
                                    />;
      case 'tasks': return isModuleActive('tasks') ? <Tasks tasks={db.tasks} setTasks={(t) => updateDbState({ tasks: t})} users={db.users} /> : fallback;
      case 'finances': return isModuleActive('finances') ? <Finances db={db} setDb={(updater) => {
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
      case 'users': return isModuleActive('users') ? <Users users={db.users} setUsers={(u) => updateDbState({ users: u})} userRole={auth.role} /> : fallback;
      case 'ai-studio': return isModuleActive('aiStudio') ? <AIStudio /> : fallback;
      case 'tutorial': return <Tutorial />;
      case 'settings': return <Settings db={db} onRestore={(d) => saveToCloud(d)} onUpdateCompany={(c) => updateDbState({ companySettings: c})} />;
      case 'master-control': return auth.role === 'SuperAdmin' ? <SuperAdminPanel settings={db.moduleSettings} onUpdateSettings={(s) => updateDbState({ moduleSettings: s})} /> : fallback;
      default: return fallback;
    }
  };

  const renderBranding = (size) => {
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
    return <ClientPortal tenant={auth.user} onLogout={handleLogout} rentals={db.rentals} properties={db.properties} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} moduleSettings={db.moduleSettings} companySettings={db.companySettings} userRole={auth.role} />
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