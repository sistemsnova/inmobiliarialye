import React, { useState } from 'react';
import { 
  ShieldCheck, User, Lock, ArrowRight, 
  Loader2, X, Smartphone, Briefcase, 
  UserCircle, Key
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface LoginProps {
  users: any[];
  owners: any[];
  tenants: any[];
  config: any;
  onLoginStaff: (user: any) => void;
  onLoginOwner: (owner: any) => void;
  onLoginTenant: (tenant: any) => void;
}

const Login: React.FC<LoginProps> = ({ config, onLoginStaff, onLoginOwner, onLoginTenant }) => {
  const [loginType, setLoginType] = useState<'employee' | 'client'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cuit, setCuit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA PARA PERSONAL (STAFF) ---
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const userClean = username.trim();
    const passClean = password.trim();

    try {
      // 1. Acceso Maestro
      if (userClean === 'admin' && passClean === 'admin123') {
        onLoginStaff({ id: 'master', name: 'Administrador Maestro', role: 'ADMIN', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master' });
        return;
      }

      // 2. Búsqueda en Firebase
      const q = query(collection(db, 'users'), where('email', '==', userClean), where('password', '==', passClean));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        onLoginStaff({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
      } else {
        setError('Credenciales de empleado incorrectas.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA PARA INQUILINOS / DUEÑOS (DNI/CUIT) ---
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cuitClean = cuit.trim();
    if (!cuitClean) return;

    try {
      // 1. Buscamos en Inquilinos (Tenants)
      const qT = query(collection(db, 'tenants'), where('cuit', '==', cuitClean));
      const snapT = await getDocs(qT);

      if (!snapT.empty) {
        onLoginTenant({ id: snapT.docs[0].id, ...snapT.docs[0].data() });
        return;
      }

      // 2. Si no es inquilino, buscamos en Dueños (Owners)
      const qO = query(collection(db, 'owners'), where('cuit', '==', cuitClean));
      const snapO = await getDocs(qO);

      if (!snapO.empty) {
        onLoginOwner({ id: snapO.docs[0].id, ...snapO.docs[0].data() });
      } else {
        setError('No se encontró ningún cliente con ese CUIT o DNI.');
      }
    } catch (err) {
      setError('Error al validar acceso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      {/* Luces de fondo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-600 text-white rounded-[2.2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
            <Briefcase className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{config.name}</h1>
          <p className="text-slate-500 text-sm font-medium">Portal de Gestión Inmobiliaria</p>
        </div>

        {/* Selector de tipo de acceso */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1">
          <button 
            onClick={() => { setLoginType('employee'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${loginType === 'employee' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={14} /> Personal
          </button>
          <button 
            onClick={() => { setLoginType('client'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${loginType === 'client' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smartphone size={14} /> Portal Clientes
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-bounce">
            <X className="w-5 h-5" />
            <span className="font-bold text-xs uppercase">{error}</span>
          </div>
        )}

        {loginType === 'employee' ? (
          <form onSubmit={handleEmployeeLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" placeholder="admin" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              ENTRAR AL ERP
            </button>
          </form>
        ) : (
          <form onSubmit={handleClientLogin} className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CUIT o DNI</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={cuit} onChange={(e) => setCuit(e.target.value)} className="w-full pl-12 pr-4 py-5 bg-orange-50 border border-orange-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-2xl text-orange-950" placeholder="20-33445566-9" required />
              </div>
              <p className="text-[10px] text-slate-400 font-medium ml-1">Ingresa tu número sin puntos ni guiones para ver tu estado.</p>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin" /> : <Smartphone />}
              ACCEDER A MIS CUENTAS
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;