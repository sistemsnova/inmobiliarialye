
import React, { useState } from 'react';
import { User, Owner, Tenant, CompanyConfig } from '../types';
import { Briefcase, User as UserIcon, ShieldCheck, LogIn, ChevronRight, Key } from 'lucide-react';

interface Props {
  users: User[];
  owners: Owner[];
  tenants: Tenant[];
  config: CompanyConfig;
  onLoginStaff: (user: User) => void;
  onLoginOwner: (owner: Owner) => void;
  onLoginTenant: (tenant: Tenant) => void;
}

const Login: React.FC<Props> = ({ users, owners, tenants, config, onLoginStaff, onLoginOwner, onLoginTenant }) => {
  const [mode, setMode] = useState<'SELECT' | 'STAFF' | 'OWNER' | 'TENANT'>('SELECT');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.name.toLowerCase() === inputValue.toLowerCase());
    if (user) onLoginStaff(user);
    else setError('Usuario no encontrado.');
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = owners.find(o => o.dni === inputValue);
    if (owner) onLoginOwner(owner);
    else setError('DNI no registrado como propietario.');
  };

  const handleTenantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.dni === inputValue);
    if (tenant) onLoginTenant(tenant);
    else setError('DNI no registrado como inquilino.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--primary-color-600)] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[var(--primary-color-shadow)] mb-4 overflow-hidden">
            {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <Briefcase size={40} className="text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{config.name}</h1>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          {mode === 'SELECT' ? (
            <div className="p-8 space-y-3">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Identifícate para ingresar</h2>
              <button onClick={() => setMode('STAFF')} className="w-full p-5 bg-slate-50 hover:bg-[var(--primary-color-50)] border border-slate-100 rounded-2xl flex items-center gap-4 transition-all">
                <ShieldCheck className="text-[var(--primary-color-600)]" />
                <div className="text-left"><p className="font-bold text-slate-800">Staff</p><p className="text-[10px] text-slate-500">Panel administrativo</p></div>
              </button>
              <button onClick={() => setMode('OWNER')} className="w-full p-5 bg-slate-50 hover:bg-[var(--primary-color-50)] border border-slate-100 rounded-2xl flex items-center gap-4 transition-all">
                <UserIcon className="text-[var(--primary-color-600)]" />
                <div className="text-left"><p className="font-bold text-slate-800">Propietario</p><p className="text-[10px] text-slate-500">Ver mis propiedades</p></div>
              </button>
              <button onClick={() => setMode('TENANT')} className="w-full p-5 bg-slate-50 hover:bg-[var(--primary-color-50)] border border-slate-100 rounded-2xl flex items-center gap-4 transition-all">
                <Key className="text-[var(--primary-color-600)]" />
                <div className="text-left"><p className="font-bold text-slate-800">Inquilino / Cliente</p><p className="text-[10px] text-slate-500">Pagar alquiler y servicios</p></div>
              </button>
            </div>
          ) : (
            <div className="p-8">
              <button onClick={() => { setMode('SELECT'); setError(''); setInputValue(''); }} className="text-xs font-bold text-[var(--primary-color-600)] mb-4">&larr; Volver</button>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {mode === 'STAFF' ? 'Ingreso Staff' : mode === 'OWNER' ? 'Portal Propietario' : 'Portal Inquilino'}
              </h2>
              <form onSubmit={mode === 'STAFF' ? handleStaffLogin : mode === 'OWNER' ? handleOwnerLogin : handleTenantLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{mode === 'STAFF' ? 'Nombre' : 'DNI'}</label>
                  <input required type={mode === 'STAFF' ? 'text' : 'number'} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" value={inputValue} onChange={e => setInputValue(e.target.value)} />
                  {error && <p className="text-red-500 text-[10px] mt-2 font-bold">{error}</p>}
                </div>
                <button type="submit" className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg">Ingresar</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;