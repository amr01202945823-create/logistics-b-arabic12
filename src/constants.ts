

import type { Article, Company, MaritimeScenario } from './types';

export const DEFAULT_SCENARIOS: MaritimeScenario[] = [
    {
        id: 1,
        route: { ar: 'جدة ← روتردام', en: 'Jeddah → Rotterdam' },
        routeDesc: { ar: 'تنبيهات البحر الأحمر مفعلة • المسار الموصى به عبر رأس الرجاء الصالح', en: 'Red Sea Alerts • Recommended via Cape of Good Hope' },
        score: 92,
        hsCode: 'HS 8418.69',
        hsDesc: { ar: 'وحدات تبريد • رسوم مبسطة للسعودية والإمارات', en: 'Cooling Units • Simplified fees for SA & UAE' },
        status: 'critical'
    },
    {
        id: 2,
        route: { ar: 'شنغهاي ← جبل علي', en: 'Shanghai → Jebel Ali' },
        routeDesc: { ar: 'المسار مباشر • الطقس جيد • لا توجد تنبيهات', en: 'Direct Route • Good Weather • No Alerts' },
        score: 98,
        hsCode: 'HS 8517.62',
        hsDesc: { ar: 'أجهزة اتصالات • إعفاء جمركي للمناطق الحرة', en: 'Telecom Devices • Duty Free for Free Zones' },
        status: 'optimal'
    },
    {
        id: 3,
        route: { ar: 'الإسكندرية ← فالنسيا', en: 'Alexandria → Valencia' },
        routeDesc: { ar: 'ازدحام في ميناء الوصول • تأخير محتمل 3 أيام', en: 'Port Congestion • 3 Days Delay Expected' },
        score: 75,
        hsCode: 'HS 0805.10',
        hsDesc: { ar: 'برتقال طازج • فحص صحة نباتية مطلوب', en: 'Fresh Oranges • Phytosanitary Check Required' },
        status: 'warning'
    }
];

export const ARTICLES: Article[] = [
  {
    id: 101,
    category: 'customs',
    date: { ar: '1 يناير 2025', en: '1 January 2025' },
    title: { ar: 'الدليل الجمركي الموحد (مصر وقطر)', en: 'Unified Customs Guide (Egypt & Qatar)' },
    summary: { 
        ar: 'خلاصة القوانين المحدثة: قانون الجمارك المصري رقم 207، نظام التسجيل المسبق (ACI)، ودليل المخلص الجمركي لنظام النديب القطري.', 
        en: 'Summary of updated laws: Egyptian Customs Law No. 207, ACI system, and the Customs Broker Guide for Qatar\'s Al Nadeeb.' 
    },
    content: { 
        ar: `### نظام التسجيل المسبق للشحنات (ACI) - مصر
وفقاً للقانون رقم 207 لسنة 2020، يجب على المستوردين تسجيل بيانات الشحنة قبل الشحن للحصول على رقم ACID. يهدف النظام إلى تقليص زمن الإفراج الجمركي ومنع دخول البضائع مجهولة المصدر.

### نظام النديب - قطر
المنصة الرسمية للتخليص الجمركي في قطر. تتطلب من المخلصين الجمركيين (عام أو خاص) الحصول على ترخيص وممارسة المهنة وفقاً للدليل المختصر 2014. يشمل النظام تقديم المنافيست إلكترونياً وتبادل إذن التسليم.

### بروتوكول مونتريال (المواد المستنفدة للأوزون)
تخضع وسائط التبريد (مثل R-22 و R-134a) لرقابة صارمة. يجب الحصول على موافقة مسبقة من جهاز شؤون البيئة ووحدة الأوزون قبل الاستيراد. الاسطوانات الملونة (أخضر فاتح لـ R-22) هي المعيار المعتمد.`, 
        en: `### Advance Cargo Information (ACI) - Egypt
Under Law No. 207 of 2020, importers must register shipment details pre-shipment to obtain an ACID number. The system aims to reduce clearance time and prevent anonymous cargo entry.

### Al Nadeeb System - Qatar
The official single window for customs clearance in Qatar. Customs brokers (General or Private) must be licensed and operate according to the 2014 Broker Guide. The system includes electronic manifest submission and delivery order exchange.

### Montreal Protocol (Ozone Depleting Substances)
Refrigerants (like R-22 and R-134a) are strictly controlled. Prior approval from the Environmental Affairs Agency and Ozone Unit is required before import. Color-coded cylinders (Light Green for R-22) are the approved standard.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1566576912902-6e7710c7333a?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 1,
    category: 'ports',
    date: { ar: '10 ديسمبر 2024', en: '10 December 2024' },
    title: { ar: 'أهم الموانئ العربية: بوابات التجارة العالمية', en: 'Top Arab Ports: Gateways to Global Trade' },
    summary: { 
        ar: 'تحليل متعمق لأداء الموانئ المحورية في المنطقة مثل جبل علي، وميناء جدة الإسلامي، وطنجة المتوسط، ودورها في تعزيز سلاسل الإمداد.', 
        en: 'In-depth analysis of pivotal regional ports like Jebel Ali, Jeddah Islamic Port, and Tangier Med, and their role in bolstering supply chains.' 
    },
    content: { 
        ar: `تعتبر الموانئ العربية شريان الحياة للاقتصاد العالمي، نظرًا لموقعها الاستراتيجي الذي يربط بين الشرق والغرب. في هذا التقرير، نسلط الضوء على العمالقة الثلاثة الذين يعيدون تشكيل الخريطة اللوجستية.

### 1. ميناء جبل علي (الإمارات)
يُعد أكبر ميناء من صنع الإنسان في العالم والأكثر ازدحامًا في الشرق الأوسط. يتميز بقدرات تكنولوجية هائلة وأنظمة أتمتة متقدمة تجعل من عملية المناولة الأسرع في المنطقة. يرتبط الميناء بمنطقة حرة توفر حوافز ضريبية وجمركية تجذب كبرى الشركات العالمية.

### 2. ميناء جدة الإسلامي (السعودية)
بوابة المملكة إلى البحر الأحمر، يمر عبره أكثر من 70% من واردات السعودية. يشهد الميناء حالياً عمليات توسعة ضخمة ضمن رؤية 2030 لزيادة طاقته الاستيعابية وتحويله إلى منصة لوجستية عالمية، مع تحسينات كبيرة في إجراءات الفسح الجمركي لتقليل زمن بقاء الحاويات.

### 3. ميناء طنجة المتوسط (المغرب)
جوهرة المتوسط وأكبر ميناء في أفريقيا من حيث حجم الحاويات. موقعه الفريد على مضيق جبل طارق يجعله نقطة عبور حاسمة للتجارة بين أوروبا وأفريقيا والأمريكتين. يرتبط بشبكة سكك حديدية وطرق سريعة تعزز من كفاءة النقل متعدد الوسائط.

### الخلاصة
الاستثمار في البنية التحتية لهذه الموانئ لا يقتصر على التوسع المادي فحسب، بل يشمل التحول الرقمي وتبني تقنيات الموانئ الذكية لضمان استدامة وكفاءة تدفق البضائع في ظل التحديات العالمية.`, 
        en: `Arab ports act as the lifeline of the global economy due to their strategic location connecting East and West. In this report, we highlight the three giants reshaping the logistics map.

### 1. Jebel Ali Port (UAE)
The world's largest man-made harbor and the busiest port in the Middle East. It features immense technological capabilities and advanced automation systems, making handling processes the fastest in the region. The port is linked to a free zone offering tax and customs incentives that attract major global corporations.

### 2. Jeddah Islamic Port (Saudi Arabia)
The Kingdom's gateway to the Red Sea, handling over 70% of Saudi Arabia's imports. The port is currently undergoing massive expansion under Vision 2030 to increase capacity and transform into a global logistics hub, with significant improvements in customs clearance procedures to reduce container dwell time.

### 3. Tangier Med (Morocco)
The jewel of the Mediterranean and Africa's largest port by container volume. Its unique location on the Strait of Gibraltar makes it a crucial transit point for trade between Europe, Africa, and the Americas. It is connected by a railway and highway network that enhances multimodal transport efficiency.

### Conclusion
Investment in these ports' infrastructure is not limited to physical expansion but includes digital transformation and the adoption of smart port technologies to ensure the sustainable and efficient flow of goods amidst global challenges.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1577908528652-32a2f865390e?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    category: 'financial',
    date: { ar: '12 ديسمبر 2024', en: '12 December 2024' },
    title: { ar: 'الدليل الشامل لحساب تكلفة الشحن البحري', en: 'Comprehensive Guide to Calculating Sea Freight Costs' },
    summary: { 
        ar: 'كيف تتجنب الرسوم الخفية؟ تفصيل دقيق لمكونات تكلفة الشحن من النولون الأساسي إلى رسوم المحطة والتخليص.', 
        en: 'How to avoid hidden fees? A detailed breakdown of shipping cost components from basic ocean freight to THC and clearance.' 
    },
    content: { 
        ar: `حساب تكلفة الشحن البحري بدقة هو الفاصل بين الربح والخسارة في الصفقات التجارية. إليك المكونات الرئيسية التي يجب عليك مراعاتها:

### 1. النولون البحري الأساسي (Ocean Freight)
وهو تكلفة نقل الحاوية من ميناء الشحن إلى ميناء الوصول. يتأثر هذا السعر بالعرض والطلب، وأسعار الوقود (BAF)، وأسعار صرف العملات (CAF).

### 2. رسوم تداول الحاويات (THC)
تفرضها الموانئ مقابل تحميل وتفريغ الحاويات من السفينة. تختلف هذه الرسوم بين ميناء التحميل (OTHC) وميناء الوصول (DTHC).

### 3. مصاريف الشحن المحلية والتخليص
تشمل نقل الحاوية من المصنع إلى الميناء (Trucking)، رسوم التخليص الجمركي، وإصدار بوليصة الشحن (B/L Fees).

### 4. التأمين البحري
لا تغفل التأمين! عادة ما تكون تكلفته نسبة ضئيلة من قيمة البضاعة (مثلاً 0.2%)، لكنه يحميك من خسائر فادحة في حال الغرق أو التلف.

### نصيحة الخبراء
دائماً اطلب عرض سعر "All-In" من وكيل الشحن الخاص بك لتتجنب المفاجآت، وتأكد من معرفة فترة السماح (Free Time) لتفادي غرامات التأخير (Demurrage & Detention) التي قد تلتهم أرباحك.`, 
        en: `Accurately calculating sea freight costs is often the dividing line between profit and loss in trade deals. Here are the key components you must consider:

### 1. Basic Ocean Freight
The cost of moving the container from the port of loading to the port of discharge. This price is influenced by supply and demand, Bunker Adjustment Factor (BAF), and Currency Adjustment Factor (CAF).

### 2. Terminal Handling Charges (THC)
Charged by ports for loading and unloading containers from the vessel. These fees differ between Origin THC (OTHC) and Destination THC (DTHC).

### 3. Local Charges & Clearance
Includes trucking the container from factory to port, customs clearance fees, and Bill of Lading (B/L) issuance fees.

### 4. Marine Insurance
Do not overlook insurance! It typically costs a tiny fraction of the goods' value (e.g., 0.2%), but protects you from catastrophic losses in case of sinking or damage.

### Expert Tip
Always ask for an "All-In" quote from your freight forwarder to avoid surprises, and ensure you know the Free Time period to avoid Demurrage & Detention charges that could eat up your profits.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1579621970795-87f54f5979be?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 3,
    category: 'educational',
    date: { ar: '15 ديسمبر 2024', en: '15 December 2024' },
    title: { ar: 'أنواع الحاويات البحرية: ماذا تختار لشحنتك؟', en: 'Types of Sea Containers: What to Choose?' },
    summary: { 
        ar: 'دليل عملي للفرق بين الحاويات الجافة، المبردة، والمفتوحة، وكيفية اختيار الأنسب لنوع بضاعتك.', 
        en: 'A practical guide to the differences between Dry, Reefer, and Open Top containers, and how to choose the right one for your cargo.' 
    },
    content: { 
        ar: `اختيار الحاوية المناسبة هو الخطوة الأولى لضمان وصول بضاعتك سليمة. إليك أشهر الأنواع:

*   **الحاويات الجافة (Dry Van - DV):** تأتي بمقاسات 20 و40 قدم. مثالية للبضائع العامة المعبأة في كراتين، صناديق، أو بالتات.
*   **حاويات السقف المرتفع (High Cube - HC):** تشبه حاوية 40 قدم لكنها أكثر ارتفاعاً، مما يوفر مساحة تخزين إضافية للبضائع الخفيفة ولكن ضخمة الحجم.
*   **الحاويات المبردة (Reefer):** مجهزة بوحدة تبريد للحفاظ على درجة حرارة ثابتة. ضرورية للأدوية، الفواكه، اللحوم، والمنتجات الحساسة للحرارة.
*   **حاويات مفتوحة السقف (Open Top):** لشحن البضائع ذات الارتفاع الزائد التي لا يمكن إدخالها من الباب التقليدي، مثل الآلات الكبيرة.
*   **الحاويات المسطحة (Flat Rack):** عبارة عن قاعدة بدون جوانب أو سقف، تستخدم للبضائع الثقيلة جداً أو خارجة الأبعاد (Out of Gauge) مثل المعدات الإنشائية.

**نصيحة:** تأكد دائماً من وزن بضاعتك قبل الاختيار، فالحاويات الـ 20 قدم غالباً ما تتحمل كثافة وزن أعلى من الـ 40 قدم بالنسبة لحجمها.`, 
        en: `Choosing the right container is the first step to ensuring your cargo arrives intact. Here are the most common types:

*   **Dry Van (DV):** Comes in 20ft and 40ft sizes. Ideal for general cargo packed in cartons, boxes, or pallets.
*   **High Cube (HC):** Similar to a 40ft container but taller, offering extra volume for light but bulky cargo.
*   **Reefer Containers:** Equipped with a refrigeration unit to maintain a constant temperature. Essential for pharmaceuticals, fruits, meat, and heat-sensitive products.
*   **Open Top:** For over-height cargo that cannot be loaded through the standard doors, such as large machinery.
*   **Flat Rack:** A base with no sides or roof, used for very heavy or Out of Gauge (OOG) cargo like construction equipment.

**Tip:** Always check your cargo weight before choosing. 20ft containers often handle higher weight density than 40ft containers relative to their size.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1587139106934-a29443c3b178?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 4,
    category: 'logistics-tech',
    date: { ar: '18 ديسمبر 2024', en: '18 December 2024' },
    title: { ar: 'الذكاء الاصطناعي ومستقبل سلاسل الإمداد', en: 'AI and the Future of Supply Chains' },
    summary: { 
        ar: 'كيف يغير التنبؤ بالطلب والمسارات الذكية وجه اللوجستيات؟ استكشاف لأحدث صيحات التقنية.', 
        en: 'How demand forecasting and smart routing are changing the face of logistics? Exploring the latest tech trends.' 
    },
    content: { 
        ar: `لم يعد الذكاء الاصطناعي (AI) خيالاً علمياً في عالم اللوجستيات، بل أصبح ضرورة.

**1. التخطيط التنبؤي:**
تستخدم الخوارزميات البيانات التاريخية للتنبؤ بالطلب بدقة عالية، مما يساعد الشركات على تحسين مخزونها وتقليل الهدر.

**2. تحسين المسارات:**
بدلاً من الاعتماد على الخبرة البشرية فقط، تقوم أنظمة AI بتحليل حالة الطقس، والازدحام في الموانئ، والمخاطر السياسية في الوقت الفعلي لاقتراح المسار الأسرع والأرخص (تماماً كما تفعل أداتنا "مخطط المسارات").

**3. المستندات الذكية:**
تقنيات OCR و NLP يمكنها قراءة الفواتير وبواليص الشحن واستخراج البيانات منها تلقائياً، مما يقلل من الأخطاء البشرية ويسرع عمليات التخليص الجمركي.

المستقبل يتجه نحو "اللوجستيات الاستباقية"، حيث يحل النظام المشكلة قبل أن تحدث.`, 
        en: `Artificial Intelligence (AI) is no longer science fiction in the logistics world; it has become a necessity.

**1. Predictive Planning:**
Algorithms use historical data to forecast demand with high accuracy, helping companies optimize inventory and reduce waste.

**2. Route Optimization:**
Instead of relying solely on human expertise, AI systems analyze weather conditions, port congestion, and political risks in real-time to suggest the fastest and cheapest route (just like our "Route Planner" tool).

**3. Smart Documentation:**
OCR and NLP technologies can read invoices and bills of lading, automatically extracting data, reducing human error, and speeding up customs clearance.

The future is heading towards "Proactive Logistics," where the system solves a problem before it even happens.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 5,
    category: 'warehousing',
    date: { ar: '20 ديسمبر 2024', en: '20 December 2024' },
    title: { ar: 'استراتيجيات المستودعات الذكية: ما بعد التخزين', en: 'Smart Warehouse Strategies: Beyond Storage' },
    summary: { 
        ar: 'التحول من المخازن التقليدية إلى مراكز التوزيع المؤتمتة باستخدام الروبوتات وأنظمة WMS.', 
        en: 'Shifting from traditional warehouses to automated distribution centers using robotics and WMS.' 
    },
    content: { 
        ar: `المستودع الحديث لم يعد مجرد مكان لتكديس البضائع، بل مركز حيوي للعمليات.

*   **أنظمة إدارة المستودعات (WMS):** تتيح تتبع كل قطعة بضاعة بدقة متناهية، مما يقلل من وقت البحث والتحضير.
*   **الأتمتة والروبوتات:** الروبوتات المستقلة (AMRs) تساعد في نقل البضائع داخل المستودع، مما يقلل الجهد البشري ويزيد من سرعة تلبية الطلبات.
*   **التخزين الرأسي:** استغلال الارتفاعات من خلال أنظمة التخزين والاسترجاع الآلي (AS/RS) لتعظيم الاستفادة من المساحة الأرضية المكلفة.

تبني هذه التقنيات يقلل من تكلفة التشغيل ويزيد من رضا العملاء من خلال تسريع التوصيل.`, 
        en: `The modern warehouse is no longer just a place to stack goods, but a vital operational hub.

*   **Warehouse Management Systems (WMS):** Allow tracking every item with extreme precision, reducing search and picking time.
*   **Automation & Robotics:** Autonomous Mobile Robots (AMRs) assist in moving goods within the warehouse, reducing human effort and speeding up order fulfillment.
*   **Vertical Storage:** Utilizing height through Automated Storage and Retrieval Systems (AS/RS) to maximize expensive floor space.

Adopting these technologies reduces operating costs and increases customer satisfaction through faster delivery.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-069242136d1f?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 7,
    category: 'laws-and-regulations',
    date: { ar: '22 ديسمبر 2024', en: '22 December 2024' },
    title: { ar: 'الرقمنة الجمركية في العالم العربي: نافذة وفسح', en: 'Customs Digitalization in the Arab World: Nafeza & Fasah' },
    summary: { 
        ar: 'كيف ساهمت منصات "نافذة" في مصر و"فسح" في السعودية في تقليل زمن الإفراج الجمركي؟', 
        en: 'How platforms like "Nafeza" in Egypt and "Fasah" in Saudi Arabia reduced customs release times.' 
    },
    content: { 
        ar: `تشهد المنطقة العربية ثورة في الإجراءات الجمركية.

**مصر (منصة نافذة - ACI):**
نظام التسجيل المسبق للشحنات (ACI) أصبح إلزامياً. يجب على المصدر التسجيل والحصول على رقم ACID قبل الشحن. هذا النظام قلل من زمن الإفراج الجمركي وقضى على البضائع مجهولة الهوية في الموانئ.

**السعودية (منصة فسح):**
بوابة إلكترونية موحدة تربط جميع الجهات الحكومية المعنية بالاستيراد والتصدير. تتيح تقديم البيانات الجمركية وحجز مواعيد الشاحنات إلكترونياً، مما رفع كفاءة الموانئ السعودية بشكل ملحوظ.

الالتزام بهذه الأنظمة الرقمية ليس خياراً بل شرط أساسي لتجنب الغرامات وإعادة التصدير.`, 
        en: `The Arab region is witnessing a revolution in customs procedures.

**Egypt (Nafeza Platform - ACI):**
The Advance Cargo Information (ACI) system has become mandatory. Exporters must register and obtain an ACID number before shipping. This system has reduced customs release times and eliminated unidentified cargo in ports.

**Saudi Arabia (Fasah Platform):**
A unified electronic portal connecting all government entities involved in import and export. It allows for electronic submission of customs declarations and truck appointment booking, significantly boosting the efficiency of Saudi ports.

Compliance with these digital systems is not an option but a prerequisite to avoid fines and re-export.` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1563693267783-6c8130a158b4?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 6,
    category: 'global-trade',
    date: { ar: '25 ديسمبر 2024', en: '25 December 2024' },
    title: { ar: 'اتفاقيات التجارة الحرة: مفتاحك لصفر جمارك', en: 'Free Trade Agreements: Your Key to Zero Customs' },
    summary: { 
        ar: 'دليل للاستفادة من اتفاقية تيسير التجارة العربية، واتفاقية أغادير، والكوميسا.', 
        en: 'A guide to leveraging PAFTA, Agadir Agreement, and COMESA.' 
    },
    content: { 
        ar: `هل تعلم أن بضاعتك قد تكون معفاة تماماً من الجمارك؟
تتمتع الدول العربية بشبكة من الاتفاقيات التجارية التي يجب على كل مصدر ومستورد معرفتها:

**1. منطقة التجارة الحرة العربية الكبرى (GAFTA/PAFTA):**
تلغي الرسوم الجمركية بين معظم الدول العربية (مثل مصر، السعودية، الإمارات، الأردن) بشرط تقديم شهادة منشأ عربية.

**2. اتفاقية أغادير:**
بين مصر، الأردن، المغرب، وتونس. تسمح بتراكم المنشأ (Cumulation of Origin) للتصدير إلى الاتحاد الأوروبي.

**3. الكوميسا (COMESA):**
سوق ضخمة لشرق وجنوب أفريقيا. تمنح إعفاءات جمركية للصادرات المصرية إلى دول مثل كينيا والسودان.

للاستفادة، تأكد من استيفاء "قواعد المنشأ" وأن بضاعتك مصحوبة بالشهادة الصحيحة (EUR.1 لأوروبا/أغادير، أو شهادة الكوميسا).`, 
        en: `Did you know your cargo might be completely duty-free?
Arab countries enjoy a network of trade agreements that every exporter and importer should know:

**1. Greater Arab Free Trade Area (GAFTA/PAFTA):**
Eliminates customs duties between most Arab countries (e.g., Egypt, Saudi Arabia, UAE, Jordan) provided an Arab Certificate of Origin is submitted.

**2. Agadir Agreement:**
Between Egypt, Jordan, Morocco, and Tunisia. Allows for Cumulation of Origin for exports to the EU.

**3. COMESA:**
A massive market for Eastern and Southern Africa. Grants customs exemptions for Egyptian exports to countries like Kenya and Sudan.

To benefit, ensure you meet "Rules of Origin" and that your goods are accompanied by the correct certificate (EUR.1 for Europe/Agadir, or COMESA Certificate).` 
    },
    imageUrl: 'https://images.unsplash.com/photo-1579532582937-16c11599c921?w=800&auto=format&fit=crop&q=60',
  },
];

export const COMPANIES: Company[] = [
  {
    id: 1,
    name: { ar: 'ميرسك مصر', en: 'Maersk Egypt' },
    description: { ar: 'شركة شحن حاويات دنماركية عالمية وأكبر مشغل لسفن الحاويات والتموين في العالم.', en: 'A Danish integrated container logistics company and the largest container ship and supply vessel operator in the world.' },
    category: 'shipping-line',
    logoShortName: 'MAERSK',
    logoBgColor: '#00A3DA', // Maersk Blue
    ports: ['Alexandria', 'Port Said', 'Damietta', 'Sokhna'],
    branches: [
      { 
        city: { ar: 'الإسكندرية', en: 'Alexandria' }, 
        address: { ar: 'قطعة A2، بلوك 26، المنطقة الحرة العامة، العامرية', en: 'Part A2, Block 26, Public Free Zone, El Amerya' },
        workingHours: { ar: 'الأحد - الخميس: 8:30 ص - 4:30 م', en: 'Sunday - Thursday: 8:30am - 4:30pm' },
        peakTimes: [2, 4, 5, 3, 1] // Busy mid-day
      },
    ],
    serviceAreas: {
      'north_europe': {
        ar: 'شمال أوروبا', en: 'North Europe',
        locations: ['Rotterdam', 'Hamburg', 'Antwerp']
      },
      'mediterranean': {
        ar: 'البحر المتوسط', en: 'Mediterranean',
        locations: ['Valencia', 'Barcelona', 'Genoa']
      }
    },
    contact: { email: 'eg.import@maersk.com', phone: '+2034567890' },
    status: 'approved',
  },
  {
    id: 2,
    name: { ar: 'سي إم إيه - سي جي إم مصر', en: 'CMA CGM Egypt' },
    description: { ar: 'مجموعة عالمية رائدة في الشحن والخدمات اللوجستية.', en: 'A global leading group in shipping and logistics services.' },
    category: 'shipping-line',
    logoShortName: 'CMA CGM',
    logoBgColor: '#002C5A', // CMA CGM Blue
    ports: ['Alexandria', 'Port Said', 'Damietta'],
    branches: [
      { 
        city: { ar: 'الإسكندرية', en: 'Alexandria' }, 
        address: { ar: '95 شارع الحرية، برج الأعظمية', en: '95 Shar El Horeya, Borg El Agadeer' },
        workingHours: { ar: 'الأحد - الخميس: 8:30 ص - 4:30 م', en: 'Sunday - Thursday: 8:30am - 4:30pm' },
        peakTimes: [3, 5, 4, 2, 1]
      }
    ],
    serviceAreas: {
      'asia': {
        ar: 'آسيا', en: 'Asia',
        locations: ['Shanghai', 'Singapore', 'Port Klang']
      },
      'mediterranean': {
        ar: 'البحر المتوسط', en: 'Mediterranean',
        locations: ['Valencia', 'Barcelona', 'Genoa']
      }
    },
    featuredAreas: {
        'reefer': {
            ar: 'خدمات مبردة', en: 'Reefer Services',
            locations: ['Global coverage for perishable goods']
        }
    },
    contact: { email: 'ale.genmbox@cma-cgm.com', phone: '+2031234567' },
    status: 'approved',
  },
  {
    id: 3,
    name: { ar: 'هاباج لويد', en: 'Hapag-Lloyd' },
    description: { ar: 'شركة نقل دولية ألمانية متعددة الجنسيات.', en: 'A German multinational shipping and container transportation company.' },
    category: 'shipping-line',
    logoShortName: 'Hapag-Lloyd',
    logoBgColor: '#D75D1E', // Hapag-Lloyd Orange
    ports: ['Alexandria', 'Damietta'],
    branches: [
      { 
        city: { ar: 'القاهرة', en: 'Cairo' }, 
        address: { ar: 'القرية الذكية، مبنى B210', en: 'Smart Village, Building B210' },
        workingHours: { ar: 'الأحد - الخميس: 9:00 ص - 5:00 م', en: 'Sunday - Thursday: 9:00am - 5:00pm' },
        peakTimes: [2, 3, 5, 4, 2]
      }
    ],
    serviceAreas: {
      'north_america': {
        ar: 'أمريكا الشمالية', en: 'North America',
        locations: ['New York', 'Savannah', 'Houston']
      },
      'north_europe': {
        ar: 'شمال أوروبا', en: 'North Europe',
        locations: ['Rotterdam', 'Hamburg', 'Antwerp']
      }
    },
    contact: { email: 'info.eg@hlag.com', phone: '+2023456789' },
    status: 'approved',
  },
  {
    id: 4,
    name: { ar: 'دي بي شينكر', en: 'DB Schenker' },
    description: { ar: 'شركة لوجستية ألمانية تقدم حلولاً شاملة في سلسلة التوريد.', en: 'German logistics company providing comprehensive solutions in the supply chain.' },
    category: 'freight-forwarder',
    logoShortName: 'DB Schenker',
    logoBgColor: '#EC1D25', // DB Schenker Red
    ports: ['Cairo Airport', 'Alexandria', 'Sokhna'],
    branches: [
      { 
        city: { ar: 'القاهرة', en: 'Cairo' }, 
        address: { ar: 'مطار القاهرة الدولي، قرية البضائع', en: 'Cairo International Airport, Cargo Village' },
        workingHours: { ar: 'الأحد - الخميس: 9:00 ص - 5:30 م', en: 'Sunday - Thursday: 9:00am - 5:30pm' },
        peakTimes: [4, 5, 3, 2, 2]
      }
    ],
     serviceAreas: {
      'air_freight': {
        ar: 'الشحن الجوي', en: 'Air Freight',
        locations: ['Global Network']
      },
      'land_transport': {
        ar: 'النقل البري', en: 'Land Transport',
        locations: ['Europe', 'Middle East']
      }
    },
    featuredAreas: {
        'fairs_exhibitions': {
            ar: 'المعارض والفعاليات', en: 'Fairs & Exhibitions',
            locations: ['Logistics support for global events']
        }
    },
    contact: { email: 'egypt.info@dbschenker.com', phone: '+20226967700' },
    status: 'approved',
  },
  {
    id: 5,
    name: { ar: 'الشرق الأوسط للنقل', en: 'Middle East Transport' },
    description: { ar: 'حلول نقل بري موثوقة في جميع أنحاء المنطقة، مع أسطول حديث من الشاحنات.', en: 'Reliable land transport solutions across the region, with a modern fleet of trucks.' },
    category: 'transportation',
    logoShortName: 'MET',
    logoBgColor: '#334155', // slate-700
    ports: ['Jeddah', 'Dammam', 'Cairo Dry Port'],
    branches: [
      { 
        city: { ar: 'القاهرة', en: 'Cairo' }, 
        address: { ar: 'مدينة نصر، المنطقة الصناعية', en: 'Nasr City, Industrial Zone' },
        workingHours: { ar: 'السبت - الخميس: 9:00 ص - 6:00 م', en: 'Saturday - Thursday: 9:00am - 6:00pm' },
        peakTimes: [2, 3, 5, 4, 1]
      }
    ],
     serviceAreas: {
      'land_transport': {
        ar: 'النقل البري المحلي', en: 'Domestic Land Transport',
        locations: ['All major Egyptian cities']
      },
      'cross_border': {
        ar: 'النقل عبر الحدود', en: 'Cross-border Trucking',
        locations: ['Saudi Arabia', 'Jordan', 'UAE']
      }
    },
    contact: { email: 'info@metransport.com', phone: '+2025550101' },
    status: 'approved',
  },
  {
    id: 6,
    name: { ar: 'الخليج للتخليص الجمركي', en: 'Gulf Customs Clearance' },
    description: { ar: 'تسهيل عمليات الاستيراد والتصدير مع خدمات تخليص جمركي فعالة وسريعة.', en: 'Facilitating import and export with efficient and fast customs brokerage services.' },
    category: 'customs-broker',
    logoShortName: 'GCC',
    logoBgColor: '#166534', // green-800
    ports: ['Alexandria', 'Port Said', 'Sokhna', 'Damietta'],
    branches: [
      { 
        city: { ar: 'الإسكندرية', en: 'Alexandria' }, 
        address: { ar: 'بوابة 27، ميناء الإسكندرية', en: 'Gate 27, Alexandria Port' },
        workingHours: { ar: 'الأحد - الخميس: 8:00 ص - 5:00 م', en: 'Sunday - Thursday: 8:00am - 5:00pm' },
        peakTimes: [4, 5, 4, 3, 2]
      }
    ],
     serviceAreas: {
      'import_clearance': {
        ar: 'تخليص واردات', en: 'Import Clearance',
        locations: ['All Egyptian Ports']
      },
      'export_services': {
        ar: 'خدمات تصدير', en: 'Export Services',
        locations: ['Documentation and Compliance']
      }
    },
    contact: { email: 'ops@gulfcustoms.com', phone: '+2035550202' },
    status: 'approved',
  },
  {
    id: 7,
    name: { ar: 'المجموعة الدولية للوجستيات', en: 'International Group Logistics' },
    description: { ar: 'وكيل شحن رائد يقدم حلولاً لوجستية عالمية شاملة، متخصص في النقل الجوي والبحري والبري.', en: 'A leading freight forwarder providing comprehensive global logistics solutions, specializing in air, sea, and land transport.' },
    category: 'freight-forwarder',
    logoShortName: 'IGL',
    logoBgColor: '#483D8B', // Dark Slate Blue
    ports: ['Alexandria', 'Port Said', 'Sokhna', 'Cairo Airport'],
    branches: [
      { 
        city: { ar: 'القاهرة', en: 'Cairo' }, 
        address: { ar: 'مصر الجديدة، القاهرة', en: 'Heliopolis, Cairo' },
        workingHours: { ar: 'الأحد - الخميس: 9:00 ص - 5:00 م', en: 'Sunday - Thursday: 9:00am - 5:00pm' },
        peakTimes: [3, 4, 5, 3, 2]
      }
    ],
     serviceAreas: {
      'air_freight': {
        ar: 'الشحن الجوي', en: 'Air Freight',
        locations: ['Global Network']
      },
      'sea_freight_global': {
        ar: 'الشحن البحري', en: 'Sea Freight',
        locations: ['All major trade lanes']
      }
    },
    contact: { email: 'info@igl-log.com', phone: '+2021234567' },
    status: 'approved',
  }
];

export const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
