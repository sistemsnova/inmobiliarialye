
import React, { useState, useRef } from 'react';
import { 
  Archive, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileJson,
  XCircle,
  Copy,
  ExternalLink,
  Info,
  ArrowRightLeft,
  Globe,
  Github,
  Rocket,
  Code2,
  Terminal
} from 'lucide-react';
import { 
  Property, 
  Owner, 
  Lead, 
  Tenant, 
  User, 
  Task, 
  UtilityBill, 
  CompanyConfig, 
  UtilityRates 
} from '../types';

interface BackupData {
  properties: Property[];
  owners: Owner[];
  tenants: Tenant[];
  leads: Lead[];
  users: User[];
  tasks: Task[];
  bills: UtilityBill[];
  companyConfig: CompanyConfig;
  utilityRates: UtilityRates;
}

interface Props {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  owners: Owner[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  bills: UtilityBill[];
  setBills: React.Dispatch<React.SetStateAction<UtilityBill[]>>;
  companyConfig: CompanyConfig;
  setCompanyConfig: React.Dispatch<React.SetStateAction<CompanyConfig>>;
  utilityRates: UtilityRates;
  setUtilityRates: React.Dispatch<React.SetStateAction<UtilityRates>>;
  currentUser: User;
}

const BackupManager: React.FC<Props> = ({
  properties, setProperties,
  owners, setOwners,
  tenants, setTenants,
  leads, setLeads,
  users, setUsers,
  tasks, setTasks,
  bills, setBills,
  companyConfig, setCompanyConfig,
  utilityRates, setUtilityRates,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'backup' | 'migration' | 'deploy'>('backup');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    const backupData: BackupData = {
      properties, owners, tenants, leads, users, tasks, bills, companyConfig, utilityRates,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `inmoai_backup_full_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Copia de seguridad exportada con éxito.' });
    setLoading(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data: BackupData = JSON.parse(result);
        if (window.confirm('¿Deseas restaurar esta copia? Se sobrescribirán todos los datos actuales.')) {
          if (data.properties) setProperties(data.properties);
          if (data.owners) setOwners(data.owners);
          if (data.tenants) setTenants(data.tenants);
          if (data.leads) setLeads(data.leads);
          if (data.users) setUsers(data.users);
          if (data.tasks) setTasks(data.tasks);
          if (data.bills) setBills(data.bills);
          if (data.companyConfig) setCompanyConfig(data.companyConfig);
          if (data.utilityRates) setUtilityRates(data.utilityRates);
          setMessage({ type: 'success', text: 'Datos restaurados con éxito.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error al procesar el archivo.' });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: `${label} copiado al portapapeles.` });
    setTimeout(() => setMessage(null), 3000);
  };

  const gitCommands = `git init
git remote add origin https://github.com/sistemsnova/inmobiliarialye.git
git add .
git commit -m "Initial Deployment"
git branch -M main
git push -u origin main`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Archive className="text-[var(--primary-color-600)]" size={32} />
            Despliegue Inmobiliaria LYE
          </h2>
          <p className="text-slate-500 mt-1">Sube el sistema a sistemsnova/inmobiliarialye en GitHub.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'backup' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Download size={18} /> Backup
          </button>
          <button 
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'deploy' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Rocket size={18} /> Subir a GitHub
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl font-bold animate-in zoom-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center flex flex-col items-center">
            <div className="p-6 bg-[var(--primary-color-50)] text-[var(--primary-color-600)] rounded-3xl mb-6 shadow-inner">
              <Download size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">1. Exportar Datos</h3>
            <p className="text-slate-500 mb-8 max-w-xs">Antes de subir a la web, guarda tu información actual en un archivo JSON.</p>
            <button onClick={handleExport} disabled={loading} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[var(--primary-color-600)] text-white rounded-2xl font-black text-lg hover:bg-[var(--primary-color-700)] transition-all shadow-xl shadow-[var(--primary-color-shadow)]">
              {loading ? <Loader2 className="animate-spin" /> : <Download size={24} />}
              DESCARGAR BACKUP.JSON
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center flex flex-col items-center">
            <div className="p-6 bg-slate-50 text-slate-300 rounded-3xl mb-6">
              <Upload size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">2. Restaurar</h3>
            <p className="text-slate-500 mb-8 max-w-xs">Usa esta opción una vez que el sitio esté online para cargar tus datos.</p>
            <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : <FileJson size={24} />}
              SUBIR AL SITIO WEB
            </button>
          </div>
        </div>
      )}

      {activeTab === 'deploy' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-color-600)]/20 blur-[120px] rounded-full -mr-40 -mt-40"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Github size={32} className="text-[var(--primary-color-400)]" />
                </div>
                <div>
                  <h3 className="text-3xl font-black">Subir a sistemsnova/inmobiliarialye</h3>
                  <p className="text-[var(--primary-color-200)] font-medium">Sigue estos comandos para publicar tu repositorio.</p>
                </div>
              </div>

              <div className="bg-black/50 rounded-2xl p-6 border border-white/10 mb-8 font-mono text-sm relative">
                <button 
                  onClick={() => copyToClipboard(gitCommands, 'Comandos Git')}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-[var(--primary-color-400)]"
                  title="Copiar comandos"
                >
                  <Copy size={16} />
                </button>
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {gitCommands}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Terminal size={20} className="text-emerald-400" />
                    Paso 1: Local
                  </h4>
                  <p className="text-sm text-slate-400 mb-6 flex-1">
                    Copia todos los archivos a una carpeta en tu computadora e instala Git. Luego abre una terminal y pega los comandos de arriba.
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-400" />
                    Paso 2: Web
                  </h4>
                  <p className="text-sm text-slate-400 mb-6 flex-1">
                    Ve a Vercel.com, conecta este repositorio y añade tu <code className="text-white">API_KEY</code> en la configuración de Vercel.
                  </p>
                  <a href="https://vercel.com/new" target="_blank" className="w-full py-3 bg-[var(--primary-color-600)] hover:bg-[var(--primary-color-700)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    Abrir Vercel <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
