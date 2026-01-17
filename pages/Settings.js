
import React, { useState } from 'react';
import { persistenceService } from '../services/persistenceService.js';

const Settings = ({ db, onRestore, onUpdateCompany }) => {
  const [companyForm, setCompanyForm] = useState(db.companySettings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passError, setPassError] = useState(false);

  const handleExport = () => {
    persistenceService.exportBackup(db);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm("¿Estás seguro? Esta acción reemplazará TODOS los datos actuales con los del archivo de respaldo.")) {
        try {
          const restoredData = await persistenceService.importBackup(file);
          onRestore(restoredData);
          alert("Base de datos restaurada con éxito.");
        } catch (err) {
          alert("Error al importar el archivo: " + err.message);
        }
      }
    }
  };

  const handleCompanySave = () => {
    onUpdateCompany(companyForm);
    alert("Configuración de empresa actualizada.");
  };

  const handleFactoryReset = () => {
    if (adminPassword === 'borrar123') {
      if (confirm("ATENCIÓN: Esta acción es irreversible. Se borrarán todos los clientes, contratos, transacciones y configuraciones personalizadas. ¿Continuar?")) {
        localStorage.clear();
        window.location.reload();
      }
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handleEmailSettingsChange = (field, value) => {
    setCompanyForm({
      ...companyForm,
      emailSettings: {
        ...(companyForm.emailSettings || { provider: 'gmail', senderEmail: '' }),
        [field]: value
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configuración Global</h2>
        <p className="text-slate-500 mt-1 font-medium">Administra la identidad corporativa, comunicaciones y copias de seguridad.</p>
      </div>

      {/* Sección Configuración de Empresa */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl">🏢</div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Identidad de la Empresa</h3>
            <p className="text-sm text-slate-500">Define cómo se ve tu marca en la plataforma.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nombre Comercial</label>
              <input 
                type="text" 
                value={companyForm.name}
                onChange={e => setCompanyForm({...companyForm, name: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="Ej: Inmobiliaria Central"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">URL del Logo (Imagen PNG/SVG)</label>
              <input 
                type="text" 
                value={companyForm.logoUrl}
                onChange={e => setCompanyForm({...companyForm, logoUrl: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://link-a-tu-logo.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Mostrar en la Interfaz</label>
              <div className="flex gap-4 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <button 
                  onClick={() => setCompanyForm({...companyForm, displayType: 'name'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    companyForm.displayType === 'name' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-400'
                  }`}
                >
                  Solo Nombre
                </button>
                <button 
                  onClick={() => setCompanyForm({...companyForm, displayType: 'logo'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    companyForm.displayType === 'logo' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-400'
                  }`}
                >
                  Solo Logo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dirección Física</label>
              <input 
                type="text" 
                value={companyForm.address}
                onChange={e => setCompanyForm({...companyForm, address: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Teléfono</label>
                <input 
                  type="text" 
                  value={companyForm.phone}
                  onChange={e => setCompanyForm({...companyForm, phone: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Público</label>
                <input 
                  type="text" 
                  value={companyForm.email}
                  onChange={e => setCompanyForm({...companyForm, email: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva Sección Configuración de Correo */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl">📧</div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Servicio de Correo Electrónico</h3>
            <p className="text-sm text-slate-500">Configura cómo se enviarán las facturas y recordatorios.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Proveedor de Servicio</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  {(['gmail', 'sendgrid', 'custom']).map(p => (
                    <button 
                      key={p}
                      onClick={() => handleEmailSettingsChange('provider', p)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        companyForm.emailSettings?.provider === p ? 'bg-white shadow-sm border border-slate-200 text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Remitente</label>
                <input 
                  type="email" 
                  value={companyForm.emailSettings?.senderEmail}
                  onChange={e => handleEmailSettingsChange('senderEmail', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ejemplo@gmail.com"
                />
              </div>

              {companyForm.emailSettings?.provider === 'gmail' && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-[10px] text-amber-700 font-medium">
                  💡 Para Gmail, debes usar una <b>Contraseña de Aplicación</b>. No uses tu contraseña normal de acceso.
                </div>
              )}
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Clave de API / App Password</label>
                <input 
                  type="password" 
                  value={companyForm.emailSettings?.appPassword}
                  onChange={e => handleEmailSettingsChange('appPassword', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  placeholder="••••••••••••••••"
                />
              </div>

              {companyForm.emailSettings?.provider === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Servidor SMTP</label>
                    <input 
                      type="text" 
                      value={companyForm.emailSettings?.smtpHost}
                      onChange={e => handleEmailSettingsChange('smtpHost', e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                      placeholder="smtp.servidor.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Puerto</label>
                    <input 
                      type="number" 
                      value={companyForm.emailSettings?.smtpPort}
                      onChange={e => handleEmailSettingsChange('smtpPort', Number(e.target.value))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                      placeholder="587"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleCompanySave}
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-sm hover:bg-amber-700 shadow-xl shadow-amber-200 transition-all"
                >
                  Confirmar Configuración Email
                </button>
              </div>
           </div>
        </div>
      </section>

      {/* Sección Backups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
            💾
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Copia de Seguridad</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Descarga un archivo con toda la información de la inmobiliaria para tener un resguardo externo.
          </p>
          <button 
            onClick={handleExport}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <span>⬇️</span> Descargar Backup JSON
          </button>
          <p className="text-[10px] text-slate-400 mt-4 text-center font-bold uppercase tracking-widest">
            Último guardado: {new Date(db.lastBackup).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
            🔄
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Restaurar Sistema</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Carga un archivo de respaldo previo para recuperar todos los datos de tu inmobiliaria.
          </p>
          <label className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl font-black text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
            <span>⬆️</span> Seleccionar Archivo
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Zona de Peligro */}
      <section className="bg-red-50/50 p-10 rounded-[3rem] border border-red-100 mt-20">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-red-200">⚠️</div>
            <div>
               <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Zona de Peligro</h3>
               <p className="text-sm text-red-700/70 font-medium">Acciones críticas de mantenimiento del sistema.</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
               <h4 className="font-black text-slate-900 mb-1">Borrado Total de Datos</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Esto eliminará permanentemente todos los registros (clientes, alquileres, pagos y tareas) y devolverá el sistema a su estado inicial. Úsalo solo si deseas comenzar de cero.
               </p>
            </div>
            
            {!showDeleteConfirm ? (
               <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200"
               >
                  Borrar Todo el Sistema
               </button>
            ) : (
               <div className="flex flex-col gap-3 w-full md:w-64 animate-in slide-in-from-right-4">
                  <input 
                     type="password" 
                     placeholder="Contraseña de Admin" 
                     value={adminPassword}
                     onChange={(e) => setAdminPassword(e.target.value)}
                     className={`w-full p-4 bg-slate-50 border ${passError ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 font-bold text-center`}
                  />
                  {passError && <p className="text-[10px] text-red-600 font-black uppercase text-center">Clave Incorrecta</p>}
                  <div className="flex gap-2">
                     <button onClick={() => {setShowDeleteConfirm(false); setAdminPassword('');}} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase">Cancelar</button>
                     <button onClick={handleFactoryReset} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Confirmar</button>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center italic mt-1">(Clave demo: borrar123)</p>
               </div>
            )}
         </div>
      </section>
    </div>
  );
};

export default Settings;