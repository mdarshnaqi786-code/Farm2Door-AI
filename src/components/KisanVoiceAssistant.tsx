import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  AlertCircle, 
  RotateCcw, 
  HelpCircle, 
  Bot, 
  User, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  Flame,
  MessageSquarePlus
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

interface KisanVoiceAssistantProps {
  language: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  activeSection?: 'home' | 'voice_hub';
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  language: LanguageCode;
  source: string;
  timestamp: string;
}

export const KisanVoiceAssistant: React.FC<KisanVoiceAssistantProps> = ({
  language,
  onLanguageChange,
  onStartSpeech,
  onEndSpeech,
  activeSection = 'voice_hub',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognizedQuestion, setRecognizedQuestion] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);
  
  const preferredLang = getStoredUserPreferredLanguage();
  const effectiveInitialLang = (language === 'hi' || language === 'te')
    ? language
    : (preferredLang === 'te' || preferredLang === 'hi' ? preferredLang : 'en');

  const [voiceInputLang, setVoiceInputLang] = useState<LanguageCode>(effectiveInitialLang);

  useEffect(() => {
    if (language === 'hi' || language === 'te' || language === 'en') {
      setVoiceInputLang(language);
    }
  }, [language]);

  // Current active answer
  const [currentQA, setCurrentQA] = useState<QAItem | null>(() => {
    const isTelugu = effectiveInitialLang === 'te';
    const isHindi = effectiveInitialLang === 'hi';
    return {
      id: 'initial-demo',
      question: isHindi 
        ? 'आज टमाटर का मंडी भाव क्या है?' 
        : isTelugu 
        ? 'ఈరోజు టమాటా ధర ఎంత?' 
        : "What is today's tomato price?",
      answer: isHindi
        ? 'आज मुख्य मंडियों में उत्तम टमाटर का भाव ₹32 से ₹36 प्रति किलो चल रहा है। फार्म2डोर पर सीधे बेचने पर आपको पूरे ₹34 प्रति किलो मिलेंगे और बिचौलियों का कमीशन बचेगा।'
        : isTelugu
        ? 'ఈరోజు ప్రధాన మార్కెట్లలో నాణ్యమైన టమోటా ధర కేజీకి ₹32 నుండి ₹36 వరకు ఉంది. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే దళారుల కమీషన్ లేకుండా ₹34 పూర్తి ధర లభిస్తుంది.'
        : "Today's tomato rate in major mandis averages ₹32 to ₹36 per kg. Selling directly through Farm2Door fetches you ₹34 per kg at your farm-gate with zero middleman deductions.",
      language: effectiveInitialLang,
      source: 'gemini',
      timestamp: 'Just now'
    };
  });

  // Recent history
  const [history, setHistory] = useState<QAItem[]>([]);

  // Manual typed question fallback
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Stop speech synthesis when unmounting
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Localized texts
  const t = {
    tapAndSpeak: {
      en: 'Tap and Speak',
      hi: 'बोलने के लिए दबाएं',
      te: 'మాట్లాడటానికి నొక్కండి',
    },
    listening: {
      en: 'Listening...',
      hi: 'सुन रहे हैं...',
      te: 'వింటున్నాము...',
    },
    connectingMic: {
      en: 'Starting microphone...',
      hi: 'माइक शुरू हो रहा है...',
      te: 'మైక్రోఫోన్ ప్రారంభమవుతోంది...',
    },
    assistantTitle: {
      en: 'Kisan Voice Assistant',
      hi: 'किसान आवाज सहायक (AI)',
      te: 'రైతు వాయిస్ అసిస్టెంట్ (AI)',
    },
    assistantSubtitle: {
      en: 'Speak your question in English, Hindi, or Telugu. Live Gemini AI market intelligence.',
      hi: 'अपनी भाषा में बोलें — मंडी भाव, फसल कहाँ बेचें, और बेहतर दाम की जानकारी।',
      te: 'మీ భాషలో మాట్లాడండి — మార్కెట్ ధరలు, పంట అమ్మకం, లైవ్ సమాచారం.',
    },
    examplePromptLabel: {
      en: 'Try asking one of these questions:',
      hi: 'या इनमें से कोई सवाल दबाकर पूछें:',
      te: 'లేదా ఈ ప్రశ్నలలో ఒకదాన్ని నొక్కండి:',
    },
    examples: [
      {
        id: 'ex-1',
        icon: '🍅',
        en: "What is today's tomato reference price?",
        hi: 'आज टमाटर का मंडी संदर्भ भाव क्या है?',
        te: 'ఈరోజు టమోటా రిఫరెన్స్ ధర ఎంత?',
      },
      {
        id: 'ex-2',
        icon: '🏆',
        en: 'Which market has the highest tomato price?',
        hi: 'टमाटर का सबसे ऊंचा भाव किस मंडी में है?',
        te: 'టమోటాకు అత్యధిక ధర ఏ మార్కెట్‌లో ఉంది?',
      },
      {
        id: 'ex-3',
        icon: '🧅',
        en: 'Is onion price increasing?',
        hi: 'क्या प्याज का भाव बढ़ रहा है?',
        te: 'ఉల్లిపాయ ధర పెరుగుతోందా?',
      },
      {
        id: 'ex-4',
        icon: '🥔',
        en: 'What is the recent potato price trend?',
        hi: 'आलू का हालिया भाव ट्रेंड क्या है?',
        te: 'బంగాళాదుంప ఇటీవలి ధరల ధోరణి ఏమిటి?',
      },
      {
        id: 'ex-5',
        icon: '🚚',
        en: 'Where is my delivery?',
        hi: 'मेरी डिलीवरी कहाँ है?',
        te: 'నా డెలివరీ ఎక్కడ ఉంది?',
      },
      {
        id: 'ex-6',
        icon: '🗺️',
        en: 'Show my delivery route',
        hi: 'मेरा डिलीवरी रूट दिखाओ',
        te: 'నా డెలివరీ రూట్ చూపించు',
      },
      {
        id: 'ex-7',
        icon: '⚡',
        en: 'How much distance can I save?',
        hi: 'मैं कितनी दूरी बचा सकता हूँ?',
        te: 'నేను ఎంత దూరం ఆదా చేయగలను?',
      },
    ],
    youAsked: {
      en: 'Your Question',
      hi: 'आपका सवाल',
      te: 'మీ ప్రశ్న',
    },
    kisanAnswer: {
      en: 'Kisan Assistant Answer',
      hi: 'किसान सहायक का जवाब',
      te: 'రైతు సహాయకుని సమాధానం',
    },
    listenAloud: {
      en: 'Hear Answer Aloud',
      hi: 'जवाब सुनें',
      te: 'సమాధానం వినండి',
    },
    stopSpeaking: {
      en: 'Stop Speaking',
      hi: 'बोलना बंद करें',
      te: 'ఆపండి',
    },
    typeManuallyPlaceholder: {
      en: 'Type your agriculture question (e.g. What is today\'s onion rate?)...',
      hi: 'अपना सवाल यहाँ लिखें (उदा. आज प्याज का भाव क्या है?)...',
      te: 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి (ఉదా. నేటి ఉల్లిపాయ ధర ఎంత?)...',
    },
    askBtn: {
      en: 'Ask AI',
      hi: 'पूछें',
      te: 'అడగండి',
    },
    typeInstead: {
      en: 'Type question manually',
      hi: 'लिखकर सवाल पूछें',
      te: 'టైప్ చేసి అడగండి',
    },
  };

  const getLocalized = (obj: any) => {
    return obj[language] || obj['en'];
  };

  // Play audio aloud in the correct language
  const handlePlayAnswer = (answerText: string, langToUse?: LanguageCode) => {
    // Detect language of answer text or use explicit langToUse, fallback to currentQA.language or user preference
    const detectedLang = detectLanguage(answerText);
    const speechLang: LanguageCode = (langToUse === 'te' || langToUse === 'hi' || langToUse === 'en')
      ? langToUse
      : (detectedLang === 'te' || detectedLang === 'hi' ? detectedLang : null)
        || currentQA?.language
        || effectiveInitialLang
        || language
        || 'en';

    setIsSpeakingAnswer(true);
    onStartSpeech();
    speakText(
      answerText,
      speechLang,
      () => {
        setIsSpeakingAnswer(true);
        onStartSpeech();
      },
      () => {
        setIsSpeakingAnswer(false);
        onEndSpeech();
      },
      () => {
        setIsSpeakingAnswer(false);
        onEndSpeech();
      }
    );
  };

  const handleStopSpeaking = () => {
    stopSpeech();
    setIsSpeakingAnswer(false);
    onEndSpeech();
  };

  // Query Backend Gemini Endpoint
  const handleQueryAI = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const prefLang = getStoredUserPreferredLanguage();
    const effectivePreferred = (language === 'hi' || language === 'te')
      ? language
      : (prefLang === 'te' || prefLang === 'hi' ? prefLang : 'en');

    // LANGUAGE PRIORITY:
    // 1. Detect the language spoken/written in current question
    // 2. Respond in that same language
    // 3. If language detection fails, respond using the active voiceInputLang
    const detectedLang: LanguageCode = detectLanguage(trimmed, voiceInputLang);

    // Check if the query can be answered directly and accurately from the AP Mandi dataset
    const datasetAnswer = answerMarketQueryFromData(trimmed, detectedLang);

    // Check if the query is a logistics query (Phase 4 Smart Logistics)
    const logisticsAnswer = answerLogisticsQueryFromData(trimmed, detectedLang);
    if (logisticsAnswer) {
      setRecognizedQuestion(trimmed);
      setInterimTranscript('');
      handleStopSpeaking();
      setIsGeneratingAnswer(false);
      const newQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: logisticsAnswer,
        language: detectedLang,
        source: 'smart-logistics-optimizer',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCurrentQA(newQA);
      setHistory((prev) => [newQA, ...prev.slice(0, 5)]);
      handlePlayAnswer(logisticsAnswer, detectedLang);
      return;
    }

    setIsGeneratingAnswer(true);
    setRecognizedQuestion(trimmed);
    setInterimTranscript('');
    handleStopSpeaking();

    try {
      const response = await fetch('/api/kisan-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language: detectedLang,
          detectedLanguage: detectedLang,
          preferredLanguage: voiceInputLang,
          mandiDataContext: datasetAnswer || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || datasetAnswer || 'No response generated. Please try again.';
      const finalLang: LanguageCode = (data.language === 'te' || data.language === 'hi' || data.language === 'en')
        ? data.language
        : detectedLang;

      const newQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: answer,
        language: finalLang,
        source: data.source || (datasetAnswer ? 'ap-mandi-dataset' : 'gemini'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentQA(newQA);
      setHistory((prev) => [newQA, ...prev.slice(0, 5)]);

      // AUTOMATICALLY speak the answer aloud in the farmer's language
      handlePlayAnswer(answer, finalLang);

    } catch (err) {
      console.warn('AI Query failed, applying dataset intelligence guidance:', err);

      // Local graceful fallback respecting detected language & AP Mandi dataset
      let fallbackText = datasetAnswer || '';
      if (!fallbackText) {
        const q = trimmed.toLowerCase();
        if (q.includes('tomato') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా') || q.includes('ధర') || q.includes('రేటు')) {
          fallbackText = detectedLang === 'hi'
            ? 'आंध्र प्रदेश की प्रमुख मंडियों में टमाटर का मॉडल संदर्भ भाव ₹34 प्रति किलो चल रहा है। फार्म2डोर पर सीधे बेचने पर आपको पूरा दाम मिलेगा।'
            : detectedLang === 'te'
            ? 'ఆంధ్రప్రదేశ్ ప్రధాన మార్కెట్లలో టమోటా మోడల్ రిఫరెన్స్ ధర కేజీకి ₹34 గా ఉంది. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే పూర్తి లాభం లభిస్తుంది.'
            : "According to Andhra Pradesh APMC records, tomato modal reference price is ₹34 per kg. Direct Farm2Door sales save middleman commissions.";
        } else if (q.includes('where') || q.includes('कहाँ') || q.includes('कहा') || q.includes('ఎక్కడ') || q.includes('sell') || q.includes('बेच') || q.includes('అమ్మాలి')) {
          fallbackText = detectedLang === 'hi'
            ? 'आप अपनी फसल सीधे फार्म2डोर के 120+ सत्यापित एफपीओ या थोक खरीदारों को खेत से बेच सकते हैं।'
            : detectedLang === 'te'
            ? 'మీరు మీ పంటను ఫార్మ్2డోర్ ద్వారా నేరుగా FPOలకు మరియు వినియోగదారులకు తోట వద్దే అమ్మవచ్చు.'
            : 'You can sell directly to 120+ verified FPOs on Farm2Door with direct farm-gate collection.';
        } else if (q.includes('best') || q.includes('मंडी') || q.includes('మార్కెట్') || q.includes('మంచి')) {
          fallbackText = detectedLang === 'hi'
            ? 'आंकड़ों के अनुसार बोवेनपल्ली और कुरनूल मंडियों में सबसे अच्छे संदर्भ भाव दर्ज हैं।'
            : detectedLang === 'te'
            ? 'రికార్డుల ప్రకారం బోవెన్‌పల్లి మరియు కర్నూలు మార్కెట్లలో మంచి రిఫరెన్స్ ధరలు నమోదయ్యాయి.'
            : 'According to AP records, Bowenpally and Kurnool mandis recorded the highest modal reference rates.';
        } else {
          fallbackText = detectedLang === 'hi'
            ? 'आज मुख्य मंडियों में अच्छा संदर्भ भाव मिल रहा है। फार्म2डोर पर सीधे बेचने से बिचौलियों का खर्च बचता है।'
            : detectedLang === 'te'
            ? 'ఈరోజు మార్కెట్ సమాచారం కోసం ఫార్మ్2డోర్ లైవ్ ధరలను చూడవచ్చు. టమోటా మరియు ఉల్లిపాయలకు మంచి డిమాండ్ ఉంది.'
            : 'Farm2Door direct farm-gate sale delivers high net earnings with zero commission fees.';
        }
      }

      const fallbackQA: QAItem = {
        id: Date.now().toString(),
        question: trimmed,
        answer: fallbackText,
        language: detectedLang,
        source: 'mandi-intelligence',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentQA(fallbackQA);
      setHistory((prev) => [fallbackQA, ...prev.slice(0, 5)]);
      handlePlayAnswer(fallbackText, detectedLang);

    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  // Start Voice Recognition
  const handleToggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    setMicError(null);
    handleStopSpeaking();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError(
        language === 'hi'
          ? 'इस ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है। कृपया नीचे अपना सवाल लिखकर पूछें।'
          : language === 'te'
          ? 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి క్రింద మీ ప్రశ్నను టైప్ చేయండి.'
          : 'Speech recognition is not supported in this browser. Please type your question below.'
      );
      setShowManualInput(true);
      return;
    }

    try {
      setIsRequestingMic(true);

      // Explicitly request microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop media stream tracks so SpeechRecognition can take over the microphone cleanly
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission request failed:', permErr);
          setIsRequestingMic(false);
          setMicError(
            language === 'hi'
              ? 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में जाकर माइक की अनुमति दें या नीचे सवाल लिखें।'
              : language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ అనుమతించండి లేదా క్రింద టైప్ చేయండి.'
              : 'Microphone permission was denied. Please allow microphone access in your browser or type your question below.'
          );
          setShowManualInput(true);
          return;
        }
      }

      setIsRequestingMic(false);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Locale rules: Telugu -> 'te-IN', Hindi -> 'hi-IN', English -> 'en-IN'
      recognition.lang = getSpeechRecognitionLocale(voiceInputLang);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
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
          setIsListening(false);
          handleQueryAI(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setIsRequestingMic(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError(
            language === 'hi'
              ? 'माइक की अनुमति अस्वीकार कर दी गई। कृपया नीचे लिखकर पूछें।'
              : language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి క్రింద టైప్ చేయండి.'
              : 'Microphone permission was not allowed. You can type your question manually.'
          );
          setShowManualInput(true);
        } else if (event.error === 'no-speech') {
          // Silent timeout
          setInterimTranscript('');
        } else {
          setMicError(
            language === 'hi'
              ? 'आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा माइक दबाकर बोलें या नीचे लिखें।'
              : language === 'te'
              ? 'వాయిస్ సరిగ్గా వినపడలేదు. దయచేసి మళ్లీ మాట్లాడండి లేదా టైప్ చేయండి.'
              : 'Could not hear clearly. Please tap again and speak into the microphone.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsRequestingMic(false);
      };

      recognition.start();

    } catch (err: any) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsListening(false);
      setIsRequestingMic(false);
      setMicError(
        language === 'hi'
          ? 'माइक शुरू नहीं हो सका। कृपया नीचे अपना सवाल टाइप करें।'
          : language === 'te'
          ? 'మైక్రోఫోన్ పని చేయలేదు. దయచేసి క్రింద టైప్ చేయండి.'
          : 'Unable to start microphone. Please type your question manually.'
      );
      setShowManualInput(true);
    }
  };

  const handleExampleClick = (item: any) => {
    const prefLang = getStoredUserPreferredLanguage();
    const effectiveLang = (voiceInputLang === 'hi' || voiceInputLang === 'te')
      ? voiceInputLang
      : (language === 'hi' || language === 'te' ? language : (prefLang === 'te' || prefLang === 'hi' ? prefLang : 'en'));
    const questionText = item[effectiveLang] || item[language] || item['en'];
    handleQueryAI(questionText);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const text = manualText;
    setManualText('');
    handleQueryAI(text);
  };

  return (
    <div className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sm:space-y-8">
      
      {/* Voice Hub Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
            <Bot className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider mb-1 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>Gemini AI Mandi Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {getLocalized(t.assistantTitle)}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {getLocalized(t.assistantSubtitle)}
            </p>
          </div>
        </div>

        {/* Global Stop Audio if currently playing */}
        {isSpeakingAnswer && (
          <button
            id="kisan-stop-audio-header-btn"
            onClick={handleStopSpeaking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/30 animate-pulse transition-all cursor-pointer shrink-0"
            title="Stop current audio reading"
          >
            <VolumeX className="w-5 h-5" />
            <span>{getLocalized(t.stopSpeaking)}</span>
          </button>
        )}
      </div>

      {/* Main Microphone Interaction Stage */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        
        {/* Active Speaking Language Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <span className="text-xs font-bold text-stone-500">
            {voiceInputLang === 'te' ? 'మాట్లాడే భాష:' : voiceInputLang === 'hi' ? 'बोलने की भाषा:' : 'Speaking Language:'}
          </span>
          {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
            <button
              key={l}
              type="button"
              id={`kisan-voice-lang-${l}`}
              onClick={() => {
                setVoiceInputLang(l);
                onLanguageChange?.(l);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                voiceInputLang === l
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>
                {l === 'te' ? '🌾 తెలుగు (te-IN)' : l === 'hi' ? '🇮🇳 हिन्दी (hi-IN)' : '🌐 English (en-IN)'}
              </span>
            </button>
          ))}
        </div>

        {/* Large Central Microphone Button */}
        <div className="relative flex items-center justify-center">
          
          {/* Animated Pulsing Sound Rings when listening */}
          {isListening && (
            <>
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-red-500/10 animate-pulse" />
            </>
          )}

          <button
            id="kisan-tap-and-speak-btn"
            onClick={handleToggleListening}
            disabled={isRequestingMic}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl cursor-pointer transition-all duration-300 relative z-10 select-none ${
              isListening
                ? 'bg-red-600 scale-105 ring-8 ring-red-300 shadow-red-600/40'
                : isRequestingMic
                ? 'bg-stone-600 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 hover:scale-105 ring-8 ring-emerald-200/90 shadow-emerald-800/30'
            }`}
            aria-label="Tap and Speak voice assistant"
          >
            {isListening ? (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce text-white stroke-[2.5]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 text-white">
                  {getLocalized(t.listening)}
                </span>
              </>
            ) : isRequestingMic ? (
              <>
                <Mic className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse text-stone-200" />
                <span className="text-xs font-bold mt-1 text-stone-200">
                  {getLocalized(t.connectingMic)}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18 stroke-[2.5]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1.5">
                  {getLocalized(t.tapAndSpeak)}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Listening Status & Real-time Live Interim Voice Text */}
        <div className="mt-5 text-center max-w-lg min-h-[40px] px-4">
          {isListening && (
            <div className="flex flex-col items-center gap-1.5 animate-fade-in">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm sm:text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>{getLocalized(t.listening)}</span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'hi' 
                  ? 'कृपया बोलें, हम आपकी बात सुन रहे हैं...' 
                  : language === 'te' 
                  ? 'దయచేసి మాట్లాడండి, వింటున్నాము...' 
                  : 'Please speak into your microphone...'}
              </p>
              {interimTranscript && (
                <div className="mt-2 text-sm sm:text-base font-bold text-stone-900 bg-stone-100 px-4 py-2 rounded-xl border border-stone-300 inline-block shadow-inner">
                  &ldquo;{interimTranscript}&rdquo;
                </div>
              )}
            </div>
          )}

          {!isListening && isGeneratingAnswer && (
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm sm:text-base animate-pulse">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
              <span>
                {language === 'hi'
                  ? 'किसान सहायक उत्तर तैयार कर रहा है...'
                  : language === 'te'
                  ? 'రైతు సహాయకుడు సమాధానం సిద్ధం చేస్తున్నారు...'
                  : 'Kisan Assistant is analyzing live APMC mandi data...'}
              </span>
            </div>
          )}

          {!isListening && !isGeneratingAnswer && !micError && (
            <p className="text-xs sm:text-sm font-semibold text-stone-600">
              {language === 'hi'
                ? 'माइक बटन दबाएं और मंडी भाव या फसल बेचने के बारे में पूछें'
                : language === 'te'
                ? 'మైక్ నొక్కి మార్కెట్ ధరలు లేదా పంట అమ్మకం గురించి అడగండి'
                : 'Click "Tap and Speak" to ask about tomato rates, onion prices, or best mandis'}
            </p>
          )}
        </div>

        {/* Error Notification with Friendly Manual Typing Option */}
        {micError && (
          <div className="mt-4 max-w-xl w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-stone-800 shadow-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-amber-950">{micError}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleListening}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Microphone</span>
                </button>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs cursor-pointer"
                >
                  <span>{getLocalized(t.typeInstead)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3 Important Example Voice Question Buttons */}
      <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>{getLocalized(t.examplePromptLabel)}</span>
          </span>
          <span className="text-[11px] text-stone-400 font-semibold hidden sm:inline">
            Tap any button to test AI response & voice audio
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {t.examples.map((ex) => {
            const questionText = ex[language] || ex['en'];
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
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-emerald-950 leading-snug">
                    &ldquo;{questionText}&rdquo;
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <span>Ask this question</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Question Input (Expandable fallback for typing) */}
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
              placeholder={getLocalized(t.typeManuallyPlaceholder)}
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-emerald-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-inner"
            />
            <button
              type="submit"
              disabled={!manualText.trim() || isGeneratingAnswer}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{getLocalized(t.askBtn)}</span>
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
            <span>{getLocalized(t.typeInstead)}</span>
          </button>
        </div>
      )}

      {/* Active Response Display: Recognized Question + AI Answer + Large Speaker Controls */}
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

          {/* 1. Farmer Recognized Question Bubble */}
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">
                {getLocalized(t.youAsked)}
              </div>
              <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                &ldquo;{currentQA.question}&rdquo;
              </p>
            </div>
          </div>

          {/* 2. AI-Generated Answer Card with Speaker & Stop Controls */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 border-2 border-emerald-400 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    {getLocalized(t.kisanAnswer)}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Source: Gemini AI Mandi Grounding
                  </span>
                </div>
              </div>

              {/* Large Speaker Controls */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                {isSpeakingAnswer ? (
                  <button
                    id="kisan-stop-speaking-btn"
                    onClick={handleStopSpeaking}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 animate-pulse transition-transform hover:scale-105 cursor-pointer"
                    title="Stop Audio Reading"
                    aria-label="Stop audio reading"
                  >
                    <VolumeX className="w-5 h-5" />
                    <span>{getLocalized(t.stopSpeaking)}</span>
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
                    <span>{getLocalized(t.listenAloud)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div className="mt-4 text-stone-900 text-base sm:text-lg leading-relaxed font-medium">
              {currentQA.answer}
            </div>

            {/* Speaking animation badge */}
            {isSpeakingAnswer && (
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

      {/* History of recent questions */}
      {history.length > 1 && (
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === 'hi' ? 'पिछले सवाल' : language === 'te' ? 'మునుపటి ప్రశ్నలు' : 'Recent Queries'}
            </span>
          </div>

          <div className="space-y-2">
            {history.slice(1).map((item) => (
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
                  className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 text-emerald-800 transition-colors shrink-0 cursor-pointer"
                  title="Listen to this past answer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
