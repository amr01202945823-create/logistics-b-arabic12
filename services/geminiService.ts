
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { Company, Article, Shipment } from '../types';
import { CUSTOMS_KNOWLEDGE_BASE } from '../data/customsKnowledge';

// Initialize GoogleGenAI
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
    systemInstructionOverride?: string,
    problemDescription?: string,
    pickupLocation?: string,
    pickupDate?: string,
    departureDate?: string
): Promise<{ advice: string; groundingChunks: { maps?: { uri?: string; title?: string } }[] | undefined; recommendedCompanies: Company[] }> => {
  try {
    const originLower = origin.toLowerCase();
    const destinationLower = destination.toLowerCase();

    // 1. SMART FILTERING (Companies)
    // Filter companies that actually serve this route or purpose
    const safeCompanies = Array.isArray(companies) ? companies : [];
    const relevantCompanies = safeCompanies.filter(company => {
        // Shipping Lines: Must serve Origin or Destination ports
        const servesOrigin = company.ports.some(p => p.toLowerCase().includes(originLower));
        const servesDestination = company.serviceAreas 
            ? Object.values(company.serviceAreas).some((area: any) => 
                area.locations.some((loc: string) => loc.toLowerCase().includes(destinationLower))
              )
            : false;
        
        // Customs Brokers: Relevant if they operate in the Origin or Destination country (simplified check via ports/address)
        const isRelevantBroker = company.category === 'customs-broker' && (
            company.branches.some(b => b.address.en.toLowerCase().includes(originLower) || b.address.en.toLowerCase().includes(destinationLower)) ||
            company.ports.some(p => p.toLowerCase().includes(originLower) || p.toLowerCase().includes(destinationLower))
        );

        // Trucking: Relevant if Pickup Location is specified
        const isRelevantTrucking = company.category === 'transportation' && pickupLocation;

        // Freight Forwarders: Generally relevant for coordination
        const isForwarder = company.category === 'freight-forwarder';

        return ((servesOrigin || servesDestination) || isRelevantBroker || isRelevantTrucking || isForwarder) && company.status === 'approved';
    }).slice(0, 4); // Limit to top 4 most relevant

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

    // 3. WEATHER & INLAND ANALYSIS PROMPT (Combined Maps & Search)
    // We let the model use tools dynamically based on instructions.

    // 4. STRATEGIC PARTNER PROMPT ENGINEERING
    // Implementing the "Logistics Command Center" Persona with TRAINED DATA
    const systemInstruction = systemInstructionOverride || (language === 'ar' 
        ? `أنت "مركز العمليات اللوجستية الشامل" (Unified Logistics Command Center).
           لقد تم تدريبك على قوانين الجمارك المصرية (قانون 207، نافذة ACI)، ونظام النديب القطري، واتفاقيات التجارة الحرة العربية، وبروتوكول مونتريال.
           
           يجب أن تتحدث بلسان كل مسؤول وتحدد مهامه بدقة بناءً على المدخلات:
           ([اسم البضاعة]، الوزن: ${weight}، من ${pickupLocation ? pickupLocation + ' ثم ' : ''}${origin} إلى ${destination}، شرط ${incoterm}).

           **تعليمات خاصة بالطقس (هام جداً):**
           - **لا تكرر نصائح الطقس العامة** (مثل "تحقق من الطقس قبل الشحن"). هذا يزعج المحترفون.
           - تحقق *فقط* من حالة الطقس المتوقعة في "${pickupLocation}" بتاريخ "${pickupDate}" وفي ميناء "${origin}" بتاريخ "${departureDate}" باستخدام Google Search.
           - إذا كان الطقس طبيعيًا، لا تذكره.
           - اذكر الطقس *فقط* إذا كان هناك خطر حقيقي:
             1. أمطار غزيرة تهدد بضائع حساسة للرطوبة (مثل الورق، الأسمنت، الحبوب).
             2. عواصف (نوة) قد تغلق ميناء الإسكندرية أو الدخيلة في التواريخ المحددة.
             3. حرارة شديدة تتطلب حاويات مبردة (Reefer) لبضائع غذائية.

           حلل الشحنة وقسم الرد بوضوح تام إلى الأقسام التالية (استخدم العناوين العريضة):

           ### 1. تقرير المخلص الجمركي (Customs Broker) 🛂
           *   **تصنيف البضاعة (HS Code):** توقع الكود بدقة.
           *   **الامتثال القانوني:** استشهد بالقوانين من "قاعدة المعرفة" أدناه.
           *   **المستندات والمصاريف المتوقعة:** اذكر المصاريف الواقعية مثل (فحص زراعي، هيئة سلامة الغذاء، نثريات، مشال) إذا كانت البضاعة غذائية أو زراعية.

           ### 2. خطة مقاول النقل الداخلي (Transport Contractor) 🚚
           *   **تحليل الطريق:** المسافة والوقت من خرائط جوجل.
           *   **مخاطر الطريق:** (اذكر الطقس هنا فقط إذا كان هناك خطر انزلاق أو سيول).
           *   **نوع الشاحنة:** (تريلا، جوانب، مبرد) بناءً على الوزن والحجم.

           ### 3. استراتيجية الخط الملاحي (Shipping Line) 🚢
           *   **حالة الميناء:** (اذكر الطقس هنا فقط إذا كان هناك تحذير من إغلاق البوغاز).
           *   **معدات الشحن:** عدد ونوع الحاويات.
           *   **المسار البحري:** الموانئ الوسيطة.

           ### 4. دور وكيل الشحن (Freight Forwarder) 📋
           *   **بوليصة الشحن (B/L):** نوع البوليصة المناسب.
           *   **التنسيق:** آلية الربط بين النقل البري والبحري.

           ### 5. الخلاصة للمصدر/المستورد (Trader View) 💼
           *   **التكلفة التقديرية (Cost Breakdown):** (جدول Markdown يشمل النولون، التخليص، والنقل).
           *   **قرار نهائي:** هل العملية مجدية ومحسوبة المخاطر؟

           **استخدم تنسيق Markdown بشكل احترافي وجداول وعلامات نقطية.**`
        : `You are the "Unified Logistics Command Center".
           You have been trained on Egyptian Customs Law (207/Nafeza), Qatar's Al Nadeeb system, Arab Free Trade Agreements, and the Montreal Protocol.
           
           Act as EACH of the following roles and provide their specific execution plan based on:
           ([Cargo], Weight: ${weight}, From ${pickupLocation ? pickupLocation + ' then ' : ''}${origin} To ${destination}, Incoterm: ${incoterm}).

           **Weather Rules (Critical):**
           - **DO NOT give generic weather advice** (e.g., "Check weather before shipping").
           - Use Google Search to check forecast ONLY for specific dates: "${pickupDate}" at pickup and "${departureDate}" at POL.
           - Mention weather ONLY if there is a specific risk:
             1. Rain threatening moisture-sensitive cargo.
             2. Storms/Nawa likely to close Alexandria/Dekheila ports.
             3. Extreme heat requiring Reefer containers.
           - If weather is mild, skip this section to avoid repetition.

           ### 1. Customs Broker Report 🛂
           *   **HS Code Classification:** Predict the code.
           *   **Legal Compliance:** Cite regulations from the "TRAINING DATA" below.
           *   **Expected Expenses:** List realistic items like (Agri Inspection, Food Safety Authority, Nathria, Mashal) if applicable.

           ### 2. Transport Contractor Plan 🚚
           *   **Route Analysis:** Distance & Time from Google Maps.
           *   **Road Risks:** (Mention weather only if flash floods/slippery roads are forecast).
           *   **Truck Type:** Based on cargo/weight.

           ### 3. Shipping Line Strategy 🚢
           *   **Port Status:** (Mention weather only if port closure is likely).
           *   **Equipment:** Container type/qty calculation.
           *   **Sea Route:** Transit time.

           ### 4. Freight Forwarder Role 📋
           *   **Bill of Lading:** Type recommended.
           *   **Coordination:** Handover points.

           ### 5. Exporter/Importer Executive Summary 💼
           *   **Cost Estimate:** (Markdown Table).
           *   **Final Verdict:** Go/No-Go advice.

           **Use professional Markdown, tables, and bullet points.**`);

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

    // Use both Maps and Search tools
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
      }
    });
    
    if (!response.text) throw new Error("Empty AI response.");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || undefined;

    return { advice: response.text, groundingChunks, recommendedCompanies: relevantCompanies };

  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMsg = language === 'ar' 
        ? `### ⚠️ تعذر تشكيل غرفة العمليات\nحدث خطأ في معالجة البيانات، يرجى المحاولة مرة أخرى.`
        : `### ⚠️ Command Center Offline\nError processing data, please try again.`;
    return { advice: errorMsg, groundingChunks: undefined, recommendedCompanies: [] };
  }
};

export const getHSCode = async (productDescription: string, language: 'ar' | 'en', systemInstructionOverride?: string): Promise<string> => {
    const langInstruction = language === 'ar' ? 'Arabic' : 'English';
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Role: Customs Broker trained on Egyptian Customs Tariff & Harmonized System. 
            Task: Fuzzy search HS Code for "${productDescription}".
            Reference Context:
            ${CUSTOMS_KNOWLEDGE_BASE}
            
            Return strict JSON only.
            Format: { suggestions: [{ code: "6-digit", itemName: "English Name", description: "${langInstruction} Desc (Mention any prohibitions from context)" }] }`,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) throw new Error("Empty response");
        return response.text;
    } catch (error) {
        console.error("HS Code Error:", error);
        return JSON.stringify({ suggestions: [{ code: "Error", itemName: "N/A", description: (error as Error).message }] });
    }
};

export const generateProfessionalEmail = async (
    companyName: string, 
    context: { origin: string, destination: string, goods: string, weight: string, type: string },
    language: 'ar' | 'en'
): Promise<string> => {
  try {
    const systemPrompt = language === 'ar' 
        ? `أنت مساعد لوجستي محترف. قم بصياغة بريد إلكتروني رسمي قصير لطلب عرض سعر.`
        : `You are a professional logistics assistant. Draft a short, formal RFQ (Request for Quotation) email.`;

    const userPrompt = language === 'ar'
        ? `اكتب مسودة إيميل لشركة "${companyName}".
           الموضوع: طلب عرض سعر شحن (RFQ)
           التفاصيل:
           - من: ${context.origin}
           - إلى: ${context.destination}
           - البضاعة: ${context.goods}
           - الوزن: ${context.weight}
           - النوع: ${context.type}
           
           اجعل الإيميل احترافيًا، قصيرًا، وجاهزًا للإرسال.`
        : `Draft an email to "${companyName}".
           Subject: RFQ - Freight Inquiry
           Details:
           - From: ${context.origin}
           - To: ${context.destination}
           - Cargo: ${context.goods}
           - Weight: ${context.weight}
           - Type: ${context.type}
           
           Make it professional, concise, and ready to send.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userPrompt }] }
      ]
    });
    return response.text || "Error generating email.";
  } catch (error) {
    console.error("Email Gen Error", error);
    return "Failed to generate email.";
  }
};
