
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { Company, Article, Shipment } from '../types';
import { CUSTOMS_KNOWLEDGE_BASE } from '../data/customsKnowledge';

// FIX: Initialize GoogleGenAI according to guidelines using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShippingAdvice = async (
    origin: string, 
    destination: string, 
    goods: string, 
    incoterm: string, 
    shipmentType: string, 
    quantity: string, 
    weight: string, 
    companies: Company[],
    articles: Article[],
    language: 'ar' | 'en',
    systemPromptOverride?: string,
    problemDescription?: string,
    pickupLocation?: string,
    pickupDate?: string,
    departureDate?: string,
    onStreamUpdate?: (text: string) => void // Callback for UI streaming
): Promise<{ advice: string; groundingChunks: { maps?: { uri?: string; title?: string } }[] | undefined; recommendedCompanies: Company[] }> => {
  try {
    const originLower = origin.toLowerCase();
    const destinationLower = destination.toLowerCase();

    // 1. SMART FILTERING (Companies)
    const safeCompanies = Array.isArray(companies) ? companies : [];
    const relevantCompanies = safeCompanies.filter(company => {
        const servesOrigin = company.ports.some(p => p.toLowerCase().includes(originLower));
        const servesDestination = company.serviceAreas 
            ? Object.values(company.serviceAreas).some((area: any) => 
                area.locations.some((loc: string) => loc.toLowerCase().includes(destinationLower))
              )
            : false;
        
        const isRelevantBroker = company.category === 'customs-broker' && (
            company.branches.some(b => b.address.en.toLowerCase().includes(originLower) || b.address.en.toLowerCase().includes(destinationLower)) ||
            company.ports.some(p => p.toLowerCase().includes(originLower) || p.toLowerCase().includes(destinationLower))
        );

        const isRelevantTrucking = company.category === 'transportation' && pickupLocation;
        const isForwarder = company.category === 'freight-forwarder';

        return ((servesOrigin || servesDestination) || isRelevantBroker || isRelevantTrucking || isForwarder) && company.status === 'approved';
    }).slice(0, 4);

    const companyContext = relevantCompanies.length > 0
        ? relevantCompanies.map(c => `- ${c.name[language]} (${c.category}): ${c.description[language]}`).join('\n')
        : (language === 'ar' ? 'لا توجد شركات مسجلة تطابق هذا المسار بدقة.' : 'No specific registered companies found for this exact route.');

    // 2. KNOWLEDGE BASE FILTERING
    const safeArticles = Array.isArray(articles) ? articles : [];
    const relevantArticles = safeArticles.filter(article => {
        const text = (article.title[language] + ' ' + article.summary[language]).toLowerCase();
        return text.includes('customs') || text.includes(originLower) || text.includes(destinationLower) || 
               (goods && text.includes(goods.split(' ')[0].toLowerCase()));
    }).slice(0, 2);

    const articleContext = relevantArticles.length > 0
        ? relevantArticles.map(a => `- Ref: ${a.title[language]} (${a.summary[language]})`).join('\n')
        : 'General Maritime Law';

    // 3. SYSTEM PROMPT ENGINEERING
    const systemInstruction = systemPromptOverride || (language === 'ar' 
        ? `أنت "مركز العمليات اللوجستية الشامل" (Unified Logistics Command Center).
           لقد تم تدريبك على قوانين الجمارك المصرية (قانون 207، نافذة ACI)، ونظام النديب القطري، واتفاقيات التجارة الحرة العربية، وبروتوكول مونتريال.
           
           يجب أن تتحدث بلسان كل مسؤول وتحدد مهامه بدقة بناءً على المدخلات:
           ([اسم البضاعة]، الوزن: ${weight}، من ${pickupLocation ? pickupLocation + ' ثم ' : ''}${origin} إلى ${destination}، شرط ${incoterm}).

           **تعليمات خاصة بالطقس (هام جداً):**
           - استخدم Google Search للتحقق من حالة الطقس المتوقعة في "${pickupLocation}" بتاريخ "${pickupDate}" وفي ميناء "${origin}" بتاريخ "${departureDate}".
           - اذكر الطقس فقط إذا كان هناك خطر حقيقي يهدد الشحنة (أمطار، عواصف، حرارة).

           حلل الشحنة وقسم الرد بوضوح تام إلى الأقسام التالية:
           ### 1. تقرير المخلص الجمركي (Customs Broker) 🛂
           ### 2. خطة مقاول النقل الداخلي (Transport Contractor) 🚚
           ### 3. استراتيجية الخط الملاحي (Shipping Line) 🚢
           ### 4. دور وكيل الشحن (Freight Forwarder) 📋
           ### 5. الخلاصة للمصدر/المستورد (Trader View) 💼`
        : `You are the "Unified Logistics Command Center".
           You have been trained on Egyptian Customs Law (207/Nafeza), Qatar's Al Nadeeb system, Arab Free Trade Agreements, and the Montreal Protocol.
           
           Act as EACH of the following roles and provide their specific execution plan based on:
           ([Cargo], Weight: ${weight}, From ${pickupLocation ? pickupLocation + ' then ' : ''}${origin} To ${destination}, Incoterm: ${incoterm}).

           **Weather Rules (Critical):**
           - Use Google Search to check forecast ONLY for specific dates: "${pickupDate}" at pickup and "${departureDate}" at POL.
           - Mention weather ONLY if there is a specific risk (rain, storm, heat).

           ### 1. Customs Broker Report 🛂
           ### 2. Transport Contractor Plan 🚚
           ### 3. Shipping Line Strategy 🚢
           ### 4. Freight Forwarder Role 📋
           ### 5. Exporter/Importer Executive Summary 💼`);

    const prompt = `
    ${systemInstruction}

    **SHIPMENT DETAILS:**
    - Pickup: ${pickupLocation || 'Not Specified'} (Date: ${pickupDate || 'Not Specified'})
    - POL: ${origin} (Expected Departure: ${departureDate || 'Not Specified'})
    - POD: ${destination}
    - Commodity: ${goods}
    - Weight: ${weight}
    - Details: ${incoterm} | ${shipmentType} | ${quantity}
    - Problem/Context: ${problemDescription || 'Standard commercial operation'}
    
    **AVAILABLE PARTNERS IN DIRECTORY:**
    ${companyContext}
    
    **TRAINING DATA (REGULATORY CONTEXT):**
    ${CUSTOMS_KNOWLEDGE_BASE}
    
    **ADDITIONAL KNOWLEDGE:**
    ${articleContext}

    Language: ${language}
    `;

    // FIX: Using gemini-2.5-flash-lite-latest for combined search and maps grounding as per guidelines
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-lite-latest',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
      }
    });
    
    let fullText = '';
    let groundingChunks: { maps?: { uri?: string; title?: string } }[] | undefined = undefined;

    for await (const chunk of responseStream) {
        // FIX: Accessing .text property directly instead of method
        const text = chunk.text;
        if (text) {
            fullText += text;
            if (onStreamUpdate) onStreamUpdate(fullText);
        }
        
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            groundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
        }
    }

    if (!fullText) throw new Error("Empty AI response.");

    return { advice: fullText, groundingChunks, recommendedCompanies: relevantCompanies };

  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMsg = language === 'ar' 
        ? `### ⚠️ تعذر تشكيل غرفة العمليات\nحدث خطأ في معالجة البيانات.`
        : `### ⚠️ Command Center Offline\nError processing data.`;
    if (onStreamUpdate) onStreamUpdate(errorMsg);
    return { advice: errorMsg, groundingChunks: undefined, recommendedCompanies: [] };
  }
};

export const getHSCode = async (productDescription: string, language: 'ar' | 'en', systemInstructionOverride?: string): Promise<string> => {
    const langInstruction = language === 'ar' ? 'Arabic' : 'English';
    try {
        // FIX: Using gemini-3-flash-preview for basic text tasks (classification) and providing a responseSchema
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Identify HS Code for: "${productDescription}" based on:
            ${CUSTOMS_KNOWLEDGE_BASE}`,
            config: {
                systemInstruction: `Role: Customs Broker trained on Egyptian Customs Tariff & Harmonized System. Use ${langInstruction} for descriptions.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    code: { type: Type.STRING, description: "The 6-digit HS code" },
                                    itemName: { type: Type.STRING, description: "Official English name" },
                                    description: { type: Type.STRING, description: "Detailed description in requested language" }
                                },
                                required: ["code", "itemName", "description"]
                            }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });

        if (!response.text) throw new Error("Empty response");
        return response.text;
    } catch (error) {
        console.error("HS Code Error:", error);
        return JSON.stringify({ suggestions: [{ code: "Error", itemName: "N/A", description: "Failed to identify code" }] });
    }
};

export const generateProfessionalEmail = async (
    companyName: string, 
    context: { origin: string, destination: string, goods: string, weight: string, type: string },
    language: 'ar' | 'en'
): Promise<string> => {
  try {
    const systemPrompt = language === 'ar' 
        ? `أنت مساعد لوجستي محترف. قم بصياغة بريد إلكتروني رسمي لطلب عرض سعر (RFQ).`
        : `You are a professional logistics assistant. Draft a formal RFQ email.`;

    const userPrompt = `Draft an email to "${companyName}".
           Subject: RFQ - Freight Inquiry for ${context.goods}
           Details: From ${context.origin} To ${context.destination}, Weight: ${context.weight}, Type: ${context.type}`;

    // FIX: Using gemini-3-flash-preview for email generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: { systemInstruction: systemPrompt }
    });
    return response.text || "Error generating email.";
  } catch (error) {
    console.error("Email Gen Error", error);
    return "Failed to generate email.";
  }
};
