
import React, { useState } from 'react';
import { Task, User } from '../types';
import { Plus, Calendar, Clock, CheckCircle2, User as UserIcon, Users, AlertCircle, Trash2, X } from 'lucide-react';

interface Props {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onAdd: (task: Task) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

const TasksManager: React.FC<Props> = ({ tasks, users, currentUser, onAdd, onUpdateStatus, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    assignedTo: 'ALL'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newTask as Task,
      id: Date.now().toString(),
      status: 'TODO',
      createdBy: currentUser.id
    });
    setShowModal(false);
  };

  const filteredTasks = currentUser.role === 'ADMIN' 
    ? tasks 
    : tasks.filter(t => t.assignedTo === currentUser.id || t.assignedTo === 'ALL');

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'HIGH': return 'bg-red-100 text-red-600';
      case 'MEDIUM': return 'bg-amber-100 text-amber-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tareas y Seguimiento</h2>
          <p className="text-slate-500">Organiza las actividades pendientes de la agencia.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-color-600)] text-white rounded-xl font-bold shadow-md hover:bg-[var(--primary-color-700)] transition-all"
        >
          <Plus size={20} /> Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
          <div key={status} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'TODO' ? 'bg-slate-300' : status === 'IN_PROGRESS' ? 'bg-[var(--primary-color-600)]' : 'bg-emerald-500'}`} />
              {status === 'TODO' ? 'Pendiente' : status === 'IN_PROGRESS' ? 'En Proceso' : 'Completado'}
              <span className="ml-auto bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                {filteredTasks.filter(t => t.status === status).length}
              </span>
            </h3>
            
            <div className="space-y-3 min-h-[50vh]">
              {filteredTasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <Calendar size={12} /> {task.dueDate}
                    </div>
                    <div className="flex -space-x-2">
                      {task.assignedTo === 'ALL' ? (
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-white text-slate-400" title="Todos">
                          <Users size={12} />
                        </div>
                      ) : (
                        <img 
                          src={users.find(u => u.id === task.assignedTo)?.avatar} 
                          className="w-6 h-6 rounded-full border border-white" 
                          alt="Asignado" 
                          title={users.find(u => u.id === task.assignedTo)?.name}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {status !== 'DONE' && (
                      <button 
                        onClick={() => onUpdateStatus(task.id, status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                        className="flex-1 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-[var(--primary-color-50)] hover:text-[var(--primary-color-600)] rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        {status === 'TODO' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {status === 'TODO' ? 'Empezar' : 'Finalizar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Crear Nueva Tarea</h3>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
                <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Ej. Contactar interesado por Penthouse" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                <textarea rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fecha Límite</label>
                  <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Prioridad</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Asignar a:</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                  <option value="ALL">Todo el equipo</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <button className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl mt-4">Asignar Tarea</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManager;
