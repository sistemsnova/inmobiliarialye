
import React, { useState, useRef, useEffect } from 'react';
import { Property, Lead } from '../types';
import { Sparkles, Send, Bot, User, Loader2, BrainCircuit, BarChart3, Mail } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface Props {
  properties: Property[];
  leads: Lead[];
}

const AIAssistant: React.FC<Props> = ({ properties, leads }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '¡Hola! Soy tu asistente de InmoAI. ¿En qué puedo ayudarte hoy? Puedo analizar tu inventario, redactar correos para leads o darte insights de mercado.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Context for AI
    const dataSummary = `Inventario total: ${properties.length} propiedades. Valor total: $${properties.reduce((a, b) => a + b.price, 0)}. Leads activos: ${leads.length}.`;
    
    const aiResponse = await getChatbotResponse(userMsg, dataSummary);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  const suggestions = [
    { label: 'Analizar inventario', icon: BarChart3 },
    { label: 'Redactar mail a Lead', icon: Mail },
    { label: 'Ideas de marketing', icon: BrainCircuit }
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-[var(--primary-color-600)]" />
            AI Marketing Lab
          </h2>
          <p className="text-slate-500 text-sm">Potencia tu agencia con inteligencia artificial generativa.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${m.role === 'ai' ? 'bg-[var(--primary-color-100)] text-[var(--primary-color-600)]' : 'bg-slate-800 text-white'}`}>
                    {m.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'ai' ? 'bg-slate-50 text-slate-700' : 'bg-[var(--primary-color-600)] text-white shadow-lg shadow-[var(--primary-color-shadow)]'}`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                  <Loader2 size={16} className="animate-spin text-[var(--primary-color-600)]" />
                  <span className="text-xs font-medium">InmoAI está pensando...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-[var(--primary-color-300)] hover:text-[var(--primary-color-600)] transition-all whitespace-nowrap shadow-sm"
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Escribe tu consulta o pide una tarea..." 
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)] shadow-inner"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--primary-color-600)] text-white rounded-xl hover:bg-[var(--primary-color-700)] transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Stats / Insights Sidebar */}
        <div className="w-full lg:w-80 space-y-6 overflow-y-auto hidden lg:block">
          <div className="bg-gradient-to-br from-[var(--primary-color-gradient-from)] to-[var(--primary-color-gradient-to)] p-6 rounded-3xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <BrainCircuit size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Insights</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Resumen Inteligente</h4>
            <p className="text-[var(--primary-color-100)] text-sm leading-relaxed">
              Tu inventario ha crecido un 15% este mes. El tipo de propiedad más demandado por tus leads son los Apartamentos de 2 hab.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span>Eficiencia de Cierre</span>
                <span className="font-bold">78%</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              Próximas Sugerencias
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-700 group-hover:text-[var(--primary-color-600)] transition-colors">Contactar a Elena Gómez</p>
                  <p className="text-slate-500">Su interés en Alquiler encaja con el nuevo Penthouse.</p>
                </div>
              </li>
              <li className="flex gap-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-700 group-hover:text-[var(--primary-color-600)] transition-colors">Ajuste de Precio</p>
                  <p className="text-slate-500">La Casa Colonial está un 5% por encima del mercado local.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default AIAssistant;
