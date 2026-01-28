import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Trash2, Clock, 
  Calendar, X, Save, Loader2, CheckCircle2, 
  ListTodo, AlertCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Task } from '../types';

export const TasksManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });

  // 1. Escuchar Tareas Cloud en Tiempo Real
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Guardar Tarea
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        status: 'TODO',
        date: serverTimestamp()
      });
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
      setShowModal(false);
    } catch (error) {
      alert("Error al sincronizar");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'TODO' ? 'DONE' : 'TODO';
    await updateDoc(doc(db, 'tasks', task.id), { status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Agenda de Tareas</h1>
          <p className="text-slate-500 font-medium italic">Organización del equipo sincronizada en la nube.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95"
        >
          <Plus size={18} /> Nueva Tarea
        </button>
      </header>

      {/* LISTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center font-black text-slate-300 uppercase animate-pulse">Sincronizando Agenda...</div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 opacity-50">
             <ListTodo size={48} className="mx-auto mb-4" />
             <p className="font-bold italic">No hay tareas pendientes.</p>
          </div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className={`p-6 rounded-[2.5rem] border transition-all flex items-start gap-4 ${t.status === 'DONE' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
              <button onClick={() => toggleStatus(t)} className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${t.status === 'DONE' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300 hover:bg-orange-100 hover:text-orange-500'}`}>
                {t.status === 'DONE' ? <CheckCircle2 size={20} /> : <div className="w-4 h-4 border-2 border-current rounded-sm" />}
              </button>
              <div className="flex-1">
                <h3 className={`font-bold ${t.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              </div>
              <button onClick={async () => { if(window.confirm("¿Borrar?")) await deleteDoc(doc(db, 'tasks', t.id)); }} className="p-2 text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 z-[120]">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-lg shadow-2xl animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Nueva Tarea</h2>
            <form onSubmit={handleSaveTask} className="space-y-5">
              <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="¿Qué hay que hacer?" />
              <textarea className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-sm h-24 border-none" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Detalles..." />
              <button type="submit" disabled={isSaving} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} ACTIVAR TAREA
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};