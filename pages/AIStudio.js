
import React, { useState } from 'react';
import { generatePropertyDescription, getMarketInsights } from '../services/geminiService.js';

const AIStudio = () => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');
  const [result, setResult] = useState('');
  const [insights, setInsights] = useState([]);

  const handleGenerate = async () => {
    if (!details) return;
    setLoading(true);
    try {
      const desc = await generatePropertyDescription(details);
      setResult(desc || '');
    } catch (e) {
      setResult('Error al generar la descripción. Por favor verifica tu clave API.');
    }
    setLoading(false);
  };

  const handleGetInsights = async () => {
    setLoading(true);
    try {
      const data = await getMarketInsights('Apartamentos de Lujo', 'Barcelona');
      setInsights(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold text-slate-900">Centro de Inteligencia IA</h2>
        <p className="text-slate-500 text-lg">Aprovecha Gemini Pro para automatizar tu marketing y estrategia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Generador de Descripciones */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">✍️</span>
            <div>
              <h3 className="font-bold text-xl">Asistente de Redacción</h3>
              <p className="text-xs text-slate-400">Genera textos de alta conversión</p>
            </div>
          </div>
          
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="ej. Villa de 3 habitaciones, vista al mar, piscina climatizada, Marbella, acabados de lujo..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm mb-4 resize-none"
          />
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
            }`}
          >
            {loading ? 'Pensando...' : '✨ Generar Anuncio Profesional'}
          </button>

          {result && (
            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in zoom-in-95">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Copiar al Portapapeles
              </button>
            </div>
          )}
        </div>

        {/* Insights de Mercado */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="font-bold text-xl">Análisis Estratégico</h3>
              <p className="text-xs text-slate-400">Análisis de mercado en tiempo real</p>
            </div>
          </div>

          <div className="space-y-4 flex-grow">
            {insights.length > 0 ? (
              insights.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <h4 className="font-bold text-blue-600 text-sm mb-1">{item.insight}</h4>
                  <p className="text-xs text-slate-600">{item.impact}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <span className="text-5xl mb-4">🧊</span>
                <p className="text-sm">Haz clic abajo para analizar el mercado</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGetInsights}
            disabled={loading}
            className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200"
          >
            {loading ? 'Analizando...' : '🔍 Analizar Tendencias'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStudio;