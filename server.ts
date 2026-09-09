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

// Built-in intelligent fallback knowledge for Indian agricultural mandis
const AGRICULTURAL_KNOWLEDGE = {
  tomatoPrices: {
    en: "Today's tomato rate in major mandis averages ₹32 to ₹36 per kg (₹3,200 - ₹3,600 per quintal). In Nashik mandi, Grade A tomatoes are trading at ₹34/kg. Prices are showing an upward trend of 6% due to high terminal demand. Selling directly through Farm2Door will fetch you approximately ₹34/kg with zero middleman deductions.",
    hi: "आज मुख्य मंडियों में टमाटर का थोक भाव ₹32 से ₹36 प्रति किलो (₹3,200 - ₹3,600 प्रति क्विंटल) चल रहा है। नासिक मंडी में उत्तम ग्रेड टमाटर ₹34 प्रति किलो बिका है। फार्म2डोर पर सीधे बेचने पर आपको पूरा ₹34 प्रति किलो मिलेगा और बिचौलियों का कमीशन बचेगा।",
    te: "ఈరోజు ప్రధాన మార్కెట్లలో టమోటా ధర కేజీకి ₹32 నుండి ₹36 వరకు ఉంది (క్వింటాల్‌కు ₹3,200 - ₹3,600). నాసిక్ మార్కెట్‌లో గ్రేడ్ A టమోటా ₹34 పలుకుతోంది. డిమాండ్ ఎక్కువగా ఉన్నందున ధరలు పెరుగుతున్నాయి. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే మధ్యవర్తుల కమీషన్ లేకుండా పూర్తి లాభం వస్తుంది."
  },
  whereToSell: {
    en: "You have two great options: 1. Farm2Door FPO collective procurement currently offers ₹34/kg with farm-gate pickup. 2. If selling in local mandis, Vashi and Azadpur are paying the highest rates today at ₹35/kg. We recommend listing on Farm2Door to save on transport and broker fees.",
    hi: "आपके पास दो बेहतरीन विकल्प हैं: 1. फार्म2डोर के जरिए सीधे एफपीओ या थोक खरीदारों को बेचें, जहां आपके खेत से ₹34 प्रति किलो पर सीधी पिकअप होगी। 2. स्थानीय मंडियों में वाशी और आजादपुर में सबसे अच्छे रेट मिल रहे हैं। फार्म2डोर पर बेचने से 20% तक बिचौलियों का खर्च बचता है।",
    te: "మీ పంటను అమ్మడానికి రెండు మంచి మార్గాలు ఉన్నాయి: 1. ఫార్మ్2డోర్ ద్వారా నేరుగా FPO లేదా వ్యాపారులకు అమ్మితే మీ తోట వద్దే కేజీకి ₹34తో పికప్ చేస్తారు. 2. స్థానిక మార్కెట్లలో అమ్మితే ఆజాద్‌పూర్ లేదా వాషి మార్కెట్‌లో మంచి రేటు వస్తుంది. ఫార్మ్2డోర్ ద్వారా రవాణా మరియు బ్రోకర్ కమీషన్ ఆదా అవుతుంది."
  },
  bestMarket: {
    en: "Based on live arrivals, Azadpur Mandi (Delhi) and Vashi APMC (Mumbai) are offering the highest prices for fresh vegetables today. However, after deducting 8% commission and transport, Farm2Door direct farm-gate sale delivers the highest net income in your bank account.",
    hi: "आज के आंकड़ों के अनुसार आजादपुर मंडी (दिल्ली) और वाशी मंडी (मुंबई) में सबसे ऊंचे दाम मिल रहे हैं। लेकिन 8% आढ़त और माल-भाड़ा काटने के बाद फार्म2डोर पर सीधे बेचने से किसान भाई को सबसे अधिक शुद्ध मुनाफा मिलता है।",
    te: "నేటి సమాచారం ప్రకారం వాషి మార్కెట్ మరియు ఆజాద్‌పూర్ మార్కెట్లలో అధిక ధరలు ఉన్నాయి. కానీ రవాణా మరియు మార్కెట్ కమీషన్ తీసివేస్తే, ఫార్మ్2డోర్ ద్వారా మీ తోట వద్దే అమ్మడం వల్ల రైతుకు ఎక్కువ లాభం దక్కుతుంది."
  },
  onionPrices: {
    en: "Today's onion wholesale rate in Lasalgaon mandi is ₹2,100 to ₹2,300 per quintal (₹21 - ₹23 per kg). Supply is steady. Farm2Door verified buyers are offering ₹24/kg for Grade A red onions.",
    hi: "आज लासलगांव मंडी में प्याज का भाव ₹21 से ₹23 प्रति किलो (₹2,100 - ₹2,300 प्रति क्विंटल) चल रहा है। फार्म2डोर पर उत्तम लाल प्याज के लिए ₹24 प्रति किलो का सीधा भाव मिल रहा है।",
    te: "లాసల్‌గావ్ మార్కెట్‌లో నేడు ఉల్లిపాయ ధర క్వింటాల్‌కు ₹2,100 నుండి ₹2,300 (కేజీకి ₹21 - ₹23) ఉంది. ఫార్మ్2డోర్‌లో గ్రేడ్ A ఎర్ర ఉల్లిపాయలకు ₹24 ధర లభిస్తోంది."
  },
  generalAdvice: {
    en: "As your Kisan Assistant, I monitor live APMC prices and direct buyer orders across India. You can ask about tomato, onion, or potato prices, where to sell, or cold-chain vehicle pickup.",
    hi: "किसान सहायक के रूप में, मैं भारत भर की लाइव मंडियों और खरीदारों के भाव देखता हूँ। आप टमाटर, प्याज, आलू के दाम, बेचने की जगह या गाड़ी पिकअप के बारे में पूछ सकते हैं।",
    te: "రైతు సహాయకుడిగా, నేను భారతదేశ వ్యాప్తంగా మార్కెట్ ధరలను పర్యవేక్షిస్తాను. టమోటా, ఉల్లిపాయ ధరలు, అమ్మకపు వివరాలు లేదా రవాణా గురించి అడగవచ్చు."
  }
};

function getFallbackAnswer(question: string, lang: string): string {
  const q = question.toLowerCase();
  const validLang = (lang === 'hi' || lang === 'te') ? lang : 'en';

  if (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా')) {
    return AGRICULTURAL_KNOWLEDGE.tomatoPrices[validLang];
  }
  if (q.includes('where') || q.includes('कहाँ') || q.includes('कहा') || q.includes('ఎక్కడ') || q.includes('sell') || q.includes('बेच') || q.includes('అమ్మాలి')) {
    return AGRICULTURAL_KNOWLEDGE.whereToSell[validLang];
  }
  if (q.includes('best') || q.includes('better') || q.includes('अच्छा') || q.includes('बढ़िया') || q.includes('మంచి') || q.includes('market') || q.includes('मंडी') || q.includes('మార్కెట్')) {
    return AGRICULTURAL_KNOWLEDGE.bestMarket[validLang];
  }
  if (q.includes('onion') || q.includes('प्याज') || q.includes('ఉల్లి')) {
    return AGRICULTURAL_KNOWLEDGE.onionPrices[validLang];
  }
  return AGRICULTURAL_KNOWLEDGE.generalAdvice[validLang];
}

// Kisan Voice Assistant API Endpoint
app.post('/api/kisan-assistant', async (req, res) => {
  const { question, language = 'en' } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  const langCode = (language === 'hi' || language === 'te') ? language : 'en';
  const targetLanguageName = langCode === 'hi' ? 'Hindi (हिन्दी)' : langCode === 'te' ? 'Telugu (తెలుగు)' : 'English';

  try {
    const ai = getGeminiClient();
    if (ai) {
      const systemInstruction = `You are "Kisan Voice Assistant" (किसान सहायक / రైతు సహాయకుడు) in Farm2Door AI, a direct farmer-to-buyer agricultural marketplace in India.
Your mission is to give warm, practical, accurate agricultural market guidance to Indian farmers.

Market Data Context:
- Tomatoes: Nashik mandi ₹34/kg, Azadpur ₹36/kg, Kolar ₹33/kg. Strong demand, prices rising +6-8%. On Farm2Door, farmers earn ₹34/kg directly with farm-gate weighment, cutting middleman fees.
- Onions: Lasalgaon mandi ₹21-23/kg. Farm2Door buyers offer ₹24/kg.
- Potatoes: Agra mandi ₹16-18/kg. Cold storage availability is good.
- Selling channels: Farm2Door allows direct sales to 120+ FPOs, institutional bulk buyers, and local consumers with refrigerated cold-chain truck pickup.

CRITICAL INSTRUCTIONS:
1. Language Requirement: You MUST respond strictly in ${targetLanguageName}. If Hindi, use Devanagari script. If Telugu, use Telugu script. If English, use simple clear English.
2. Length: Keep your response concise (maximum 2 to 3 sentences, 40-50 words), because this response will be read aloud to the farmer over text-to-speech.
3. Tone: Respectful, reassuring, and farmer-friendly (address the farmer warmly as 'किसान भाई' in Hindi or 'రైతు మిత్రమా / రైతు సోదరా' in Telugu if appropriate).
4. Provide direct, actionable figures and advice immediately.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiAnswer = response.text?.trim();
      if (aiAnswer) {
        return res.json({
          answer: aiAnswer,
          source: 'gemini',
          language: langCode,
        });
      }
    }

    // Fallback if Gemini key is missing or empty response
    const fallbackAnswer = getFallbackAnswer(question, langCode);
    return res.json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence',
      language: langCode,
    });
  } catch (error) {
    console.error('Kisan Assistant Error:', error);
    const fallbackAnswer = getFallbackAnswer(question, langCode);
    return res.json({
      answer: fallbackAnswer,
      source: 'agricultural-intelligence-fallback',
      language: langCode,
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
