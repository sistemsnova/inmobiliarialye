
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generatePropertyDescription = async (details) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Actúa como un redactor inmobiliario profesional. Genera una descripción de propiedad atractiva y convincente en ESPAÑOL para un anuncio con estos detalles: ${details}. Mantén un tono profesional y resalta los beneficios.`,
    config: {
      temperature: 0.7,
    },
  });
  return response.text;
};

export const getMarketInsights = async (propertyType, location) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Proporciona 3 consejos de mercado breves y prácticos en ESPAÑOL para un ${propertyType} en ${location}. Enfócate en tendencias actuales y estrategia de precios.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING, description: "El consejo o tendencia de mercado" },
            impact: { type: Type.STRING, description: "El impacto esperado en el negocio" }
          },
          required: ["insight", "impact"]
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const readMeterImage = async (base64Image) => {
  const ai = getAIClient();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };
  
  const textPart = {
    text: "Analiza esta imagen de un medidor (luz, agua o gas). Extrae únicamente el valor numérico actual que muestra el contador. Responde solo con el número, sin texto adicional."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  const cleanedText = response.text?.replace(/[^0-9.]/g, '') || '';
  return parseFloat(cleanedText);
};

export const parseServiceBill = async (base64Data, mimeType) => {
  const ai = getAIClient();
  const documentPart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data.split(',')[1] || base64Data,
    },
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        documentPart, 
        { text: "Analiza esta factura de servicio. Extrae los siguientes datos en formato JSON: contractNumber (el numero de cliente, cuenta o medidor), serviceType (debe ser 'Luz', 'Agua' o 'Gas'), totalAmount (solo el numero decimal), dueDate (fecha de vencimiento YYYY-MM-DD). Si no encuentras algo, pon null." }
      ] 
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contractNumber: { type: Type.STRING },
          serviceType: { type: Type.STRING },
          totalAmount: { type: Type.NUMBER },
          dueDate: { type: Type.STRING }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};