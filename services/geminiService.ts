
import { GoogleGenAI, Type } from "@google/genai";
import { Property, PropertyType, UtilityType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePropertyDescription = async (property: Partial<Property>, tone: string = 'profesional'): Promise<string> => {
  try {
    const amenitiesText = property.amenities?.length ? `Amenities: ${property.amenities.join(', ')}` : '';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un redactor experto en marketing inmobiliario de lujo en Argentina. 
      Genera una descripción de venta ${tone} para una propiedad con estos datos técnicos:
      - Título base: ${property.title}
      - Tipo: ${property.type}
      - Dirección/Barrio: ${property.address}, ${property.neighborhood}
      - Precio: $${property.price} ARS
      - Expensas: $${property.expenses} ARS
      - Características: ${property.bedrooms} dormitorios, ${property.bathrooms} baños, ${property.area}m2 totales (${property.coveredArea}m2 cubiertos).
      - Estado: ${property.condition}
      - Orientación: ${property.orientation}
      - Año de Construcción: ${property.yearBuilt}
      - ${amenitiesText}
      
      Reglas de Redacción:
      1. Título impactante (No repetir el título base, crear uno mejor).
      2. Párrafo introductorio aspiracional.
      3. Lista de características destacadas usando emojis elegantes.
      4. Sección de 'Ubicación y Entorno'.
      5. Llamado a la acción para coordinar visita.
      6. No menciones el año de construcción explícitamente si es viejo, úsalo para hablar de 'estilo consolidado' o 'diseño clásico'.
      7. Responde únicamente con el texto de la descripción en formato Markdown amigable.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || "No se pudo generar la descripción.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error al conectar con la IA para generar la descripción.";
  }
};

export const extractUtilityBillData = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image
            }
          },
          {
            text: `Analiza esta factura de servicios de Argentina y extrae la siguiente información en formato JSON:
            - tipoServicio: (debe ser uno de estos: Luz, Gas, Agua, Impuestos)
            - numeroContrato: el identificador de cliente o número de contrato
            - consumo: el valor numérico del consumo (kWh, m3, etc) si aparece
            - montoTotal: el valor total a pagar en Pesos Argentinos
            - fechaFactura: la fecha de emisión o vencimiento
            
            Responde SOLO con el objeto JSON puro.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI OCR Error:", error);
    return null;
  }
};

export const getChatbotResponse = async (query: string, dataSummary: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Eres el asistente inteligente de InmoAI CRM en Argentina. Tienes acceso a este resumen de datos financieros en pesos: ${dataSummary}. 
        Responde a la siguiente consulta del agente: ${query}`,
      });
      return response.text || "No pude procesar tu solicitud.";
    } catch (error) {
      return "Hubo un problema procesando tu mensaje.";
    }
};