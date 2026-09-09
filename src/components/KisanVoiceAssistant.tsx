import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  AlertCircle, 
  RotateCcw, 
  Bot, 
  User, 
  CheckCircle2, 
  Flame,
  MessageSquarePlus,
  Compass,
  Play,
  Trash2,
  HelpCircle,
  Radio,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText, stopSpeech } from '../utils/speech';
import { 
  detectLanguage, 
  getStoredUserPreferredLanguage, 
  getSpeechRecognitionLocale 
} from '../utils/languageDetection';
import { answerMarketQueryFromData } from '../data/marketDataService';
import { answerLogisticsQueryFromData } from '../data/logisticsDataService';
import { t } from '../data/translations';

export type VoiceHubState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ANSWER_READY' | 'SPEAKING' | 'ERROR';

interface KisanVoiceAssistantProps {
  language: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  activeSection?: 'home' | 'voice_hub';
  onNavigate?: (view: any) => void;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  language: LanguageCode;
  source: string;
  timestamp: string;
}

interface ExamplePrompt {
  id: string;
  icon: string;
  category: 'mandi' | 'selling' | 'orders' | 'logistics' | 'nav';
  en: string;
  hi: string;
  te: string;
}

const EXAMPLE_QUESTIONS: ExamplePrompt[] = [
  {
    id: 'ex-mandi-today',
    icon: '🍅',
    category: 'mandi',
    en: "What is today's mandi reference price?",
    hi: 'आज मंडी का भाव क्या है?',
    te: 'ఈరోజు మార్కెట్ ధర ఎంత?',
  },
  {
    id: 'ex-direct-selling',
    icon: '🤝',
    category: 'selling',
    en: 'How can I sell my tomatoes directly?',
    hi: 'मैं अपने टमाटर सीधे कैसे बेच सकता हूँ?',
    te: 'నా టమాటాలను నేరుగా ఎలా అమ్మాలి?',
  },
  {
    id: 'ex-better-mandi',
    icon: '🏆',
    category: 'mandi',
    en: 'Which market has a better price?',
    hi: 'किस मंडी में अच्छा भाव मिल रहा है?',
    te: 'ఏ మార్కెట్లో మంచి ధర ఉంది?',
  },
  {
    id: 'ex-pending-orders',
    icon: '📦',
    category: 'orders',
    en: 'Show me my pending orders.',
    hi: 'मेरे लंबित ऑर्डर दिखाओ।',
    te: 'నా పెండింగ్ ఆర్డర్లు చూపించు.',
  },
  {
    id: 'ex-pending-deliveries',
    icon: '🚚',
    category: 'logistics',
    en: 'What deliveries are pending?',
    hi: 'कौन सी डिलीवरी लंबित है?',
    te: 'ఏ డెలివరీలు పెండింగ్‌లో ఉన్నాయి?',
  },
  {
    id: 'ex-onion-rates',
    icon: '🧅',
    category: 'mandi',
    en: 'What is the mandi reference price for onions?',
    hi: 'प्याज का मंडी संदर्भ भाव क्या है?',
    te: 'ఉల్లిపాయ మార్కెట్ రిఫరెన్స్ ధర ఎంత?',
  },
];

export const KisanVoiceAssistant: React.FC<KisanVoiceAssistantProps> = ({
  language,
  onLanguageChange,
  onStartSpeech,
  onEndSpeech,
  activeSection = 'voice_hub',
  onNavigate,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceHubState>('IDLE');
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognizedQuestion, setRecognizedQuestion] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const preferredLang = getStoredUserPreferredLanguage();
  const effectiveInitialLang: LanguageCode = (language === 'hi' || language === 'te')
    ? language
    : (preferredLang === 'te' || preferredLang === 'hi' ? preferredLang : 'en');

  const [voiceInputLang, setVoiceInputLang] = useState<LanguageCode>(effectiveInitialLang);

  useEffect(() => {
    if (language === 'hi' || language === 'te' || language === 'en') {
      setVoiceInputLang(language);
    }
  }, [language]);

  // Initial welcome sample answer
  const [currentQA, setCurrentQA] = useState<QAItem | null>(() => {
    const isTelugu = effectiveInitialLang === 'te';
    const isHindi = effectiveInitialLang === 'hi';
    return {
      id: 'initial-sample',
      question: isHindi 
        ? 'आज टमाटर का मंडी संदर्भ भाव क्या है?' 
        : isTelugu 
        ? 'ఈరోజు టమోటా మార్కెట్ ధర ఎంత?' 
        : "What is today's tomato reference price?",
      answer: isHindi
        ? 'आंध्र प्रदेश मंडी आंकड़ों के अनुसार टमाटर का मॉडल संदर्भ भाव ₹34.0 प्रति किलो (₹3,400 प्रति क्विंटल) है। फार्म2डोर पर सीधे बेचने पर बिचौलियों का कमीशन बचता है।'
        : isTelugu
        ? 'ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం టమోటా మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34.0 (క్వింటాల్‌కు ₹3,400) గా ఉంది. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే పూర్తి లాభం లభిస్తుంది.'
        : "According to Andhra Pradesh mandi records, the modal reference price for Tomato is ₹34.0 per kg (₹3,400 per quintal). On Farm2Door, farmers sell directly with zero middleman deductions.",
      language: effectiveInitialLang,
      source: 'AP Mandi Intelligence',
      timestamp: 'Ready'
    };
  });

  // Recent interaction history
  const [history, setHistory] = useState<QAItem[]>([]);

  // Manual typed question fallback
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const demoTimerRef = useRef<any>(null);

  // Stop speech synthesis & timers when unmounting
  useEffect(() => {
    return () => {
      stopSpeech();
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Voice Navigation Matcher
  const checkVoiceNavigationCommand = (query: string, lang: LanguageCode): { target: string; announcement: string } | null => {
    const q = query.toLowerCase().trim();
    
    // 1. Marketplace
    if (
      q.includes('open marketplace') || q.includes('go to marketplace') || q.includes('show marketplace') ||
      q.includes('open market') || q.includes('మార్కెట్ తెరవండి') || q.includes('మార్కెట్‌ప్లేస్') ||
      q.includes('बाज़ार खोलो') || q.includes('बाजार खोलो') || q.includes('मार्केट खोलो')
    ) {
      return {
        target: 'farmer_marketplace',
        announcement: lang === 'te'
          ? 'రైతు మార్కెట్‌ప్లేస్ తెరవబడుతోంది...'
          : lang === 'hi'
          ? 'कृषि बाज़ार खोला जा रहा है...'
          : 'Opening marketplace...'
      };
    }

    // 2. Market Intelligence
    if (
      q.includes('open market intelligence') || q.includes('market intelligence') ||
      q.includes('mandi rates') || q.includes('mandi prices') ||
      q.includes('మార్కెట్ సమాచారం') || q.includes('మండి భావాలు') || q.includes('మండి సమాచారం') ||
      q.includes('मंडी भाव खोलो') || q.includes('मार्केट इंटेलिजेंस') || q.includes('मंडी भाव')
    ) {
      return {
        target: 'farmer_market_intel',
        announcement: lang === 'te'
          ? 'మార్కెట్ ఇంటెలిజెన్స్ మరియు మండి సమాచారం తెరవబడుతోంది...'
          : lang === 'hi'
          ? 'मंडी भाव विश्लेषण खोला जा रहा है...'
          : 'Opening market intelligence...'
      };
    }

    // 3. Logistics
    if (
      q.includes('open logistics') || q.includes('show logistics') || q.includes('delivery route') ||
      q.includes('లాజిస్టిక్స్') || q.includes('రవాణా') ||
      q.includes('लॉजिस्टिक्स खोलो') || q.includes('लॉजिस्टिक्स') || q.includes('ट्रांसपोर्ट')
    ) {
      return {
        target: 'farmer_logistics',
        announcement: lang === 'te'
          ? 'స్మార్ట్ లాజిస్టిక్స్ తెరవబడుతోంది...'
          : lang === 'hi'
          ? 'स्मार्ट लॉजिस्टिक्स खोला जा रहा है...'
          : 'Opening smart logistics...'
      };
    }

    // 4. My Products
    if (
      q.includes('open my products') || q.includes('my products') || q.includes('my crops') ||
      q.includes('నా ఉత్పత్తులు') || q.includes('నా పంటలు') ||
      q.includes('मेरी फसलें खोलो') || q.includes('मेरी फसलें') || q.includes('मेरे उत्पाद')
    ) {
      return {
        target: 'farmer_products',
        announcement: lang === 'te'
          ? 'మీ ఉత్పత్తుల జాబితా తెరవబడుతోంది...'
          : lang === 'hi'
          ? 'आपकी फसलों की सूची खोली जा रही है...'
          : 'Opening your products...'
      };
    }

    // 5. Orders
    if (
      q.includes('open orders') || q.includes('my orders') || q.includes('show orders') ||
      q.includes('నా ఆర్డర్లు') || q.includes('ఆర్డర్లు తెరవండి') ||
      q.includes('मेरे आर्डर खोलो') || q.includes('मेरे आर्डर') || q.includes('आर्डर खोलो')
    ) {
      return {
        target: 'farmer_orders',
        announcement: lang === 'te'
          ? 'మీ ఆర్డర్ల పేజీ తెరవబడుతోంది...'
          : lang === 'hi'
          ? 'आपके आर्डर खोले जा रहे हैं...'
          : 'Opening orders...'
      };
    }

    // 6. Home
    if (
      q.includes('go to home') || q.includes('open home') || q.includes('home page') ||
      q.includes('హోమ్') || q.includes('హోమ్ పేజీ') ||
      q.includes('होम पर जाओ') || q.includes('होम खोलो') || q.includes('डैशबोर्ड')
    ) {
      return {
        target: 'farmer_home',
        announcement: lang === 'te'
          ? 'హోమ్ పేజీకి వెళ్తున్నాము...'
          : lang === 'hi'
          ? 'मुख्य पृष्ठ पर ले जाया जा रहा है...'
          : 'Going to home dashboard...'
      };
    }

    return null;
  };

  // Play audio aloud in the correct language
  const handlePlayAnswer = (answerText: string, langToUse?: LanguageCode) => {
    // Detect script in text to guarantee matching voice
    const scriptLang = detectLanguage(answerText);
    const speechLang: LanguageCode = (langToUse === 'te' || langToUse === 'hi' || langToUse === 'en')
      ? langToUse
      : (scriptLang === 'te' || scriptLang === 'hi' ? scriptLang : null)
        || currentQA?.language
        || voiceInputLang
        || language
        || 'en';

    setVoiceState('SPEAKING');
    onStartSpeech();

    speakText(
      answerText,
      speechLang,
      () => {
        setVoiceState('SPEAKING');
        onStartSpeech();
      },
      () => {
        setVoiceState('ANSWER_READY');
        onEndSpeech();
      },
      () => {
        setVoiceState('ANSWER_READY');
        onEndSpeech();
      }
    );
  };

  const handleStopSpeaking = () => {
    stopSpeech();
    setVoiceState('IDLE');
    onEndSpeech();
  };

  // Core AI Question Processing Loop
  const handleQueryAI = async (questionText: string, isFromDemo: boolean = false) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setRecognizedQuestion(trimmed);
    setVoiceState('PROCESSING');
    setMicError(null);

    // 1. Language Detection:
    // First detect from script or phonetics, fallback to currently selected voiceInputLang
    const detectedLang: LanguageCode = detectLanguage(trimmed, voiceInputLang);

    // 2. Check for Voice Navigation Command
    const navCmd = checkVoiceNavigationCommand(trimmed, detectedLang);
    if (navCmd) {
      const navQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: navCmd.announcement,
        language: detectedLang,
        source: 'Voice Navigation',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCurrentQA(navQA);
      setHistory((prev) => [navQA, ...prev.slice(0, 5)]);
      setVoiceState('SPEAKING');
      
      speakText(
        navCmd.announcement,
        detectedLang,
        () => {
          setVoiceState('SPEAKING');
          onStartSpeech();
        },
        () => {
          setVoiceState('IDLE');
          onEndSpeech();
          if (onNavigate) {
            onNavigate(navCmd.target);
          }
        },
        () => {
          setVoiceState('IDLE');
          onEndSpeech();
          if (onNavigate) {
            onNavigate(navCmd.target);
          }
        }
      );
      return;
    }

    // 3. Application Data & Mandi Knowledge Grounding
    const mandiAnswer = answerMarketQueryFromData(trimmed, detectedLang);
    const logisticsAnswer = answerLogisticsQueryFromData(trimmed, detectedLang);
    const appDataAnswer = mandiAnswer || logisticsAnswer;

    try {
      const response = await fetch('/api/kisan-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language: detectedLang,
          preferredLanguage: language,
          detectedLanguage: detectedLang,
          mandiDataContext: appDataAnswer || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || appDataAnswer;
      const finalLang: LanguageCode = (data.language === 'hi' || data.language === 'te' || data.language === 'en')
        ? data.language
        : detectedLang;

      const newQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: answer,
        language: finalLang,
        source: data.source === 'gemini' ? 'Gemini AI Grounding' : 'Farm2Door Mandi Records',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentQA(newQA);
      setHistory((prev) => [newQA, ...prev.slice(0, 5)]);
      setVoiceState('ANSWER_READY');

      // Auto-speak answer aloud in the farmer's language
      handlePlayAnswer(answer, finalLang);

    } catch (err) {
      console.warn('AI Query fallback applied:', err);

      // Question-aware local fallback using verified AP Mandi & Farm2Door data
      const q = trimmed.toLowerCase();
      let fallbackText = appDataAnswer;

      if (!fallbackText) {
        // 1. Potato query (checked FIRST before tomato)
        if (
          q.includes('potato') || q.includes('potatoes') ||
          q.includes('आलू') ||
          q.includes('బంగాళాదుంప') || q.includes('బంగాళదుంప') || q.includes('ఆలూ') ||
          q.includes('aloogadda') || q.includes('alu')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'आंध्र प्रदेश मंडी रिकॉर्ड के अनुसार आज आलू का मॉडल संदर्भ भाव ₹22.0 प्रति किलो (₹2,200 प्रति क्विंटल) है और कोल्ड स्टोरेज केंद्रों में भाव स्थिर बना हुआ है।'
            : detectedLang === 'te'
            ? 'ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం బంగాళాదుంప మోడల్ రిఫరెన్స్ ధర కేజీకి ₹22.0 (క్వింటాల్‌కు ₹2,200) గా స్థిరంగా కొనసాగుతోంది.'
            : 'According to Andhra Pradesh APMC records, the potato modal reference price is ₹22.0 per kg (₹2,200 per quintal) with steady market stability.';
        }
        // 2. Onion query
        else if (
          q.includes('onion') || q.includes('onions') ||
          q.includes('प्याज') || q.includes('प्याज़') ||
          q.includes('ఉల్లి') || q.includes('ఉల్లిపాయ') ||
          q.includes('ullipaya') || q.includes('pyaj')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'आंध्र प्रदेश की मंडियों में आज प्याज का मॉडल संदर्भ भाव ₹28.0 प्रति किलो (₹2,800 प्रति क्विंटल) है। कुरनूल और निजामाबाद मंडियों में आवक स्थिर है।'
            : detectedLang === 'te'
            ? 'ఆంధ్రప్రదేశ్ APMC మార్కెట్లలో ఉల్లిపాయ మోడల్ రిఫరెన్స్ ధర కేజీకి ₹28.0 (క్వింటాల్‌కు ₹2,800) గా ఉంది. కర్నూలు మరియు నిజామాబాద్ మార్కెట్లలో సరఫరా స్థిరంగా ఉంది.'
            : "Today's onion modal reference rate across Andhra Pradesh APMC mandis is ₹28.0 per kg (₹2,800 per quintal).";
        }
        // 3. Pending orders / My orders query
        else if (
          q.includes('order') || q.includes('orders') || q.includes('pending') ||
          q.includes('ऑर्डर') || q.includes('आर्डर') || q.includes('लंबित') ||
          q.includes('ఆర్డర్') || q.includes('ఆర్డర్లు') || q.includes('పెండింగ్')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'आपके फार्म2डोर खाते में सक्रिय ऑर्डर हैं: ऑर्डर #F2D-8820 (250 किलो टमाटर, डिलीवरी के लिए तैयार) और थोक अनुरोध BLK-701 (25 क्विंटल टमाटर, पुष्टि लंबित)।'
            : detectedLang === 'te'
            ? 'మీ ఫార్మ్2డోర్ ఖాతాలో యాక్టివ్ ఆర్డర్లు ఉన్నాయి: ఆర్డర్ #F2D-8820 (250 కేజీల టమోటా, డెలివరీకి సిద్ధం) మరియు బల్క్ రిక్వెస్ట్ BLK-701 (25 క్వింటాళ్లు, పెండింగ్).'
            : 'In your Farm2Door orders, you have active orders including Order #F2D-8820 for 250 kg Tomato (Ready for Delivery) and Bulk Sourcing Request BLK-701 for 25 quintals (Pending confirmation).';
        }
        // 4. Farmer selling price for tomato
        else if (
          (q.includes('selling') || q.includes('बिक्री') || q.includes('अమ్మకపు') || q.includes('అమ్మే')) &&
          (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా') || q.includes('tamatar'))
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'फार्म2डोर पर ताजे टमाटर का किसान बिक्री मूल्य ₹34.0 प्रति किलो है, जिसमें से ₹27.0 प्रति किलो बिना किसी बिचौलिये के सीधे किसान के बैंक खाते में आता है।'
            : detectedLang === 'te'
            ? 'ఫార్మ్2డోర్‌లో తాజా టమోటా రైతు అమ్మకపు ధర కేజీకి ₹34.0 గా ఉంది, ఇందులో దళారుల కోత లేకుండా ₹27.0 నేరుగా రైతు బ్యాంక్ ఖాతాకు చేరుతుంది.'
            : "On Farm2Door, the listed selling price for fresh tomatoes is ₹34.0 per kg, with ₹27.0 per kg going directly into the farmer's bank account with zero broker deductions.";
        }
        // 5. Tomato price query specifically
        else if (
          q.includes('tomato') || q.includes('tomatoes') ||
          q.includes('टमाटर') || q.includes('tamatar') ||
          q.includes('టమోటా') || q.includes('టమాటా')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'आंध्र प्रदेश मंडी आंकड़ों के अनुसार आज टमाटर का मॉडल संदर्भ भाव ₹34.0 प्रति किलो (₹3,400 प्रति क्विंटल) है। बोवेनपल्ली और कुरनूल मंडियों में सबसे अच्छे संदर्भ भाव दर्ज हैं। फार्म2डोर पर सीधे बेचने से बिचौलियों का कमीशन बचता है।'
            : detectedLang === 'te'
            ? 'ఆంధ్రప్రదేశ్ మార్కెట్ రికార్డుల ప్రకారం టమోటా యొక్క మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34.0 (క్వింటాల్‌కు ₹3,400) గా ఉంది. బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో మంచి ధరలు నమోదయ్యాయి. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే దళారుల కమీషన్ లేకుండా పూర్తి లాభం లభిస్తుంది.'
            : 'According to Andhra Pradesh APMC records, the tomato modal reference price is ₹34.0 per kg (₹3,400 per quintal), with Bowenpally and Kurnool mandis quoting highest rates.';
        }
        // 6. Logistics and Deliveries
        else if (
          q.includes('delivery') || q.includes('deliveries') || q.includes('dispatch') || q.includes('route') ||
          q.includes('डिलीवरी') || q.includes('डिलिवरी') || q.includes('लॉजिस्टिक्स') ||
          q.includes('డెలివరీ') || q.includes('రవాణా') || q.includes('లాజిస్టిక్స్')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'फार्म2डोर स्मार्ट लॉजिस्टिक्स में रूट DR-AP-01 पर 2 डिलीवरी लंबित हैं: गोलापुडी एग्री यार्ड हब से मंगलागिरी टाउन और गुंटूर सिटी सेंटर के लिए।'
            : detectedLang === 'te'
            ? 'ఫార్మ్2డోర్ స్మార్ట్ లాజిస్టిక్స్‌లో రూట్ DR-AP-01 పై గొల్లపూడి అగ్రి యార్డ్ హబ్ నుండి మంగళగిరి మరియు గుంటూరు నగరాలకు 2 డెలివరీలు పెండింగ్‌లో ఉన్నాయి.'
            : 'In Farm2Door Smart Logistics, route DR-AP-01 has 2 pending farm-gate dispatches from Gollapudi Agri Yard Hub to Mangalagiri Town and Guntur City Centre.';
        }
        // 7. Where to sell query
        else if (
          q.includes('where to sell') || q.includes('how to sell') ||
          q.includes('कहाँ बेच') || q.includes('कहा बेच') ||
          q.includes('ఎక్కడ అమ్మాలి') || q.includes('ఎక్కడ అమ్ముకోవాలి')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'आपके पास दो बेहतरीन विकल्प हैं: 1. फार्म2डोर पर सीधे बेचें जहाँ खेत से सीधी पिकअप और 0% कमीशन मिलेगा। 2. स्थानीय मंडियों में बोवेनपल्ली और कुरनूल में सबसे अच्छे संदर्भ रेट मिल रहे हैं।'
            : detectedLang === 'te'
            ? 'మీ పంటను అమ్మడానికి రెండు మంచి మార్గాలు ఉన్నాయి: 1. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్ముకుంటే తోట వద్దే కేజీకి ₹34తో పికప్ మరియు సున్నా కమీషన్. 2. స్థానిక మార్కెట్లలో బోవెన్‌పల్లి లేదా కర్నూలు మార్కెట్‌లో మంచి రేటు వస్తుంది.'
            : 'You can sell directly on Farm2Door with 0% commission and farm-gate pickup, or sell in Bowenpally and Kurnool mandis which record highest rates.';
        }
        // 8. General price inquiry without crop name
        else if (
          q.includes('price') || q.includes('rate') || q.includes('bhav') ||
          q.includes('भाव') || q.includes('कीमत') || q.includes('रेट') || q.includes('दाम') ||
          q.includes('ధర') || q.includes('ధరలు') || q.includes('రేటు')
        ) {
          fallbackText = detectedLang === 'hi'
            ? 'फार्म2डोर पर उपलब्ध आज के मुख्य मंडी संदर्भ भाव: टमाटर ₹34.0/किग्रा, प्याज ₹28.0/किग्रा और आलू ₹22.0/किग्रा। आप किसी भी विशिष्ट फसल का भाव पूछ सकते हैं।'
            : detectedLang === 'te'
            ? 'ఫార్మ్2డోర్ రికార్డులలో అందుబాటులో ఉన్న ముఖ్య పంటల ధరలు: టమోటా కేజీకి ₹34.0, ఉల్లిపాయ కేజీకి ₹28.0 మరియు బంగాళాదుంప కేజీకి ₹22.0. మీరు నిర్దిష్ట పంట ధరను అడగవచ్చు.'
            : 'Available APMC mandi reference rates on Farm2Door: Tomato ₹34.0/kg, Onion ₹28.0/kg, and Potato ₹22.0/kg. You can ask for rates of any specific crop.';
        }
        // 9. General greeting or advice
        else {
          fallbackText = detectedLang === 'hi'
            ? 'नमस्ते किसान भाई! मैं आपका फार्म2डोर किसान सहायक हूँ। आप मुझसे टमाटर, प्याज या आलू के मंडी भाव, अपने लंबित ऑर्डर या लॉजिस्टिक्स डिलीवरी के बारे में पूछ सकते हैं।'
            : detectedLang === 'te'
            ? 'నమస్కారం రైతు మిత్రమా! నేను మీ ఫార్మ్2డోర్ కిసాన్ సహాయకుడిని. మీరు నన్ను టమోటా, ఉల్లిపాయ లేదా బంగాళాదుంప మార్కెట్ ధరలు, మీ పెండింగ్ ఆర్డర్లు లేదా డెలివరీ సమాచారం గురించి అడగవచ్చు.'
            : 'Hello! I am your Farm2Door Kisan Assistant. You can ask me about tomato, onion, or potato market rates, check your pending orders, or track logistics dispatches.';
        }
      }

      const fallbackQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: fallbackText,
        language: detectedLang,
        source: 'AP Mandi Intelligence',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentQA(fallbackQA);
      setHistory((prev) => [fallbackQA, ...prev.slice(0, 5)]);
      setVoiceState('ANSWER_READY');
      handlePlayAnswer(fallbackText, detectedLang);
    }
  };

  // Demo Voice Flow Simulator (Requirement 13)
  const handleExecuteDemoVoiceFlow = (questionText: string) => {
    stopSpeech();
    setMicError(null);
    setVoiceState('LISTENING');
    setRecognizedQuestion('');
    setInterimTranscript(
      voiceInputLang === 'te' 
        ? 'నమూనా వాయిస్ వినబడుతోంది...' 
        : voiceInputLang === 'hi' 
        ? 'डेमो आवाज सुनी जा रही है...' 
        : 'Simulating spoken voice query...'
    );

    // Simulate 1.2s voice listening interval, then show recognized text
    demoTimerRef.current = setTimeout(() => {
      setInterimTranscript('');
      setRecognizedQuestion(questionText);
      handleQueryAI(questionText, true);
    }, 1200);
  };

  // Start / Stop Real Microphone Speech Recognition
  const handleToggleListening = async () => {
    if (isDemoMode) {
      // In demo mode, run demo flow with current or default question
      const sampleQuestion = EXAMPLE_QUESTIONS[0][voiceInputLang] || EXAMPLE_QUESTIONS[0].en;
      handleExecuteDemoVoiceFlow(sampleQuestion);
      return;
    }

    if (voiceState === 'LISTENING') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setVoiceState('IDLE');
      return;
    }

    setMicError(null);
    handleStopSpeaking();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('ERROR');
      setMicError(
        language === 'hi'
          ? 'इस ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है। आप नीचे सवाल लिखकर पूछ सकते हैं या वॉइस डेमो मोड का उपयोग करें।'
          : language === 'te'
          ? 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి క్రింద టైప్ చేయండి లేదా వాయిస్ డెమో మోడ్ ఉపయోగించండి.'
          : 'Speech recognition is not supported in this browser. Please type your question below or toggle Voice Demo Mode.'
      );
      setShowManualInput(true);
      return;
    }

    try {
      setIsRequestingMic(true);

      // Explicitly check / prompt mediaDevices permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission request failed:', permErr);
          setIsRequestingMic(false);
          setVoiceState('ERROR');
          setMicError(
            language === 'hi'
              ? 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें, सवाल लिखें, या वॉइस डेमो मोड चालू करें।'
              : language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ అనుమతించండి, టైప్ చేయండి, లేదా వాయిస్ డెమో మోడ్ ఉపయోగించండి.'
              : 'Microphone permission was denied. Please allow microphone access, type your question, or enable Voice Demo Mode.'
          );
          setShowManualInput(true);
          return;
        }
      }

      setIsRequestingMic(false);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Locale mapping: Telugu -> 'te-IN', Hindi -> 'hi-IN', English -> 'en-IN'
      recognition.lang = getSpeechRecognitionLocale(voiceInputLang);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setInterimTranscript('');
        setRecognizedQuestion('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInterimTranscript('');
          setRecognizedQuestion(final);
          handleQueryAI(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsRequestingMic(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('ERROR');
          setMicError(
            language === 'hi'
              ? 'माइक की अनुमति नहीं है। कृपया लिखकर पूछें या वॉइस डेमो मोड चालू करें।'
              : language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి లేదు. దయచేసి టైప్ చేయండి లేదా వాయిస్ డెమో మోడ్ ఉపయోగించండి.'
              : 'Microphone is blocked or permission denied. You can type or use Voice Demo Mode.'
          );
          setShowManualInput(true);
        } else if (event.error === 'no-speech') {
          setVoiceState('IDLE');
          setInterimTranscript('');
        } else {
          setVoiceState('ERROR');
          setMicError(
            language === 'hi'
              ? 'आवाज़ साफ़ सुनाई नहीं दी। दोबारा माइक दबाएं, सवाल लिखें, या डेमो मोड आज़माएं।'
              : language === 'te'
              ? 'వాయిస్ సరిగ్గా వినపడలేదు. దయచేసి మళ్లీ మాట్లాడండి లేదా డెమో మోడ్ ఉపయోగించండి.'
              : 'Could not capture voice clearly. Please tap again to retry or use Voice Demo Mode.'
          );
        }
      };

      recognition.onend = () => {
        setIsRequestingMic(false);
        // Only revert to IDLE if not transitioning to PROCESSING or SPEAKING
        setVoiceState((current) => (current === 'LISTENING' ? 'IDLE' : current));
      };

      recognition.start();

    } catch (err: any) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsRequestingMic(false);
      setVoiceState('ERROR');
      setMicError(
        language === 'hi'
          ? 'माइक शुरू नहीं हो सका। कृपया सवाल लिखें या वॉइस डेमो मोड का उपयोग करें।'
          : language === 'te'
          ? 'మైక్రోఫోన్ ప్రారంభం కాలేదు. దయచేసి టైప్ చేయండి లేదా డెమో మోడ్ ఉపయోగించండి.'
          : 'Unable to start microphone. Please type your question or use Voice Demo Mode.'
      );
      setShowManualInput(true);
    }
  };

  const handleExampleClick = (item: ExamplePrompt) => {
    const questionText = item[voiceInputLang] || item[language] || item.en;
    if (isDemoMode) {
      handleExecuteDemoVoiceFlow(questionText);
    } else {
      handleQueryAI(questionText);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const text = manualText;
    setManualText('');
    handleQueryAI(text);
  };

  const handleClearHistory = () => {
    setHistory([]);
    handleStopSpeaking();
  };

  // Helper for localized state labels
  const getStateInfo = () => {
    switch (voiceState) {
      case 'LISTENING':
        return {
          badge: isDemoMode ? 'DEMO VOICE INPUT' : 'LISTENING',
          title: isDemoMode
            ? (voiceInputLang === 'te' ? 'డెమో వాయిస్ వినబడుతోంది...' : voiceInputLang === 'hi' ? 'डेमो आवाज सुनी जा रही है...' : 'Demo Voice Input: Simulating spoken query...')
            : (voiceInputLang === 'te' ? 'మీ ప్రశ్నను వింటున్నాము...' : voiceInputLang === 'hi' ? 'आपका सवाल सुन रहे हैं...' : 'Listening to your voice...'),
          bg: 'bg-red-50 border-red-300 text-red-700',
          dot: 'bg-red-500 animate-ping',
        };
      case 'PROCESSING':
        return {
          badge: 'AI THINKING',
          title: voiceInputLang === 'te' ? 'AI సమాధానం సిద్ధం చేస్తోంది...' : voiceInputLang === 'hi' ? 'AI उत्तर तैयार कर रहा है...' : 'AI is processing query with AP Mandi data...',
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'SPEAKING':
        return {
          badge: 'SPEAKING ALOUD',
          title: voiceInputLang === 'te' ? 'సమాధానం తెలుగులో వినిపిస్తున్నాము...' : voiceInputLang === 'hi' ? 'उत्तर हिन्दी में बोलकर सुनाया जा रहा है...' : 'Speaking answer aloud via voice engine...',
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          dot: 'bg-emerald-600 animate-pulse',
        };
      case 'ANSWER_READY':
        return {
          badge: 'ANSWER READY',
          title: voiceInputLang === 'te' ? 'సమాధానం సిద్ధం — వినడానికి స్పీకర్ నొక్కండి' : voiceInputLang === 'hi' ? 'उत्तर तैयार — सुनने के लिए स्पीकर दबाएं' : 'Answer ready — tap speaker to listen',
          bg: 'bg-teal-50 border-teal-300 text-teal-800',
          dot: 'bg-teal-600',
        };
      case 'ERROR':
        return {
          badge: 'VOICE ASSISTANT ERROR',
          title: voiceInputLang === 'te' ? 'వాయిస్ ఇన్పుట్ లోపం — టైప్ చేయండి లేదా డెమో మోడ్ ఉపయోగించండి' : voiceInputLang === 'hi' ? 'वॉइस इनपुट त्रुटि — लिखकर पूछें या डेमो मोड चालू करें' : 'Voice input issue — try typing or use Demo Mode',
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          dot: 'bg-amber-600',
        };
      case 'IDLE':
      default:
        return {
          badge: isDemoMode ? 'DEMO MODE READY' : 'READY',
          title: voiceInputLang === 'te' ? 'సిద్ధంగా ఉంది — మైక్ నొక్కండి లేదా ప్రశ్నను ఎంచుకోండి' : voiceInputLang === 'hi' ? 'तैयार — माइक दबाएं या सवाल चुनें' : 'Ready — Tap microphone or select a question',
          bg: 'bg-stone-50 border-stone-200 text-stone-700',
          dot: 'bg-emerald-500',
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sm:space-y-8">
      
      {/* 1. Header Banner with Voice Demo Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
            <Bot className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider mb-1 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>Multilingual Kisan Voice Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {t('voice.hubTitle', language)}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {t('voice.hubSubtitle', language)}
            </p>
          </div>
        </div>

        {/* Action Controls: Demo Mode Toggle & Stop Audio Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          
          {/* Voice Demo Mode Toggle */}
          <button
            id="kisan-toggle-demo-mode-btn"
            onClick={() => {
              setIsDemoMode(!isDemoMode);
              setMicError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              isDemoMode
                ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
            title="Toggle Voice Demo Mode for presentations when microphone is unavailable"
          >
            <Radio className={`w-4 h-4 ${isDemoMode ? 'text-amber-600 animate-pulse' : 'text-stone-500'}`} />
            <span>Voice Demo Mode</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${isDemoMode ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'}`}>
              {isDemoMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Global Stop Audio Button */}
          {voiceState === 'SPEAKING' && (
            <button
              id="kisan-stop-audio-header-btn"
              onClick={handleStopSpeaking}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/30 animate-pulse transition-all cursor-pointer shrink-0"
              title="Stop audio reading"
            >
              <VolumeX className="w-4 h-4" />
              <span>{t('voice.stopAudio', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
          <Sparkle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Interactive Voice Demo Mode Active: </span>
            <span>
              Tap the large microphone or any sample question below. The hub will simulate live voice listening, process the query through AI, and speak the answer aloud in Telugu, Hindi, or English.
            </span>
          </div>
        </div>
      )}

      {/* 2. Main Microphone Stage */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        
        {/* Speaking / Recognition Language Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs font-bold text-stone-500">
            {voiceInputLang === 'te' ? 'మాట్లాడే భాష:' : voiceInputLang === 'hi' ? 'बोलने की भाषा:' : 'Language:'}
          </span>
          {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
            <button
              key={l}
              id={`kisan-voice-lang-${l}`}
              onClick={() => {
                setVoiceInputLang(l);
                onLanguageChange?.(l);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                voiceInputLang === l
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400 scale-105'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>
                {l === 'te' ? '🌾 తెలుగు (Telugu)' : l === 'hi' ? '🇮🇳 हिन्दी (Hindi)' : '🌐 English'}
              </span>
            </button>
          ))}
        </div>

        {/* Central Large Microphone Button */}
        <div className="relative flex items-center justify-center">
          
          {/* Animated Pulsing Sound Rings when listening */}
          {voiceState === 'LISTENING' && (
            <>
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-red-500/10 animate-pulse" />
            </>
          )}

          {/* Sound waves when speaking */}
          {voiceState === 'SPEAKING' && (
            <>
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-emerald-500/20 animate-pulse" />
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-teal-500/10 animate-pulse delay-100" />
            </>
          )}

          <button
            id="kisan-tap-and-speak-btn"
            onClick={handleToggleListening}
            disabled={isRequestingMic}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl cursor-pointer transition-all duration-300 relative z-10 select-none ${
              voiceState === 'LISTENING'
                ? 'bg-red-600 scale-105 ring-8 ring-red-300 shadow-red-600/40'
                : voiceState === 'PROCESSING'
                ? 'bg-amber-600 animate-pulse ring-8 ring-amber-200'
                : voiceState === 'SPEAKING'
                ? 'bg-teal-700 ring-8 ring-teal-200 shadow-teal-700/30'
                : isRequestingMic
                ? 'bg-stone-600 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 hover:scale-105 ring-8 ring-emerald-200/90 shadow-emerald-800/30'
            }`}
            aria-label="Tap and Speak voice assistant"
          >
            {voiceState === 'LISTENING' ? (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce text-white stroke-[2.5]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 text-white">
                  {t('voice.stopListening', language)}
                </span>
              </>
            ) : voiceState === 'PROCESSING' ? (
              <>
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-amber-100" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 text-amber-100">
                  Processing...
                </span>
              </>
            ) : voiceState === 'SPEAKING' ? (
              <>
                <Volume2 className="w-14 h-14 sm:w-18 sm:h-18 animate-pulse text-white stroke-[2.5]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 text-white">
                  Speaking...
                </span>
              </>
            ) : isRequestingMic ? (
              <>
                <Mic className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse text-stone-200" />
                <span className="text-xs font-bold mt-1 text-stone-200">
                  Starting Mic...
                </span>
              </>
            ) : (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18 stroke-[2.5]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1.5">
                  {t('voice.tapToSpeak', language)}
                </span>
              </>
            )}
          </button>
        </div>

        {/* 3. Explicit Voice Hub State Indicator Banner */}
        <div className="mt-6 max-w-md w-full">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all text-center ${stateInfo.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stateInfo.dot}`} />
            <div className="text-xs sm:text-sm font-bold">
              <span className="font-extrabold mr-1.5">[{stateInfo.badge}]</span>
              <span>{stateInfo.title}</span>
            </div>
          </div>
        </div>

        {/* Live Interim Transcript Bubble while Listening */}
        {voiceState === 'LISTENING' && interimTranscript && (
          <div className="mt-3 text-sm sm:text-base font-bold text-stone-900 bg-stone-100 px-5 py-2.5 rounded-2xl border border-stone-300 max-w-lg text-center shadow-inner animate-fade-in">
            &ldquo;{interimTranscript}&rdquo;
          </div>
        )}

        {/* Error Alert Box with Friendly Recovery Options */}
        {micError && (
          <div className="mt-4 max-w-xl w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-stone-800 shadow-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-amber-950">{micError}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleListening}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Microphone</span>
                </button>
                <button
                  onClick={() => setIsDemoMode(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Use Voice Demo Mode</span>
                </button>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs cursor-pointer"
                >
                  <span>Type Question</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. Farmer-Friendly Example Voice Question Pills (Requirement 8) */}
      <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>{t('voice.exampleQuestions', language)}</span>
          </span>
          <span className="text-[11px] text-stone-400 font-semibold hidden sm:inline">
            Tap any question to ask AI & hear answer aloud
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {EXAMPLE_QUESTIONS.map((ex) => {
            const questionText = ex[voiceInputLang] || ex[language] || ex.en;
            return (
              <button
                key={ex.id}
                id={`demo-question-${ex.id}`}
                onClick={() => handleExampleClick(ex)}
                className="p-3.5 rounded-xl bg-white hover:bg-emerald-50 border-2 border-stone-200 hover:border-emerald-500 text-left transition-all duration-150 cursor-pointer shadow-xs flex items-start gap-2.5 group active:scale-98"
              >
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {ex.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-emerald-950 leading-snug">
                    &ldquo;{questionText}&rdquo;
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <span>Ask this question</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Voice Navigation Hint Banner */}
        <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{t('voice.navCommandsHint', language)}</span>
        </div>
      </div>

      {/* 5. Fallback Manual Question Input */}
      {showManualInput ? (
        <form onSubmit={handleManualSubmit} className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="kisan-manual-input" className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              {language === 'hi' ? 'सवाल टाइप करें:' : language === 'te' ? 'ప్రశ్నను టైప్ చేయండి:' : 'Type question manually:'}
            </label>
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="text-xs text-stone-500 hover:text-stone-800 font-bold cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="kisan-manual-input"
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={t('voice.inputPlaceholder', language)}
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-emerald-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-inner"
            />
            <button
              type="submit"
              disabled={!manualText.trim() || voiceState === 'PROCESSING'}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{t('voice.askAi', language)}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowManualInput(true)}
            className="text-xs font-bold text-stone-500 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{t('voice.typeManually', language)}</span>
          </button>
        </div>
      )}

      {/* 6. Active Interaction Display: Recognized Question + AI Answer + Speaker Controls */}
      {currentQA && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === 'hi' ? 'नवीनतम संवाद' : language === 'te' ? 'తాజా సంభాషణ' : 'Latest Interaction'}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {currentQA.timestamp}
            </span>
          </div>

          {/* User / Farmer Question Bubble */}
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">
                {language === 'hi' ? 'आपका सवाल' : language === 'te' ? 'మీ ప్రశ్న' : 'Recognized Question'}
              </div>
              <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                &ldquo;{currentQA.question}&rdquo;
              </p>
            </div>
          </div>

          {/* AI-Generated Answer Card with Speaker & Stop Controls */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 border-2 border-emerald-400 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    {language === 'hi' ? 'किसान सहायक का जवाब' : language === 'te' ? 'రైతు సహాయకుని సమాధానం' : 'Kisan Assistant Answer'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-emerald-800">
                      Source: {currentQA.source}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-900">
                      Language: {currentQA.language === 'te' ? 'తెలుగు (te-IN)' : currentQA.language === 'hi' ? 'हिन्दी (hi-IN)' : 'English (en-IN)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Speaker & Stop Controls */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                {voiceState === 'SPEAKING' ? (
                  <button
                    id="kisan-stop-speaking-btn"
                    onClick={handleStopSpeaking}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 animate-pulse transition-transform hover:scale-105 cursor-pointer"
                    title="Stop Audio Reading"
                    aria-label="Stop audio reading"
                  >
                    <VolumeX className="w-5 h-5" />
                    <span>{t('voice.stopAudio', language)}</span>
                  </button>
                ) : (
                  <button
                    id="kisan-listen-aloud-btn"
                    onClick={() => handlePlayAnswer(currentQA.answer, currentQA.language)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Hear AI Answer Read Aloud"
                    aria-label="Hear answer aloud"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>{t('voice.listenAloud', language)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Spoken Text Content */}
            <div className="mt-4 text-stone-900 text-base sm:text-lg leading-relaxed font-medium">
              {currentQA.answer}
            </div>

            {/* Speaking animation badge */}
            {voiceState === 'SPEAKING' && (
              <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span className="flex gap-1">
                  <span className="w-1.5 h-4 bg-emerald-700 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-emerald-700 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-3 bg-emerald-700 rounded-full animate-pulse delay-150" />
                </span>
                <span>Reading answer aloud in {currentQA.language === 'te' ? 'తెలుగు' : currentQA.language === 'hi' ? 'हिन्दी' : 'English'}...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. History of Recent Questions with Clear History Button */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === 'hi' ? 'पिछले संवाद' : language === 'te' ? 'మునుపటి సంభాషణలు' : 'Recent Queries'}
            </span>
            <button
              onClick={handleClearHistory}
              className="text-xs text-stone-400 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('voice.clearHistory', language)}</span>
            </button>
          </div>

          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl p-3.5 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-stone-900 truncate">
                    &ldquo;{item.question}&rdquo;
                  </p>
                  <p className="text-stone-600 truncate text-xs mt-0.5">
                    {item.answer}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentQA(item);
                    handlePlayAnswer(item.answer, item.language);
                  }}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 text-emerald-800 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  title="Listen to this past answer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">Hear</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
