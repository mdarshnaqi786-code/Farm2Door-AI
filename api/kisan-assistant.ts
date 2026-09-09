import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

/**
 * Farm2Door Kisan Voice Assistant API Route (Vercel Serverless Function).
 * In production deployments on Vercel, requests to /api/kisan-assistant are routed
 * directly to this serverless function instead of an Express server.
 */

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Built-in intelligent fallback knowledge for Indian agricultural mandis (AP Mandi Reference Dataset & Farm2Door Data)
const AGRICULTURAL_KNOWLEDGE = {
  tomatoPrices: {
    en: "According to Andhra Pradesh APMC mandi records, the modal reference price for Tomato is ₹34.0 per kg (₹3,400 per quintal), with Bowenpally and Kurnool mandis quoting the highest rates. On Farm2Door, farmers sell directly with zero middleman deductions.",
    hi: "आंध्र प्रदेश मंडी आंकड़ों के अनुसार आज टमाटर का मॉडल संदर्भ भाव ₹34.0 प्रति किलो (₹3,400 प्रति क्विंटल) है। बोवेनपल्ली और कुरनूल मंडियों में सबसे अच्छे संदर्भ भाव दर्ज हैं। फार्म2डोर पर सीधे बेचने से बिचौलियों का कमीशन बचता है।",
    te: "ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం టమోటా యొక్క మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34.0 (క్వింటాల్‌కు ₹3,400) గా ఉంది. బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో మంచి ధరలు నమోదయ్యాయి. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే దళారుల కమీషన్ లేకుండా పూర్తి లాభం లభిస్తుంది."
  },
  sellingPriceTomatoes: {
    en: "On Farm2Door, the listed selling price for fresh tomatoes is ₹34.0 per kg, with ₹27.0 per kg going directly into the farmer's bank account with zero broker deductions.",
    hi: "फार्म2डोर पर ताजे टमाटर का किसान बिक्री मूल्य ₹34.0 प्रति किलो है, जिसमें से ₹27.0 प्रति किलो बिना किसी बिचौलिये के सीधे किसान के बैंक खाते में आता है।",
    te: "ఫార్మ్2డోర్‌లో తాజా టమోటా రైతు అమ్మకపు ధర కేజీకి ₹34.0 గా ఉంది, ఇందులో దళారుల కోత లేకుండా ₹27.0 నేరుగా రైతు బ్యాంక్ ఖాతాకు చేరుతుంది."
  },
  whereToBuyTomatoes: {
    en: "You can purchase fresh tomatoes on Farm2Door Marketplace directly from Ramesh Patil (Sahyadri Kisan Producer Co.) at ₹34 per kg with verified farm-gate freshness.",
    hi: "आप फार्म2डोर मार्केटप्लेस पर रमेश पाटिल (सह्याद्री किसान प्रोड्यूसर कंपनी) से सीधे ₹34 प्रति किलो पर खेत से ताजे तोड़े गए टमाटर खरीद सकते हैं।",
    te: "మీరు ఫార్మ్2డోర్ మార్కెట్‌ప్లేస్‌లో రమేష్ పాటిల్ (సహ్యాద్రి కిసాన్ ప్రొడ్యూసర్ కో) నుండి కేజీకి ₹34 చొప్పున తోట వద్ద తాజా టమాటాలను నేరుగా కొనవచ్చు."
  },
  pendingOrders: {
    en: "In your Farm2Door orders, you have active orders including Order #F2D-8820 for 250 kg Tomato (Ready for Delivery) and Bulk Sourcing Request BLK-701 for 25 quintals (Pending confirmation).",
    hi: "आपके फार्म2डोर खाते में सक्रिय ऑर्डर हैं: ऑर्डर #F2D-8820 (250 किलो टमाटर, डिलीवरी के लिए तैयार) और थोक अनुरोध BLK-701 (25 क्विंटल टमाटर, पुष्टि लंबित)।",
    te: "మీ ఫార్మ్2డోర్ ఖాతాలో యాక్టివ్ ఆర్డర్లు ఉన్నాయి: ఆర్డర్ #F2D-8820 (250 కేజీల టమోటా, డెలివరీకి సిద్ధం) మరియు బల్క్ రిక్వెస్ట్ BLK-701 (25 క్వింటాళ్లు, పెండింగ్)."
  },
  pendingDeliveries: {
    en: "In Farm2Door Smart Logistics, route DR-AP-01 has 2 pending farm-gate dispatches from Gollapudi Agri Yard Hub to Mangalagiri Town and Guntur City Centre.",
    hi: "फार्म2डोर स्मार्ट लॉजिस्टिक्स में रूट DR-AP-01 पर 2 डिलीवरी लंबित हैं: गोलापुडी एग्री यार्ड हब से मंगलागिरी टाउन और गुंटूर सिटी सेंटर के लिए।",
    te: "ఫార్మ్2డోర్ స్మార్ట్ లాజిస్టిక్స్‌లో రూట్ DR-AP-01 పై గొల్లపూడి అగ్రి యార్డ్ హబ్ నుండి మంగళగిరి మరియు గుంటూరు నగరాలకు 2 డెలివరీలు పెండింగ్‌లో ఉన్నాయి."
  },
  whereToSell: {
    en: "You have two verified options: 1. Farm2Door collective procurement offers ₹34/kg with farm-gate pickup and 0% commission. 2. In local mandis, Bowenpally and Kurnool record highest rates at ₹34-35/kg.",
    hi: "आपके पास दो बेहतरीन विकल्प हैं: 1. फार्म2डोर पर सीधे बेचें जहाँ खेत से सीधी पिकअप और 0% कमीशन मिलेगा। 2. स्थानीय मंडियों में बोवेनपल्ली और कुरनूल में सबसे अच्छे संदर्भ रेट ₹34-35 प्रति किलो मिल रहे हैं।",
    te: "మీ పంటను అమ్మడానికి రెండు మంచి మార్గాలు ఉన్నాయి: 1. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్ముకుంటే తోట వద్దే కేజీకి ₹34తో పికప్ మరియు సున్నా కమీషన్. 2. స్థానిక మార్కెట్లలో బోవెన్‌పల్లి లేదా కర్నూలు మార్కెట్‌లో ₹34-35 రేటు వస్తుంది."
  },
  bestMarket: {
    en: "Based on Andhra Pradesh mandi records, Bowenpally Market and Kurnool recorded the highest modal reference prices for fresh tomatoes at ₹34-35 per kg.",
    hi: "आंध्र प्रदेश मंडी रिकॉर्ड के अनुसार बोवेनपल्ली (हैदराबाद) और कुरनूल में टमाटर का सबसे ऊंचा मॉडल संदर्भ भाव ₹34-35 प्रति किलो दर्ज किया गया है।",
    te: "ఆంధ్రప్రదేశ్ రికార్డుల ప్రకారం బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో టమోటాకు అత్యధిక మోడల్ రిఫరెన్స్ ధరలు (కేజీకి ₹34-35) నమోదయ్యాయి."
  },
  onionPrices: {
    en: "Today's onion modal reference rate across Andhra Pradesh APMC mandis is ₹28.0 per kg (₹2,800 per quintal). Supply is steady across Kurnool and Nizamabad mandis.",
    hi: "आंध्र प्रदेश की मंडियों में आज प्याज का मॉडल संदर्भ भाव ₹28.0 प्रति किलो (₹2,800 प्रति क्विंटल) है। कुरनूल और निजामाबाद मंडियों में आवक स्थिर बनी हुई है।",
    te: "ఆంధ్రప్రదేశ్ APMC మార్కెట్లలో ఉల్లిపాయ మోడల్ రిఫరెన్స్ ధర కేజీకి ₹28.0 (క్వింటాల్‌కు ₹2,800) గా ఉంది. కర్నూలు మరియు నిజామాబాద్ మార్కెట్లలో సరఫరా స్థిరంగా ఉంది."
  },
  potatoPrices: {
    en: "According to Andhra Pradesh APMC records, the potato modal reference price is ₹22.0 per kg (₹2,200 per quintal) with steady market stability across cold storage hubs.",
    hi: "आंध्र प्रदेश मंडी रिकॉर्ड के अनुसार आज आलू का मॉडल संदर्भ भाव ₹22.0 प्रति किलो (₹2,200 प्रति क्विंटल) है और कोल्ड स्टोरेज केंद्रों में भाव स्थिर बना हुआ है।",
    te: "ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం బంగాళాదుంప మోడల్ రిఫరెన్స్ ధర కేజీకి ₹22.0 (క్వింటాల్‌కు ₹2,200) గా స్థిరంగా కొనసాగుతోంది."
  },
  generalMarketSummary: {
    en: "Available APMC mandi reference rates on Farm2Door: Tomato ₹34.0/kg (Bowenpally, Kurnool), Onion ₹28.0/kg, and Potato ₹22.0/kg. You can ask for rates of any specific crop.",
    hi: "फार्म2डोर पर उपलब्ध आज के मुख्य मंडी संदर्भ भाव: टमाटर ₹34.0/किग्रा, प्याज ₹28.0/किग्रा और आलू ₹22.0/किग्रा। आप किसी भी विशिष्ट फसल का भाव पूछ सकते हैं।",
    te: "ఫార్మ్2డోర్ రికార్డులలో అందుబాటులో ఉన్న ముఖ్య పంటల ధరలు: టమోటా కేజీకి ₹34.0, ఉల్లిపాయ కేజీకి ₹28.0 మరియు బంగాళాదుంప కేజీకి ₹22.0. మీరు నిర్దిష్ట పంట ధరను అడగవచ్చు."
  },
  unavailableCrop: {
    en: "Verified price records for this specific crop are currently not available in Farm2Door data. Available crops with verified rates include Tomato (₹34/kg), Onion (₹28/kg), and Potato (₹22/kg).",
    hi: "इस फसल की कीमत वर्तमान में फार्म2डोर सत्यापित रिकॉर्ड में उपलब्ध नहीं है। उपलब्ध सत्यापित फसलों में टमाटर (₹34/किग्रा), प्याज (₹28/किग्रा) और आलू (₹22/किग्रा) शामिल हैं।",
    te: "ఈ పంట యొక్క ప్రస్తుత ధర వివరాలు ఫార్మ్2డోర్ రికార్డులలో అందుబాటులో లేవు. అందుబాటులో ఉన్న ధరలు: టమోటా (కేజీకి ₹34), ఉల్లిపాయ (కేజీకి ₹28), బంగాళాదుంప (కేజీకి ₹22)."
  },
  generalAdvice: {
    en: "Hello! I am your Farm2Door Kisan Assistant. You can ask me about tomato, onion, or potato market rates, check your pending orders, or track logistics dispatches.",
    hi: "नमस्ते किसान भाई! मैं आपका फार्म2डोर किसान सहायक हूँ। आप मुझसे टमाटर, प्याज या आलू के मंडी भाव, अपने लंबित ऑर्डर या लॉजिस्टिक्स डिलीवरी के बारे में पूछ सकते हैं।",
    te: "నమస్కారం రైతు మిత్రమా! నేను మీ ఫార్మ్2డోర్ కిసాన్ సహాయకుడిని. మీరు నన్ను టమోటా, ఉల్లిపాయ లేదా బంగాళాదుంప మార్కెట్ ధరలు, మీ పెండింగ్ ఆర్డర్లు లేదా డెలివరీ సమాచారం గురించి అడగవచ్చు."
  }
};

// Server-side robust language detection for farmer voice questions
function detectLanguageServer(text: string, requestedLang?: string, fallbackLang: string = 'en'): 'te' | 'hi' | 'en' {
  const trimmed = (text || '').trim();
  const teluguCount = (trimmed.match(/[\u0C00-\u0C7F]/g) || []).length;
  const devanagariCount = (trimmed.match(/[\u0900-\u097F]/g) || []).length;

  // 1. Script-level detection: ANY Telugu script strictly indicates Telugu
  if (teluguCount > 0 && teluguCount >= devanagariCount) return 'te';
  if (devanagariCount > 0) return 'hi';

  // 2. If client or requested language explicitly passed 'te' or 'hi'
  if (requestedLang === 'te' && devanagariCount === 0) return 'te';
  if (requestedLang === 'hi' && teluguCount === 0) return 'hi';
  if (requestedLang === 'en' && teluguCount === 0 && devanagariCount === 0) return 'en';

  // 3. Transliterated keyword detection
  const lower = trimmed.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/);

  const teluguWords = [
    'eeroju', 'eroju', 'tamata', 'tamato', 'thota', 'dhara', 'dharalu', 'enta', 'enti', 'entha',
    'ekkada', 'ammali', 'ammukovali', 'panta', 'raithu', 'rythu', 'bhavamu', 'bhavam',
    'undhi', 'unnadi', 'unnayi', 'marketlo', 'mandilo', 'namaskaram', 'telugu',
    'ullipaya', 'bangaladumpa', 'aloogadda', 'mirchi', 'manchi', 'kavali', 'chupinchu', 'orders'
  ];
  if (teluguWords.some(w => words.includes(w))) return 'te';

  const hindiWords = [
    'aaj', 'tamatar', 'bhav', 'daam', 'kaha', 'kahan', 'kahaa', 'kya', 'hai', 'hain',
    'bechna', 'beche', 'kitna', 'kitne', 'kripya', 'namaste', 'bataiye',
    'pyaj', 'pyaaz', 'aloo', 'dikhao', 'lambit'
  ];
  if (hindiWords.some(w => words.includes(w))) return 'hi';

  if (fallbackLang === 'te' || fallbackLang === 'hi') return fallbackLang;
  return 'en';
}

function getFallbackAnswer(question: string, lang: string): string {
  const q = (question || '').toLowerCase().trim();
  const validLang: 'te' | 'hi' | 'en' = (lang === 'hi' || lang === 'te') ? lang : 'en';

  // 1. Potato price queries (checked FIRST before tomato)
  if (
    q.includes('potato') || q.includes('potatoes') ||
    q.includes('आलू') ||
    q.includes('బంగాళాదుంప') || q.includes('బంగాళదుంప') || q.includes('ఆలూ') ||
    q.includes('aloogadda') || q.includes('alu')
  ) {
    return AGRICULTURAL_KNOWLEDGE.potatoPrices[validLang];
  }

  // 2. Onion price queries
  if (
    q.includes('onion') || q.includes('onions') ||
    q.includes('प्याज') || q.includes('प्याज़') ||
    q.includes('ఉల్లి') || q.includes('ఉల్లిపాయ') ||
    q.includes('ullipaya') || q.includes('pyaj') || q.includes('pyaaz')
  ) {
    return AGRICULTURAL_KNOWLEDGE.onionPrices[validLang];
  }

  // 3. Pending orders queries
  if (
    q.includes('pending') || q.includes('order') || q.includes('orders') ||
    q.includes('ऑर्डर') || q.includes('आर्डर') || q.includes('लंबित') ||
    q.includes('ఆర్డర్') || q.includes('ఆర్డర్లు') || q.includes('పెండింగ్')
  ) {
    return AGRICULTURAL_KNOWLEDGE.pendingOrders[validLang];
  }

  // 4. Logistics & deliveries queries
  if (
    q.includes('delivery') || q.includes('deliveries') || q.includes('dispatch') || q.includes('logistics') ||
    q.includes('डिलीवरी') || q.includes('डिलिवरी') || q.includes('लॉजिस्टिक्स') ||
    q.includes('డెలివరీ') || q.includes('రవాణా') || q.includes('లాజిస్టిక్స్')
  ) {
    return AGRICULTURAL_KNOWLEDGE.pendingDeliveries[validLang];
  }

  // 5. Selling price for tomatoes
  if (
    (q.includes('selling') || q.includes('बिक्री') || q.includes('अమ్మకపు') || q.includes('అమ్మే')) &&
    (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా') || q.includes('tamatar'))
  ) {
    return AGRICULTURAL_KNOWLEDGE.sellingPriceTomatoes[validLang];
  }

  // 6. Buying tomatoes
  if (
    (q.includes('buy') || q.includes('खरीद') || q.includes('కొనవచ్చు') || q.includes('కొనుగోలు')) &&
    (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా'))
  ) {
    return AGRICULTURAL_KNOWLEDGE.whereToBuyTomatoes[validLang];
  }

  // 7. Tomato price queries specifically
  if (
    q.includes('tomato') || q.includes('tomatoes') ||
    q.includes('टमाटर') || q.includes('tamatar') ||
    q.includes('టమోటా') || q.includes('టమాటా')
  ) {
    return AGRICULTURAL_KNOWLEDGE.tomatoPrices[validLang];
  }

  // 8. Where to sell queries
  if (
    q.includes('where to sell') || q.includes('कहाँ बेच') || q.includes('कहा बेच') ||
    q.includes('ఎక్కడ అమ్మాలి') || q.includes('ఎక్కడ అమ్ముకోవాలి')
  ) {
    return AGRICULTURAL_KNOWLEDGE.whereToSell[validLang];
  }

  // 9. Best market queries
  if (
    q.includes('best market') || q.includes('highest price') ||
    q.includes('सबसे अच्छा') || q.includes('सबसे ऊँचा') || q.includes('सबसे ऊंचा') ||
    q.includes('మంచి మార్కెట్') || q.includes('అధిక ధర')
  ) {
    return AGRICULTURAL_KNOWLEDGE.bestMarket[validLang];
  }

  // 10. General price queries without crop
  if (
    q.includes('price') || q.includes('rate') || q.includes('bhav') ||
    q.includes('भाव') || q.includes('कीमत') || q.includes('रेट') || q.includes('दाम') ||
    q.includes('ధర') || q.includes('ధరలు') || q.includes('రేటు')
  ) {
    return AGRICULTURAL_KNOWLEDGE.generalMarketSummary[validLang];
  }

  return AGRICULTURAL_KNOWLEDGE.generalAdvice[validLang];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { question, language, preferredLanguage, detectedLanguage, mandiDataContext } = body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Language priority:
  // 1. Explicit detectedLanguage / language requested
  // 2. Language spoken/written in current question
  // 3. Preferred language
  const targetLangParam = detectedLanguage || language || preferredLanguage;
  const fallbackLang = preferredLanguage || language || 'en';
  const detectedLang: 'te' | 'hi' | 'en' = detectLanguageServer(question, targetLangParam, fallbackLang);

  try {
    const ai = getGeminiClient();
    if (ai) {
      let languageInstructions = '';
      if (detectedLang === 'te') {
        languageInstructions = `CRITICAL LANGUAGE REQUIREMENT FOR TELUGU:
The user is asking in Telugu (తెలుగు).
You MUST generate the explanation completely in Telugu using Telugu script (తెలుగు లిపి).
DO NOT mix English sentences into the answer. Do not say "Tomato price is".
Instead, write: "ఈరోజు టమాటా యొక్క మార్కెట్ రిఫరెన్స్ ధర కిలోకు ₹34.0 గా ఉంది."
Keep product names, market names (Bowenpally, Kurnool), and numbers in natural script/notation, but the entire explanation must be in Telugu.`;
      } else if (detectedLang === 'hi') {
        languageInstructions = `CRITICAL LANGUAGE REQUIREMENT FOR HINDI:
The user is asking in Hindi (हिन्दी).
You MUST generate the explanation completely in Hindi using Devanagari script (देवनागरी).
Do not output English words. Answer specifically for the user's actual question.`;
      } else {
        languageInstructions = `CRITICAL LANGUAGE REQUIREMENT FOR ENGLISH:
The user is asking in English.
Respond in clear, concise, farmer-friendly English.`;
      }

      const systemInstruction = `You are Farm2Door AI Kisan Assistant.

Answer the user's CURRENT question based on its actual meaning.

Never return the same answer merely because two questions are in the same language.

Always understand the current question before answering.

If the user asks about market prices, use available Farm2Door market data:
- Tomato modal reference rate: ₹34.0 per kg (₹3,400 per quintal), recorded in Andhra Pradesh APMC mandis (Bowenpally, Kurnool).
- Onion modal reference rate: ₹28.0 per kg (₹2,800 per quintal), recorded in Andhra Pradesh APMC mandis (Kurnool, Nizamabad).
- Potato modal reference rate: ₹22.0 per kg (₹2,200 per quintal), recorded in Andhra Pradesh APMC mandis.
- Rice modal rate: ₹42.0 per kg.
- Wheat modal rate: ₹31.0 per kg.

If the user asks about products, orders, logistics, or marketplace information, use the application's available data:
- Farmer tomato selling price listed on Farm2Door: ₹34.0 per kg (with ₹27.0/kg direct payout to farmer bank account, 0% middleman deduction).
- Buying fresh tomatoes on Farm2Door: Direct from Ramesh Patil (Sahyadri Kisan Producer Co.) at ₹34/kg with farm-gate verified quality.
- Pending orders on Farm2Door: Order #F2D-8820 for 250 kg Tomato (Ready for Delivery), and Bulk Sourcing Request BLK-701 for 25 quintals Tomato (Pending confirmation).
- Logistics dispatches: Route DR-AP-01 with 2 pending dispatches from Gollapudi Agri Yard Hub to Mangalagiri Town and Guntur City Centre.
- Best markets to sell: Farm2Door for direct farm-gate collection with 0% broker commission, or Bowenpally and Kurnool mandis for local markets.
${mandiDataContext ? `Application Data Context: "${mandiDataContext}"` : ''}

Never invent unavailable information. If the requested price exists in Farm2Door data, use it. If it does not exist (such as an unknown crop), clearly say that the requested information is not available in Farm2Door records. Do not claim that a price is "today's live price" unless the application actually has live data.

Answer in the SAME LANGUAGE as the user's question:
- Hindi question → complete answer in Hindi using Devanagari script.
- Telugu question → complete answer in Telugu using Telugu script. The explanation must be in Telugu.
- English question → complete answer in English.

${languageInstructions}

Keep product names, market names, customer names, and unavoidable technical terms unchanged when necessary, but explain the surrounding information in the user's language.
Keep the answer concise (2 to 3 sentences, 35-50 words) so it is natural and clear for speech synthesis.`;

      let response: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: question,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          });
          if (response?.text) break;
        } catch (err: any) {
          console.warn(`Gemini attempt ${attempt + 1} failed:`, err?.message || err);
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }

      const aiAnswer = response?.text?.trim();

      // Guard against LLM accidentally defaulting to English for Telugu/Hindi
      let isValidLanguageResponse = true;
      if (detectedLang === 'te' && (!aiAnswer || !/[\u0C00-\u0C7F]/.test(aiAnswer))) {
        console.warn('Gemini did not return Telugu script for Telugu inquiry, using verified question-aware Telugu fallback');
        isValidLanguageResponse = false;
      } else if (detectedLang === 'hi' && (!aiAnswer || !/[\u0900-\u097F]/.test(aiAnswer))) {
        console.warn('Gemini did not return Devanagari script for Hindi inquiry, using verified question-aware Hindi fallback');
        isValidLanguageResponse = false;
      }

      if (aiAnswer && isValidLanguageResponse) {
        return res.status(200).json({
          answer: aiAnswer,
          source: 'gemini',
          language: detectedLang,
          detectedLanguage: detectedLang,
        });
      }
    }

    // Fallback if Gemini key is missing, empty response, or wrong language script returned
    const fallbackAnswer = getFallbackAnswer(question, detectedLang);
    return res.status(200).json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence',
      language: detectedLang,
      detectedLanguage: detectedLang,
    });
  } catch (error) {
    console.error('Kisan Assistant Error:', error);
    const fallbackAnswer = getFallbackAnswer(question, detectedLang);
    return res.status(200).json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence-fallback',
      language: detectedLang,
      detectedLanguage: detectedLang,
    });
  }
}
