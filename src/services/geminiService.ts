import { GoogleGenerativeAI } from "@google/generative-ai";
import { Property } from "../types";

// Tu API Key inyectada directamente para funcionamiento en producción (GitHub Pages)
const API_KEY = "AIzaSyCJHU6FLnZjDQgywPS20hqWie_gm1BE6AE";
const genAI = new GoogleGenerativeAI(API_KEY);

// Usamos gemini-1.5-flash: es más rápido y eficiente para estas tareas
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generatePropertyDescription = async (property: Partial<Property>, tone: string = 'profesional'): Promise<string> => {
  try {
    const amenitiesText = property.amenities?.length ? `Amenities: ${property.amenities.join(', ')}` : '';
    
    const prompt = `Eres un redactor experto en marketing inmobiliario de lujo en Argentina. 
      Genera una descripción de venta ${tone} para una propiedad con estos datos técnicos:
      - Título base: ${property.title}
      - Tipo: ${property.type}
      - Dirección/Barrio: ${property.address}, ${property.neighborhood}
      - Precio: $${property.price}
      - Expensas: $${property.expenses}
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
      7. Responde únicamente con el texto de la descripción en formato Markdown amigable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "No se pudo generar la descripción.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error al conectar con la IA para generar la descripción.";
  }
};

export const extractUtilityBillData = async (base64Image: string): Promise<any> => {
  try {
    // Limpiamos el base64 por si viene con el prefijo de data:image
    const base64Data = base64Image.split(',')[1] || base64Image;

    const prompt = `Analiza esta factura de servicios de Argentina y extrae la siguiente información en formato JSON:
            - tipoServicio: (debe ser uno de estos: Luz, Gas, Agua, Impuestos)
            - numeroContrato: el identificador de cliente o número de contrato
            - consumo: el valor numérico del consumo (kWh, m3, etc) si aparece
            - montoTotal: el valor total a pagar en Pesos Argentinos
            - fechaFactura: la fecha de emisión o vencimiento
            
            Responde SOLO con el objeto JSON puro sin bloques de código Markdown.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    // Limpieza por si Gemini devuelve el JSON entre bloques de código ```json ... ```
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson || '{}');
  } catch (error) {
    console.error("AI OCR Error:", error);
    return null;
  }
};

export const getChatbotResponse = async (query: string, dataSummary: string): Promise<string> => {
    try {
      const prompt = `Eres el asistente inteligente de InmoAI CRM en Argentina. 
      Tienes acceso a este resumen de datos financieros en pesos: ${dataSummary}. 
      Responde a la siguiente consulta del agente de forma concisa: ${query}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "No pude procesar tu solicitud.";
    } catch (error) {
      console.error("Chatbot Error:", error);
      return "Hubo un problema procesando tu mensaje.";
    }
};