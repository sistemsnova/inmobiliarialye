
import React, { useState } from 'react';
import TaskForm from '../components/TaskForm.js';

const Tasks = ({ tasks, setTasks, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(undefined);
  const [filter, setFilter] = useState('all');

  const handleSave = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    } else {
      const newTask = {
        id: `T-${Math.random().toString(36).substr(2, 5)}`,
        title: taskData.title || '',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        priority: taskData.priority || 'Media',
        completed: false,
        assignedTo: taskData.assignedTo || 'all',
      };
      setTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-50 text-red-600 border-red-100';
      case 'Media': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Baja': return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Tareas</h2>
          <p className="text-slate-500 mt-1">Organiza el flujo de trabajo del equipo inmobiliario.</p>
        </div>
        
        <button 
          onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nueva Tarea
        </button>
      </div>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
        {(['all', 'pending', 'completed']).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              filter === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'all' ? 'Todas' : tab === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
            <span className="text-6xl mb-4 block">🏝️</span>
            <p className="text-slate-400 font-medium">No hay tareas que mostrar en esta categoría.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const assignedUser = users.find(u => u.id === task.assignedTo);
            return (
              <div 
                key={task.id} 
                className={`group bg-white p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${
                  task.completed ? 'opacity-60 grayscale border-slate-100' : 'border-slate-100 hover:border-blue-200 hover:shadow-xl shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 hover:border-blue-500'
                  }`}
                >
                  {task.completed && '✓'}
                </button>

                <div className="flex-1">
                  <h3 className={`font-bold text-slate-800 ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      📅 {task.dueDate}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Asignado a:</span>
                      {task.assignedTo === 'all' ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Todos 👥</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <img src={assignedUser?.avatar} className="w-4 h-4 rounded-full border border-white shadow-sm" alt="User" />
                          <span className="text-[10px] font-bold text-slate-600">{assignedUser?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                    className="p-3 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-3 bg-slate-50 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <TaskForm 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          initialData={editingTask}
          users={users}
        />
      )}
    </div>
  );
};

export default Tasks;