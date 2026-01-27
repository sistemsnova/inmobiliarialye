
import React, { useState, useRef, useEffect } from 'react';
import { Property, UtilityType, UtilityRates, UtilityBill } from '../types';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Receipt, 
  Upload, 
  History, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Table,
  ChevronRight,
  Database,
  DollarSign, // For rates tab
  Settings,
  Save, // Ensure Save is imported
  CalendarDays, // For Generate Bills tab
  SquareDot, // For consumption input
  // Added missing import for X icon
  X
} from 'lucide-react';
import { extractUtilityBillData } from '../services/geminiService';

interface Props {
  properties: Property[];
  onAddBill: (bill: UtilityBill) => void;
  bills: UtilityBill[];
  utilityRates: UtilityRates; 
  onSaveRates: (rates: UtilityRates) => void; 
}

const UtilitiesManager: React.FC<Props> = ({ properties, onAddBill, bills, utilityRates, onSaveRates }) => {
  const [activeTab, setActiveTab] = useState<'rates' | 'generate' | 'upload' | 'bulk' | 'history'>('rates'); 
  const [loading, setLoading] = useState(false);

  // States for 'Upload IA' tab
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for 'Importar Excel' tab
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // States for 'Tarifas' tab
  const [currentRates, setCurrentRates] = useState<UtilityRates>(utilityRates);
  const [isRatesSaved, setIsRatesSaved] = useState(false);

  // States for 'Generar Facturas' tab
  const [selectedPropertyForGeneration, setSelectedPropertyForGeneration] = useState<string>('');
  const [billingMonth, setBillingMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [electricityUsage, setElectricityUsage] = useState<number | ''>('');
  const [gasUsage, setGasUsage] = useState<number | ''>('');
  const [waterUsage, setWaterUsage] = useState<number | ''>('');
  const [generatedBillsPreview, setGeneratedBillsPreview] = useState<UtilityBill[]>([]);
  const [showGeneratedBillsSummary, setShowGeneratedBillsSummary] = useState(false);
  const [isBillsGenerated, setIsBillsGenerated] = useState(false);

  useEffect(() => {
    setCurrentRates(utilityRates); 
  }, [utilityRates]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  };

  // --- Handlers for 'Upload IA' Tab ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const data = await extractUtilityBillData(base64);
      
      const billContract = data?.numeroContrato?.trim();
      const matchedProperty = properties.find(p => 
        p.electricityContract === billContract ||
        p.gasContract === billContract ||
        p.waterContract === billContract ||
        p.taxContract === billContract
      );

      setExtractedData({
        ...data,
        matchedPropertyId: matchedProperty?.id,
        matchedPropertyName: matchedProperty?.title || 'CONTRATO NO ENCONTRADO'
      });
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const confirmSingleBill = () => {
    if (!extractedData || !extractedData.matchedPropertyId) return;
    onAddBill({
      id: Date.now().toString(),
      propertyId: extractedData.matchedPropertyId,
      type: extractedData.tipoServicio as UtilityType,
      amount: extractedData.montoTotal,
      usage: extractedData.consumo,
      date: extractedData.fechaFactura || new Date().toISOString(),
      contractNumber: extractedData.numeroContrato,
      status: 'PENDING'
    });
    setExtractedData(null);
  };

  // --- Handlers for 'Importar Excel' Tab ---
  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(';');
      
      const parsedData = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.split(';');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        
        const property = properties.find(p => 
          p.title.toLowerCase().includes(row['administracion']?.toLowerCase())
        );

        return { ...row, propertyId: property?.id, propertyName: property?.title };
      });

      setBulkPreview(parsedData);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const confirmBulkImport = () => {
    let count = 0;
    bulkPreview.forEach(row => {
      if (!row.propertyId) return;

      const baseId = Date.now() + Math.random();

      // Creating bills based on parsed row data
      if (row['IMPORTE']) {
        onAddBill({
          id: `rent-${baseId}`,
          propertyId: row.propertyId,
          type: UtilityType.RENT,
          amount: parseFloat(row['IMPORTE'].replace(',', '.')),
          date: row['VENCIMIENTO'] || new Date().toISOString(),
          contractNumber: row['NUM'] || 'N/A',
          status: 'PENDING'
        });
        count++;
      }
      if (row['LUZ'] && parseFloat(row['LUZ'].replace(',', '.')) > 0) {
        onAddBill({
          id: `luz-${baseId}-b`,
          propertyId: row.propertyId,
          type: UtilityType.ELECTRICITY,
          amount: parseFloat(row['LUZ'].replace(',', '.')),
          date: row['VENCIMIENTO'] || new Date().toISOString(),
          contractNumber: row['NUM'] || 'N/A',
          status: 'PENDING'
        });
        count++;
      }
      if (row['AGUA'] && parseFloat(row['AGUA'].replace(',', '.')) > 0) {
        onAddBill({
          id: `agua-${baseId}-c`,
          propertyId: row.propertyId,
          type: UtilityType.WATER,
          amount: parseFloat(row['AGUA'].replace(',', '.')),
          date: row['VENCIMIENTO'] || new Date().toISOString(),
          contractNumber: row['NUM'] || 'N/A',
          status: 'PENDING'
        });
        count++;
      }
      if (row['GAS'] && parseFloat(row['GAS'].replace(',', '.')) > 0) {
        onAddBill({
          id: `gas-${baseId}-d`,
          propertyId: row.propertyId,
          type: UtilityType.GAS,
          amount: parseFloat(row['GAS'].replace(',', '.')),
          date: row['VENCIMIENTO'] || new Date().toISOString(),
          contractNumber: row['NUM'] || 'N/A',
          status: 'PENDING'
        });
        count++;
      }
      if (row['MUN EXP EMOS'] && parseFloat(row['MUN EXP EMOS'].replace(',', '.')) > 0) {
        onAddBill({
          id: `tax-${baseId}-e`,
          propertyId: row.propertyId,
          type: UtilityType.TAXES,
          amount: parseFloat(row['MUN EXP EMOS'].replace(',', '.')),
          date: row['VENCIMIENTO'] || new Date().toISOString(),
          contractNumber: row['NUM'] || 'N/A',
          status: 'PENDING'
        });
        count++;
      }
    });

    alert(`Se han procesado ${count} registros de cobros.`);
    setBulkPreview([]);
    setActiveTab('history');
  };

  // --- Handlers for 'Tarifas' Tab ---
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentRates({ ...currentRates, [e.target.name]: Number(e.target.value) });
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates(currentRates);
    setIsRatesSaved(true);
    setTimeout(() => setIsRatesSaved(false), 3000); 
  };

  // --- Handlers for 'Generar Facturas' Tab ---
  const handlePreviewGeneratedBills = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyForGeneration || !billingMonth) {
      alert('Por favor, selecciona una propiedad y un período de facturación.');
      return;
    }

    const newBills: UtilityBill[] = [];
    const dueDate = new Date(billingMonth + '-01'); // Set to first day of month, then get last day
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(0); // This sets it to the last day of the selected month
    const dueDateString = dueDate.toISOString().split('T')[0];

    const prop = properties.find(p => p.id === selectedPropertyForGeneration);
    if (!prop) return;

    const baseId = `${prop.id}-${billingMonth}`; // Unique identifier for bills of this property and month

    // Electricity bill
    if (electricityUsage && electricityUsage > 0 && utilityRates.electricityPricePerUnit > 0) {
      newBills.push({
        id: `${baseId}-luz`,
        propertyId: prop.id,
        type: UtilityType.ELECTRICITY,
        amount: electricityUsage * utilityRates.electricityPricePerUnit,
        usage: electricityUsage,
        date: dueDateString,
        contractNumber: prop.electricityContract || `ELEC-${prop.id}-${billingMonth}`,
        status: 'PENDING',
      });
    }

    // Gas bill
    if (gasUsage && gasUsage > 0 && utilityRates.gasPricePerUnit > 0) {
      newBills.push({
        id: `${baseId}-gas`,
        propertyId: prop.id,
        type: UtilityType.GAS,
        amount: gasUsage * utilityRates.gasPricePerUnit,
        usage: gasUsage,
        date: dueDateString,
        contractNumber: prop.gasContract || `GAS-${prop.id}-${billingMonth}`,
        status: 'PENDING',
      });
    }

    // Water bill
    if (waterUsage && waterUsage > 0 && utilityRates.waterPricePerUnit > 0) {
      newBills.push({
        id: `${baseId}-agua`,
        propertyId: prop.id,
        type: UtilityType.WATER,
        amount: waterUsage * utilityRates.waterPricePerUnit,
        usage: waterUsage,
        date: dueDateString,
        contractNumber: prop.waterContract || `AGUA-${prop.id}-${billingMonth}`,
        status: 'PENDING',
      });
    }

    // Municipalidad (Taxes) bill - always generated if fixed amount > 0
    if (utilityRates.municipalityFixedAmount > 0) {
      newBills.push({
        id: `${baseId}-impuestos`,
        propertyId: prop.id,
        type: UtilityType.TAXES,
        amount: utilityRates.municipalityFixedAmount,
        date: dueDateString,
        contractNumber: prop.taxContract || `MUN-${prop.id}-${billingMonth}`,
        status: 'PENDING',
      });
    }

    setGeneratedBillsPreview(newBills);
    setShowGeneratedBillsSummary(true);
  };

  const handleConfirmGenerateBills = () => {
    generatedBillsPreview.forEach(bill => {
      // Check if a bill with the same ID already exists to prevent duplicates
      const exists = bills.some(existingBill => existingBill.id === bill.id);
      if (!exists) {
        onAddBill(bill);
      } else {
        console.warn(`Bill with ID ${bill.id} already exists. Skipping.`);
      }
    });
    setGeneratedBillsPreview([]);
    setShowGeneratedBillsSummary(false);
    setIsBillsGenerated(true); // Show confirmation for generated bills
    setTimeout(() => setIsBillsGenerated(false), 3000);
    // Reset form for next generation
    setSelectedPropertyForGeneration('');
    setElectricityUsage('');
    setGasUsage('');
    setWaterUsage('');
  };

  const handleCancelGenerateBills = () => {
    setGeneratedBillsPreview([]);
    setShowGeneratedBillsSummary(false);
    setSelectedPropertyForGeneration('');
    setElectricityUsage('');
    setGasUsage('');
    setWaterUsage('');
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Servicios y Suministros</h2>
          <p className="text-slate-500">Carga facturas individuales o planillas de administración masiva.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rates' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500'}`}
          >
            <Settings size={16} /> Tarifas
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'generate' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500'}`}
          >
            <CalendarDays size={16} /> Generar Facturas
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500'}`}
          >
            <Upload size={16} /> Carga IA
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500'}`}
          >
            <Table size={16} /> Importar Excel
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[var(--primary-color-600)] shadow-sm' : 'text-slate-500'}`}
          >
            <History size={16} /> Historial
          </button>
        </div>
      </div>

      {/* Confirmation messages */}
      {isRatesSaved && activeTab === 'rates' && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in w-fit mx-auto">
          ¡Tarifas guardadas!
        </div>
      )}
      {isBillsGenerated && activeTab === 'generate' && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in w-fit mx-auto">
          ¡Facturas generadas correctamente!
        </div>
      )}

      {/* --- Tarifas Tab --- */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-[var(--primary-color-600)]" />
            Configuración de Tarifas (ARS)
          </h3>
          <form onSubmit={handleSaveRates} className="space-y-6">
            <div>
              <label htmlFor="electricityPricePerUnit" className="block text-sm font-bold text-slate-700 mb-2">
                Electricidad (ARS / kWh)
              </label>
              <input
                id="electricityPricePerUnit"
                name="electricityPricePerUnit"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={currentRates.electricityPricePerUnit}
                onChange={handleRateChange}
              />
            </div>
            <div>
              <label htmlFor="gasPricePerUnit" className="block text-sm font-bold text-slate-700 mb-2">
                Gas (ARS / m³)
              </label>
              <input
                id="gasPricePerUnit"
                name="gasPricePerUnit"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={currentRates.gasPricePerUnit}
                onChange={handleRateChange}
              />
            </div>
            <div>
              <label htmlFor="waterPricePerUnit" className="block text-sm font-bold text-slate-700 mb-2">
                Agua (ARS / m³)
              </label>
              <input
                id="waterPricePerUnit"
                name="waterPricePerUnit"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={currentRates.waterPricePerUnit}
                onChange={handleRateChange}
              />
            </div>
            <div>
              <label htmlFor="municipalityFixedAmount" className="block text-sm font-bold text-slate-700 mb-2">
                Municipalidad (Monto Fijo Mensual ARS)
              </label>
              <input
                id="municipalityFixedAmount"
                name="municipalityFixedAmount"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={currentRates.municipalityFixedAmount}
                onChange={handleRateChange}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--primary-color-700)] transition-colors mt-6 flex items-center justify-center gap-2"
            >
              <Save size={20} /> Guardar Tarifas
            </button>
          </form>
        </div>
      )}

      {/* --- Generar Facturas Tab --- */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarDays size={20} className="text-[var(--primary-color-600)]" />
            Generar Facturas por Propiedad
          </h3>
          <form onSubmit={handlePreviewGeneratedBills} className="space-y-6">
            <div>
              <label htmlFor="propertySelect" className="block text-sm font-bold text-slate-700 mb-2">
                Seleccionar Propiedad
              </label>
              <select
                id="propertySelect"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={selectedPropertyForGeneration}
                onChange={(e) => setSelectedPropertyForGeneration(e.target.value)}
                required
              >
                <option value="">-- Selecciona una propiedad --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.address})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="billingMonth" className="block text-sm font-bold text-slate-700 mb-2">
                Período de Facturación (Mes y Año)
              </label>
              <input
                id="billingMonth"
                type="month"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="electricityUsage" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Zap size={16} className="text-yellow-500" /> Electricidad (kWh)
                </label>
                <input
                  id="electricityUsage"
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                  value={electricityUsage}
                  onChange={(e) => setElectricityUsage(Number(e.target.value))}
                  placeholder="Consumo en kWh"
                />
              </div>
              <div>
                <label htmlFor="gasUsage" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Flame size={16} className="text-orange-500" /> Gas (m³)
                </label>
                <input
                  id="gasUsage"
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                  value={gasUsage}
                  onChange={(e) => setGasUsage(Number(e.target.value))}
                  placeholder="Consumo en m³"
                />
              </div>
              <div>
                <label htmlFor="waterUsage" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Droplets size={16} className="text-blue-500" /> Agua (m³)
                </label>
                <input
                  id="waterUsage"
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-color-600)]"
                  value={waterUsage}
                  onChange={(e) => setWaterUsage(Number(e.target.value))}
                  placeholder="Consumo en m³"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[var(--primary-color-600)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--primary-color-700)] transition-colors mt-6 flex items-center justify-center gap-2"
            >
              <SquareDot size={20} /> Previsualizar Facturas
            </button>
          </form>

          {showGeneratedBillsSummary && (
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-lg font-bold text-slate-800">Facturas a Generar:</h4>
              <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-2">Servicio</th>
                      <th className="px-4 py-2">Consumo</th>
                      <th className="px-4 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedBillsPreview.length > 0 ? generatedBillsPreview.map((bill) => (
                      <tr key={bill.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.type}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{bill.usage ? `${bill.usage} ${bill.type === UtilityType.ELECTRICITY ? 'kWh' : 'm³'}` : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">{formatCurrency(bill.amount)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-sm">
                          No hay facturas para generar con los datos proporcionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleConfirmGenerateBills}
                  disabled={generatedBillsPreview.length === 0}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={20} /> Confirmar Generación
                </button>
                <button
                  type="button"
                  onClick={handleCancelGenerateBills}
                  className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} /> Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Carga IA Tab --- */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-sm aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[var(--primary-color-600)] hover:bg-[var(--primary-color-50)]/30 transition-all group"
            >
              <div className="p-4 bg-[var(--primary-color-50)] text-[var(--primary-color-600)] rounded-2xl group-hover:scale-110 transition-transform">
                <FileText size={48} />
              </div>
              <div>
                <p className="font-bold text-slate-700">Subir Factura Individual</p>
                <p className="text-[10px] text-slate-400 uppercase font-black mt-1">IA procesará los datos</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            {loading && <div className="mt-4 flex items-center gap-2 text-[var(--primary-color-600)] animate-pulse font-bold"><Loader2 className="animate-spin" /> Analizando...</div>}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl min-h-[400px] border border-slate-800">
            {extractedData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-emerald-400" /> Datos de Factura</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Servicio</p>
                    <p className="text-lg font-bold">{extractedData.tipoServicio}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Monto</p>
                    <p className="text-lg font-bold text-emerald-400">${extractedData.montoTotal?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--primary-color-600)]/30 border border-[var(--primary-color-600)]/50">
                  <p className="text-[10px] text-[var(--primary-color-300)] uppercase font-bold">Propiedad Detectada</p>
                  <p className="font-bold">{extractedData.matchedPropertyName}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setExtractedData(null)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold">Descartar</button>
                  <button onClick={confirmSingleBill} disabled={!extractedData.matchedPropertyId} className="flex-1 py-3 bg-[var(--primary-color-600)] rounded-xl font-bold disabled:opacity-50">Vincular Pago</button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <Receipt size={64} className="mb-4" />
                <p>Sube una imagen para vinculación automática vía OCR.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Importar Excel Tab --- */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-10">
              <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] mb-6">
                <Database size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Importación Masiva de Planilla</h3>
              <p className="text-slate-500 mb-8">Selecciona tu archivo CSV (delimitado por ;) con los encabezados: <br/> 
              <code className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono mt-2 inline-block">administracion;NUM;PROPIETARIO;INQUILINO;PERIODO ALQUILADO;IMPORTE;VENCIMIENTO;LUZ;AGUA;GAS;MUN EXP EMOS</code></p>
              
              <button 
                onClick={() => bulkInputRef.current?.click()}
                className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <Upload size={20} /> Seleccionar Archivo CSV
              </button>
              <input type="file" ref={bulkInputRef} className="hidden" accept=".csv,.txt" onChange={handleBulkImport} />
            </div>
          </div>

          {bulkPreview.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h4 className="font-bold text-slate-800">Vista previa de Importación ({bulkPreview.length} filas)</h4>
                <button 
                  onClick={confirmBulkImport}
                  className="px-6 py-2 bg-[var(--primary-color-600)] text-white font-bold rounded-xl hover:bg-[var(--primary-color-700)] transition-all"
                >
                  Confirmar y Procesar Todo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Administración</th>
                      <th className="px-4 py-3">Vínculo Sistema</th>
                      <th className="px-4 py-3">Inquilino</th>
                      <th className="px-4 py-3">Importe</th>
                      <th className="px-4 py-3">Luz/Agua/Gas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bulkPreview.map((row, i) => (
                      <tr key={i} className="text-xs hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{row['administracion']}</td>
                        <td className="px-4 py-3">
                          {row.propertyId ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> {row.propertyName}</span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12}/> No encontrada</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{row['INQUILINO']}</td>
                        <td className="px-4 py-3 font-bold">${row['IMPORTE']}</td>
                        <td className="px-4 py-3 text-slate-500">L:${row['LUZ']} A:${row['AGUA']} G:${row['GAS']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Historial Tab --- */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Fecha / Venc.</th>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Propiedad</th>
                <th className="px-6 py-4 text-right">Monto (ARS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length > 0 ? [...bills].sort((a,b) => b.date.localeCompare(a.date)).map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors text-sm">
                  <td className="px-6 py-4 text-slate-600">{new Date(bill.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold flex items-center gap-1.5">
                      {bill.type === UtilityType.ELECTRICITY && <Zap size={14} className="text-yellow-500" />}
                      {bill.type === UtilityType.WATER && <Droplets size={14} className="text-blue-500" />}
                      {bill.type === UtilityType.GAS && <Flame size={14} className="text-orange-500" />}
                      {bill.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-800">
                    {properties.find(p => p.id === bill.propertyId)?.title}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">${bill.amount.toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Sin historial de facturas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UtilitiesManager;
