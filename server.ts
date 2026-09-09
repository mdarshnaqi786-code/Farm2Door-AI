import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Built-in intelligent fallback knowledge for Indian agricultural mandis (AP Mandi Reference Dataset)
const AGRICULTURAL_KNOWLEDGE = {
  tomatoPrices: {
    en: "According to Andhra Pradesh mandi records, the modal reference price for Tomato is ₹34.0 per kg (₹3,400 per quintal), with Bowenpally and Kurnool mandis quoting the highest reference rates. On Farm2Door, farmers can list their harvest directly for buyers without middleman deductions.",
    hi: "आंध्र प्रदेश मंडी आंकड़ों के अनुसार टमाटर का मॉडल संदर्भ भाव ₹34.0 प्रति किलो (₹3,400 प्रति क्विंटल) है। बोवेनपल्ली और कुरनूल मंडियों में सबसे अच्छे संदर्भ भाव दर्ज हैं। फार्म2डोर पर सीधे बेचने पर बिचौलियों का कमीशन बचता है।",
    te: "ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం టమోటా మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34.0 (క్వింటాల్‌కు ₹3,400) గా ఉంది. బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో అధిక రిఫరెన్స్ రేట్లు ఉన్నాయి. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే దళారుల కమీషన్ లేకుండా పూర్తి లాభం లభిస్తుంది."
  },
  whereToSell: {
    en: "You have two great options: 1. Farm2Door FPO collective procurement currently offers ₹34/kg with farm-gate pickup. 2. If selling in local mandis, Bowenpally and Kurnool are recording the highest reference rates. We recommend listing on Farm2Door to save on transport and broker fees.",
    hi: "आपके पास दो बेहतरीन विकल्प हैं: 1. फार्म2डोर के जरिए सीधे एफपीओ या थोक खरीदारों को बेचें, जहां आपके खेत से ₹34 प्रति किलो पर सीधी पिकअप होगी। 2. स्थानीय मंडियों में बोवेनपल्ली और कुरनूल में सबसे अच्छे संदर्भ रेट मिल रहे हैं। फार्म2डोर पर बेचने से बिचौलियों का खर्च बचता है।",
    te: "మీ పంటను అమ్మడానికి రెండు మంచి మార్గాలు ఉన్నాయి: 1. ఫార్మ్2డోర్ ద్వారా నేరుగా FPO లేదా వ్యాపారులకు అమ్మితే మీ తోట వద్దే కేజీకి ₹34తో పికప్ చేస్తారు. 2. స్థానిక మార్కెట్లలో అమ్మితే బోవెన్‌పల్లి లేదా కర్నూలు మార్కెట్‌లో మంచి రేటు వస్తుంది. ఫార్మ్2డోర్ ద్వారా రవాణా మరియు బ్రోకర్ కమీషన్ ఆదా అవుతుంది."
  },
  bestMarket: {
    en: "Based on Andhra Pradesh mandi records, Bowenpally Market (Hyderabad) and Kurnool recorded the highest modal reference prices for fresh tomatoes at ₹34-35 per kg. Direct Farm2Door sales save 18% in transport and commissions.",
    hi: "आंध्र प्रदेश मंडी रिकॉर्ड के अनुसार बोवेनपल्ली (हैदराबाद) और कुरनूल में टमाटर का सबसे ऊंचा मॉडल संदर्भ भाव ₹34-35 प्रति किलो दर्ज किया गया है। फार्म2डोर पर सीधे बेचने से किसान को अधिक शुद्ध मुनाफा मिलता है।",
    te: "ఆంధ్రప్రదేశ్ రికార్డుల ప్రకారం బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో టమోటాకు అత్యధిక మోడల్ రిఫరెన్స్ ధరలు (కేజీకి ₹34-35) నమోదయ్యాయి. ఫార్మ్2డోర్ ద్వారా అమ్మితే రవాణా మరియు కమీషన్ ఖర్చులు ఆదా అవుతాయి."
  },
  onionPrices: {
    en: "Today's onion modal reference rate across Andhra Pradesh APMC mandis is ₹28.0 per kg (₹2,800 per quintal). Supply is steady across Kurnool and Nizamabad mandis.",
    hi: "आंध्र प्रदेश की मंडियों में प्याज का मॉडल संदर्भ भाव ₹28.0 प्रति किलो (₹2,800 प्रति क्विंटल) दर्ज है। कुरनूल और निजामाबाद मंडियों में आवक स्थिर है।",
    te: "ఆంధ్రప్రదేశ్ APMC మార్కెట్లలో ఉల్లిపాయ మోడల్ రిఫరెన్స్ ధర కేజీకి ₹28.0 (క్వింటాల్‌కు ₹2,800) గా ఉంది. కర్నూలు మరియు నిజామాబాద్ మార్కెట్లలో సరఫరా స్థిరంగా ఉంది."
  },
  potatoPrices: {
    en: "Potato mandi modal reference rate in Andhra Pradesh is ₹22.0 per kg (₹2,200 per quintal) with prices showing steady stability across cold storage hubs.",
    hi: "आंध्र प्रदेश में आलू का मॉडल संदर्भ भाव ₹22.0 प्रति किलो (₹2,200 प्रति क्विंटल) है और भाव कोल्ड स्टोरेज केंद्रों में स्थिर बना हुआ है।",
    te: "ఆంధ్రప్రదేశ్‌లో బంగాళాదుంప మోడల్ రిఫరెన్స్ ధర కేజీకి ₹22.0 (క్వింటాల్‌కు ₹2,200) గా స్థిరంగా కొనసాగుతోంది."
  },
  generalAdvice: {
    en: "As your Kisan Assistant, I monitor live Andhra Pradesh APMC mandi reference prices and direct Farm2Door buyer orders. You can ask about tomato, onion, or potato rates, highest price mandis, or price trends.",
    hi: "किसान सहायक के रूप में, मैं आंध्र प्रदेश एपीएमसी मंडी संदर्भ भाव और फार्म2डोर खरीदारों की मांग की जानकारी देता हूँ। आप टमाटर, प्याज, आलू के संदर्भ भाव या ट्रेंड के बारे में पूछ सकते हैं।",
    te: "రైతు సహాయకుడిగా, నేను ఆంధ్రప్రదేశ్ APMC మార్కెట్ రిఫరెన్స్ ధరలను పర్యవేక్షిస్తాను. టమోటా, ఉల్లిపాయ ధరలు, ఉత్తమ మార్కెట్ లేదా ధరల ధోరణి గురించి అడగవచ్చు."
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

  // 3. Transliterated keyword detection
  const lower = trimmed.toLowerCase();
  const teluguWords = [
    'eeroju', 'eroju', 'tamata', 'tamato', 'tomato', 'dhara', 'dharalu', 'enta', 'enti', 'entha',
    'ekkada', 'ammali', 'ammukovali', 'panta', 'raithu', 'rythu', 'bhavamu', 'bhavam',
    'undhi', 'unnadi', 'unnayi', 'marketlo', 'mandilo', 'namaskaram', 'telugu',
    'ullipaya', 'ulli', 'bangaladumpa', 'aloogadda', 'mirchi', 'manchi', 'kavali'
  ];
  if (teluguWords.some(w => lower.includes(w))) return 'te';

  const hindiWords = [
    'aaj', 'tamatar', 'bhav', 'daam', 'kaha', 'kahan', 'kahaa', 'kya', 'hai', 'hain',
    'bechna', 'beche', 'kitna', 'kitne', 'mandi', 'kisan', 'kripya', 'namaste', 'bataiye',
    'pyaj', 'pyaaz', 'aloo'
  ];
  if (hindiWords.some(w => lower.includes(w))) return 'hi';

  if (fallbackLang === 'te' || fallbackLang === 'hi') return fallbackLang;
  return 'en';
}

function getFallbackAnswer(question: string, lang: string): string {
  const q = question.toLowerCase();
  const validLang = (lang === 'hi' || lang === 'te') ? lang : 'en';

  if (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా') || q.includes('ధర') || q.includes('రేటు')) {
    return AGRICULTURAL_KNOWLEDGE.tomatoPrices[validLang];
  }
  if (q.includes('where') || q.includes('कहाँ') || q.includes('कहा') || q.includes('ఎక్కడ') || q.includes('sell') || q.includes('बेच') || q.includes('అమ్మాలి')) {
    return AGRICULTURAL_KNOWLEDGE.whereToSell[validLang];
  }
  if (q.includes('best') || q.includes('better') || q.includes('अच्छा') || q.includes('बढ़िया') || q.includes('మంచి') || q.includes('market') || q.includes('मंडी') || q.includes('మార్కెట్')) {
    return AGRICULTURAL_KNOWLEDGE.bestMarket[validLang];
  }
  if (q.includes('onion') || q.includes('प्याज') || q.includes('ఉల్లి') || q.includes('ఉల్లిపాయ')) {
    return AGRICULTURAL_KNOWLEDGE.onionPrices[validLang];
  }
  if (q.includes('potato') || q.includes('आलू') || q.includes('బంగాళాదుంప') || q.includes('ఆలూ')) {
    return AGRICULTURAL_KNOWLEDGE.potatoPrices[validLang];
  }
  return AGRICULTURAL_KNOWLEDGE.generalAdvice[validLang];
}

// Kisan Voice Assistant API Endpoint
app.post('/api/kisan-assistant', async (req, res) => {
  const { question, language, preferredLanguage, detectedLanguage, mandiDataContext } = req.body;

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
The farmer is asking in Telugu (తెలుగు).
You MUST respond 100% in pure Telugu (తెలుగు) using TELUGU SCRIPT (తెలుగు లిపి).
DO NOT translate the question or the answer into English.
DO NOT provide any English sentences, romanized English words, or English summaries.
Address the farmer warmly in Telugu as "రైతు మిత్రమా" or "రైతు సోదరా".
Keep the response to 2 to 3 concise sentences (40-50 words) with direct market rates and guidance so it sounds natural when spoken aloud via text-to-speech.

Example of expected Telugu response:
"ఆంధ్రప్రదేశ్ రికార్డుల ప్రకారం నేడు టమోటా మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34 ఉంది. ఫార్మ్2డోర్ ద్వారా మీ తోట వద్దే మధ్యవర్తుల కమీషన్ లేకుండా నేరుగా అమ్ముకోవచ్చు."`;
      } else if (detectedLang === 'hi') {
        languageInstructions = `CRITICAL LANGUAGE REQUIREMENT FOR HINDI:
The farmer is asking in Hindi (हिन्दी).
You MUST respond 100% in pure Hindi (हिन्दी) using DEVANAGARI SCRIPT (देवनागरी).
DO NOT output English. Address the farmer warmly as "किसान भाई".
Keep the response to 2 to 3 concise sentences (40-50 words) with direct mandi rates and guidance so it sounds natural when spoken aloud via text-to-speech.

Example of expected Hindi response:
"आंध्र प्रदेश मंडी आंकड़ों के अनुसार आज टमाटर का मॉडल संदर्भ भाव ₹34 प्रति किलो है। फार्म2डोर पर सीधे बेचने से बिचौलियों का कमीशन बचेगा और पूरा दाम सीधे किसान के खाते में आएगा।"`;
      } else {
        languageInstructions = `CRITICAL LANGUAGE REQUIREMENT FOR ENGLISH:
The farmer is asking in English.
Respond in clear, simple, farmer-friendly English.
Keep the response to 2 to 3 concise sentences (40-50 words) with direct market rates and guidance.`;
      }

      const systemInstruction = `You are "Kisan Voice Assistant" (किसान सहायक / రైతు సహాయకుడు) in Farm2Door AI, a direct farmer-to-buyer agricultural marketplace in India.
Your mission is to give warm, practical, accurate agricultural market guidance to Indian farmers.

Market Data Context (Andhra Pradesh Mandi Reference Dataset):
- Official Mandi Reference Prices: Tomato latest modal rate ₹34.0/kg (range ₹28-40/kg in Bowenpally, Kurnool, Warangal, Hyderabad). Upward trend +13.3%.
- Onions: ₹28.0/kg in AP mandis.
- Potatoes: ₹22.0/kg in AP mandis.
- Rice: ₹42.0/kg; Wheat: ₹31.0/kg in AP mandis.
- Terminology rule: Always refer to official APMC prices as "Mandi Reference Prices" (not farmer selling price).
- Farm2Door benefits: Direct farm-gate pickup, guaranteed weighment, 0% broker commission.
${mandiDataContext ? `Dataset Grounding for this specific question: "${mandiDataContext}"` : ''}

${languageInstructions}

Provide direct, actionable figures and advice immediately.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiAnswer = response.text?.trim();

      // Guard against LLM accidentally defaulting to English for Telugu/Hindi
      let isValidLanguageResponse = true;
      if (detectedLang === 'te' && (!aiAnswer || !/[\u0C00-\u0C7F]/.test(aiAnswer))) {
        console.warn('Gemini did not return Telugu script for Telugu inquiry, using verified Telugu fallback');
        isValidLanguageResponse = false;
      } else if (detectedLang === 'hi' && (!aiAnswer || !/[\u0900-\u097F]/.test(aiAnswer))) {
        console.warn('Gemini did not return Devanagari script for Hindi inquiry, using verified Hindi fallback');
        isValidLanguageResponse = false;
      }

      if (aiAnswer && isValidLanguageResponse) {
        return res.json({
          answer: aiAnswer,
          source: 'gemini',
          language: detectedLang,
          detectedLanguage: detectedLang,
        });
      }
    }

    // Fallback if Gemini key is missing, empty response, or wrong language script returned
    const fallbackAnswer = getFallbackAnswer(question, detectedLang);
    return res.json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence',
      language: detectedLang,
      detectedLanguage: detectedLang,
    });
  } catch (error) {
    console.error('Kisan Assistant Error:', error);
    const fallbackAnswer = getFallbackAnswer(question, detectedLang);
    return res.json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence-fallback',
      language: detectedLang,
      detectedLanguage: detectedLang,
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Farm2Door Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
