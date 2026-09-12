import React, { useState } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  Languages, 
  Sparkles, 
  Plus, 
  Minus, 
  X, 
  CheckCircle, 
  ArrowUpRight, 
  Calendar, 
  Building2,
  PhoneCall,
  Check,
  Truck
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText, stopSpeech, FARMER_VOICE_STRINGS } from '../utils/speech';
import { COMMODITY_PRICES } from '../data/mockData';
import { KisanVoiceAssistant } from './KisanVoiceAssistant';
import { t } from '../data/translations';

interface FarmerDashboardProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  onNavigateToMarketIntel: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToLogistics?: () => void;
  onNavigateToMarketplace?: () => void;
  onNavigateToHome?: () => void;
  activeSection?: 'home' | 'voice_hub';
}

type ActiveFarmerModal = 'none' | 'products' | 'prices' | 'orders' | 'earnings';

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  language,
  onLanguageChange,
  onStartSpeech,
  onEndSpeech,
  onNavigateToMarketIntel,
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToLogistics,
  onNavigateToMarketplace,
  onNavigateToHome,
  activeSection = 'home',
}) => {
  const [activeModal, setActiveModal] = useState<ActiveFarmerModal>('none');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<string | null>(null);

  // Simple farmer product stocks for interactive demo
  const [farmerStock, setFarmerStock] = useState([
    { id: '1', name: 'Tomato (टमाटर)', te: 'టమోటా', kg: 450, price: 34, icon: '🍅' },
    { id: '2', name: 'Onion (प्याज)', te: 'ఉల్లిపాయ', kg: 800, price: 28, icon: '🧅' },
    { id: '3', name: 'Potato (आलू)', te: 'బంగాళాదుంప', kg: 1200, price: 24, icon: '🥔' },
  ]);

  // Adjust stock
  const handleAdjustStock = (id: string, delta: number) => {
    setFarmerStock((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, kg: Math.max(0, item.kg + delta) } : item
      )
    );
  };

  // Welcome speech
  const handleSpeakWelcome = () => {
    const text = FARMER_VOICE_STRINGS.welcome[language];
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // Card speech
  const handleSpeakCard = (cardKey: 'cardProducts' | 'cardPrices' | 'cardOrders' | 'cardEarnings') => {
    const text = FARMER_VOICE_STRINGS[cardKey].speech[language];
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // Insight speech
  const handleSpeakInsight = (commodityKey: 'Tomato' | 'Onion' | 'Potato') => {
    const item = COMMODITY_PRICES.find((c) => c.commodity === commodityKey);
    if (!item) return;

    let textToSpeak = item.aiInsight[language];
    if (item.recommendation) {
      textToSpeak += ' ' + item.recommendation[language];
    }
    speakText(textToSpeak, language, onStartSpeech, onEndSpeech);
  };

  // Voice recognition / speech trigger
  const handleToggleVoiceAssistant = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setSpeechTranscript('');
    setAssistantReply(null);

    // Prompt user in audio
    const promptText = FARMER_VOICE_STRINGS.tapToSpeak[language];
    speakText(promptText, language, onStartSpeech, () => {
      // Check browser SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSpeechTranscript(transcript);
            processFarmerVoiceCommand(transcript);
            setIsListening(false);
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch (e) {
          console.warn('SpeechRecognition failed to start:', e);
        }
      }
    });
  };

  // Process voice commands or simulated quick prompts
  const processFarmerVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();
    let reply = '';

    if (lower.includes('price') || lower.includes('mandi') || lower.includes('भाव') || lower.includes('ధర')) {
      if (lower.includes('tomato') || lower.includes('टमाटर') || lower.includes('టమోటా')) {
        reply = language === 'hi'
          ? 'आज टमाटर का मंडी भाव ₹34 प्रति किलो है। दाम बढ़ रहे हैं।'
          : language === 'te'
          ? 'ఈరోజు టమోటా మార్కెట్ ధర కేజీకి ₹34. ధరలు పెరుగుతున్నాయి.'
          : 'Today tomato mandi price is ₹34 per kilogram. Upward trend.';
      } else {
        reply = language === 'hi'
          ? 'आज टमाटर ₹34, प्याज ₹28, और आलू ₹24 प्रति किलो चल रहा है।'
          : language === 'te'
          ? 'ఈరోజు టమోటా ₹34, ఉల్లిపాయ ₹28, బంగాళాదుంప ₹24 గా ఉన్నాయి.'
          : 'Current prices: Tomato ₹34, Onion ₹28, and Potato ₹24 per kilogram.';
      }
      setActiveModal('prices');
    } else if (lower.includes('earning') || lower.includes('कमाई') || lower.includes('पैसा') || lower.includes('సంపాదన')) {
      reply = language === 'hi'
        ? 'आपकी इस हफ्ते की कुल कमाई ₹18,450 है। सीधे बैंक खाते में जमा हो चुकी है।'
        : language === 'te'
        ? 'ఈ వారం మీ మొత్తం సంపాదన ₹18,450. మీ బ్యాంకు ఖాతాకు జమ చేయబడింది.'
        : 'Your earnings this week are ₹18,450, deposited directly to your bank account.';
      setActiveModal('earnings');
    } else if (lower.includes('order') || lower.includes('आर्डर') || lower.includes('ఆర్డర్')) {
      reply = language === 'hi'
        ? 'आपके पास 2 नए आर्डर हैं। 450 किलो टमाटर के लिए पिकअप गाड़ी आ रही है।'
        : language === 'te'
        ? 'మీకు 2 కొత్త ఆర్డర్లు ఉన్నాయి. 450 కేజీల టమోటాల కోసం వాహనం వస్తోంది.'
        : 'You have 2 new orders ready for pickup.';
      setActiveModal('orders');
    } else {
      reply = language === 'hi'
        ? 'टमाटर का मंडी भाव ₹34 है और दाम बढ़ने का अनुमान है। फसल 2 दिन रोक सकते हैं।'
        : language === 'te'
        ? 'టమోటా ధర ₹34 ఉంది. ధరలు పెరిగే అవకాశం ఉంది.'
        : 'Tomato rates are ₹34/kg with strong upward momentum.';
    }

    setAssistantReply(reply);
    speakText(reply, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 5. Preferred Language Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-emerald-800" />
          <span className="text-sm font-bold text-emerald-950">
            {language === 'hi' ? 'अपनी भाषा चुनें:' : language === 'te' ? 'భాషను ఎంచుకోండి:' : 'Preferred Language:'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="farmer-lang-en"
            onClick={() => onLanguageChange('en')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              language === 'en'
                ? 'bg-emerald-700 text-white shadow-md scale-105'
                : 'bg-white text-stone-700 hover:bg-emerald-100/60 border border-emerald-200'
            }`}
          >
            English
          </button>
          <button
            id="farmer-lang-hi"
            onClick={() => onLanguageChange('hi')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              language === 'hi'
                ? 'bg-emerald-700 text-white shadow-md scale-105'
                : 'bg-white text-stone-700 hover:bg-emerald-100/60 border border-emerald-200'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            id="farmer-lang-te"
            onClick={() => onLanguageChange('te')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              language === 'te'
                ? 'bg-emerald-700 text-white shadow-md scale-105'
                : 'bg-white text-stone-700 hover:bg-emerald-100/60 border border-emerald-200'
            }`}
          >
            తెలుగు (Telugu)
          </button>
        </div>
      </div>

      {/* 1. Welcome Section with Large Speaker Icon */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
            <Sprout className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>
          <div>
            {activeSection === 'voice_hub' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-300">
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>Farmer Voice Hub</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-display">
              {language === 'hi' ? 'फार्म2डोर एआई में आपका स्वागत है' : language === 'te' ? 'Farm2Door AI కి స్వాగతం' : 'Welcome to Farm2Door AI'}
            </h1>
            <p className="mt-1 text-base sm:text-lg text-emerald-800 font-medium">
              {language === 'hi'
                ? 'आवाज से चलने वाला डिजिटल कृषि बाज़ार'
                : language === 'te'
                ? 'రైతుల కోసం వాయిస్-ఆధారిత డిజిటల్ మార్కెట్'
                : 'Voice-First Digital Agricultural Marketplace for Farmers'}
            </p>
          </div>
        </div>

        {/* Large Speaker Button */}
        <button
          id="farmer-welcome-speaker-btn"
          onClick={handleSpeakWelcome}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title="Click to hear welcome message aloud"
          aria-label="Read welcome message aloud"
        >
          <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5">Listen</span>
        </button>
      </div>

      {/* 2. Functional Kisan Voice Assistant: Tap and Speak, Gemini AI integration, STT, and TTS */}
      <KisanVoiceAssistant
        language={language}
        onLanguageChange={onLanguageChange}
        onStartSpeech={onStartSpeech}
        onEndSpeech={onEndSpeech}
        activeSection={activeSection}
        onNavigate={(target: string) => {
          if (target === 'farmer_marketplace' && onNavigateToMarketplace) {
            onNavigateToMarketplace();
          } else if (target === 'farmer_market_intel' && onNavigateToMarketIntel) {
            onNavigateToMarketIntel();
          } else if (target === 'farmer_products' && onNavigateToProducts) {
            onNavigateToProducts();
          } else if (target === 'farmer_orders' && onNavigateToOrders) {
            onNavigateToOrders();
          } else if (target === 'farmer_logistics' && onNavigateToLogistics) {
            onNavigateToLogistics();
          } else if (target === 'farmer_home' && onNavigateToHome) {
            onNavigateToHome();
          }
        }}
      />

      {/* 3. Four Large Navigation Cards with Icons and Separate Speaker Buttons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
            {language === 'hi' ? 'मुख्य सुविधाएं' : language === 'te' ? 'ప్రధాన సేవలు' : 'Quick Navigation'}
          </h2>
          <span className="text-xs font-bold text-stone-500">
            {language === 'hi' ? 'सुनने के लिए 🔊 दबाएं' : language === 'te' ? 'వినడానికి 🔊 నొక్కండి' : 'Tap 🔊 to hear card'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: My Products */}
          <div
            id="farmer-nav-products"
            onClick={() => {
              if (onNavigateToProducts) {
                onNavigateToProducts();
              } else {
                setActiveModal('products');
              }
            }}
            className="group bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sprout className="w-9 h-9 stroke-[2.2]" />
              </div>
              
              {/* Separate Speaker Button */}
              <button
                id="speaker-card-products"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakCard('cardProducts');
                }}
                className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-amber-100 text-amber-700 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Hear My Products description"
                aria-label="Hear My Products description"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-2xl font-black text-stone-900 font-display">
                {FARMER_VOICE_STRINGS.cardProducts.title[language]}
              </h3>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                {language === 'hi' ? 'फसल सूची और नया उत्पाद जोड़ें' : language === 'te' ? 'పంట జాబితా మరియు కొత్తది జోడించండి' : 'Manage Crops, Inventory & Sell Produce'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{language === 'hi' ? 'उत्पाद प्रबंधन' : language === 'te' ? 'ఉత్పత్తుల నిర్వహణ' : 'Manage Products'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Market Prices */}
          <div
            id="farmer-nav-prices"
            onClick={() => setActiveModal('prices')}
            className="group bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-9 h-9 stroke-[2.2]" />
              </div>

              {/* Separate Speaker Button */}
              <button
                id="speaker-card-prices"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakCard('cardPrices');
                }}
                className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-amber-100 text-amber-700 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Hear Market Prices description"
                aria-label="Hear Market Prices description"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-2xl font-black text-stone-900 font-display">
                {FARMER_VOICE_STRINGS.cardPrices.title[language]}
              </h3>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                {language === 'hi' ? 'लाइव मंडी भाव और ट्रेंड' : language === 'te' ? 'నేటి లైవ్ మార్కెట్ రేట్లు' : 'Live Mandi Rates & Trends'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>{language === 'hi' ? 'रेट देखें' : language === 'te' ? 'ధరలు చూడండి' : 'Check Rates'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: My Orders */}
          <div
            id="farmer-nav-orders"
            onClick={() => {
              if (onNavigateToOrders) {
                onNavigateToOrders();
              } else {
                setActiveModal('orders');
              }
            }}
            className="group bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-9 h-9 stroke-[2.2]" />
              </div>

              {/* Separate Speaker Button */}
              <button
                id="speaker-card-orders"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakCard('cardOrders');
                }}
                className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-amber-100 text-amber-700 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Hear My Orders description"
                aria-label="Hear My Orders description"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-2xl font-black text-stone-900 font-display">
                {FARMER_VOICE_STRINGS.cardOrders.title[language]}
              </h3>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                {language === 'hi' ? 'ग्राहक आर्डर और थोक मांग' : language === 'te' ? 'కస్టమర్ ఆర్డర్లు & బల్క్ అభ్యర్థనలు' : 'Customer Orders, Bulk Quotes & Inquiries'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>{language === 'hi' ? 'आर्डर और मांग देखें' : language === 'te' ? 'ఆర్డర్లు నిర్వహించండి' : 'Manage Orders'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: My Earnings */}
          <div
            id="farmer-nav-earnings"
            onClick={() => setActiveModal('earnings')}
            className="group bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet className="w-9 h-9 stroke-[2.2]" />
              </div>

              {/* Separate Speaker Button */}
              <button
                id="speaker-card-earnings"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakCard('cardEarnings');
                }}
                className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-amber-100 text-amber-700 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Hear My Earnings description"
                aria-label="Hear My Earnings description"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-2xl font-black text-stone-900 font-display">
                {FARMER_VOICE_STRINGS.cardEarnings.title[language]}
              </h3>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                {language === 'hi' ? 'सीधे बैंक खाते में' : language === 'te' ? 'నేరుగా బ్యాంకు ఖాతాకు' : 'Direct Bank Payouts (DBT)'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>{language === 'hi' ? 'खाता देखें' : language === 'te' ? 'ఖాతా వివరాలు' : 'View Passbook'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* 3B. Smart Logistics & Route Optimization Card */}
      <div 
        id="farmer-logistics-banner"
        className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0 border border-white/10">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                Smart Logistics Module
              </span>
              <span className="text-[11px] text-stone-300">
                AI Route Recommendation & Multi-Stop Dispatch
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              {language === 'hi' 
                ? 'स्मार्ट रूट और डिलीवरी प्रबंधन' 
                : language === 'te' 
                ? 'స్మార్ట్ రూట్ & డెలివరీ నిర్వహణ' 
                : 'Smart Logistics & Route Optimization'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              {language === 'hi'
                ? 'डिलीवरी दूरी और परिवहन खर्च कम करने के लिए स्वचालित रूट अनुकूलन और निकटवर्ती ऑर्डर समूहीकरण।'
                : language === 'te'
                ? 'డెలివరీ దూరం మరియు రవాణా ఖర్చులను తగ్గించడానికి స్వయంచాలక రూట్ సిఫార్సు.'
                : 'Reduce delivery distance and transportation costs through nearest-neighbor delivery sequencing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <button
            onClick={() => {
              const text = language === 'hi'
                ? 'स्मार्ट लॉजिस्टिक्स और रूट अनुकूलन। डिलीवरी दूरी और परिवहन खर्च कम करने के लिए रूट देखें।'
                : language === 'te'
                ? 'స్మార్ట్ లాజిస్టిక్స్ మరియు రూట్ ఆప్టిమైజేషన్. డెలివరీ దూరం మరియు రవాణా ఖర్చులను తగ్గించండి.'
                : 'Smart logistics and route optimization. Plan delivery stops to reduce travel distance and costs.';
              speakText(text, language, onStartSpeech, onEndSpeech);
            }}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 flex items-center justify-center cursor-pointer transition-colors"
            title="Hear Smart Logistics description"
            aria-label="Hear Smart Logistics description"
          >
            <Volume2 className="w-6 h-6" />
          </button>

          <button
            id="open-logistics-from-dashboard-btn"
            onClick={() => {
              if (onNavigateToLogistics) {
                onNavigateToLogistics();
              }
            }}
            className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{language === 'hi' ? 'लॉजिस्टिक्स खोलें' : language === 'te' ? 'లాజిస్టిక్స్ చూడండి' : 'Open Smart Logistics'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. AI Market Insights Section with Speaker Buttons */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                {language === 'hi' ? 'एआई मंडी सुझाव (AI Market Insights)' : language === 'te' ? 'AI మార్కెట్ విశ్లేషణ (AI Insights)' : 'AI Market Insights'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'hi'
                ? 'टमाटर, प्याज और आलू की स्थिति और सुझाव'
                : language === 'te'
                ? 'టమోటా, ఉల్లిపాయ మరియు బంగాళాదుంప విశ్లేషణ'
                : 'Real-time price trend forecast and farmer recommendations'}
            </p>
          </div>

          <button
            onClick={onNavigateToMarketIntel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            <span>{language === 'hi' ? 'पूरा चार्ट देखें' : language === 'te' ? 'పూర్తి గ్రాఫ్ చూడండి' : 'Full Market Analytics'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Tomato Insight */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍅</span>
                  <span className="font-extrabold text-stone-900 text-lg">
                    {language === 'hi' ? 'टमाटर' : language === 'te' ? 'టమోటా' : 'Tomato'}
                  </span>
                </div>
                
                {/* Speaker Button */}
                <button
                  id="speaker-insight-tomato"
                  onClick={() => handleSpeakInsight('Tomato')}
                  className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Listen to Tomato insight"
                  aria-label="Listen to Tomato insight"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% Upward</span>
              </div>

              <p className="text-stone-700 text-sm leading-relaxed mb-3">
                &ldquo;{COMMODITY_PRICES[0].aiInsight[language]}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-bold text-stone-900">₹{COMMODITY_PRICES[0].modalPrice}/kg</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[11px]">
                {COMMODITY_PRICES[0].recommendation.action}
              </span>
            </div>
          </div>

          {/* Onion Insight */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧅</span>
                  <span className="font-extrabold text-stone-900 text-lg">
                    {language === 'hi' ? 'प्याज' : language === 'te' ? 'ఉల్లిపాయ' : 'Onion'}
                  </span>
                </div>
                
                {/* Speaker Button */}
                <button
                  id="speaker-insight-onion"
                  onClick={() => handleSpeakInsight('Onion')}
                  className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Listen to Onion insight"
                  aria-label="Listen to Onion insight"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md mb-2">
                <span>Steady Arrivals</span>
              </div>

              <p className="text-stone-700 text-sm leading-relaxed mb-3">
                &ldquo;{COMMODITY_PRICES[1].aiInsight[language]}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-bold text-stone-900">₹{COMMODITY_PRICES[1].modalPrice}/kg</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-[11px]">
                {COMMODITY_PRICES[1].recommendation.action}
              </span>
            </div>
          </div>

          {/* Potato Insight */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥔</span>
                  <span className="font-extrabold text-stone-900 text-lg">
                    {language === 'hi' ? 'आलू' : language === 'te' ? 'బంగాళాదుంప' : 'Potato'}
                  </span>
                </div>
                
                {/* Speaker Button */}
                <button
                  id="speaker-insight-potato"
                  onClick={() => handleSpeakInsight('Potato')}
                  className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Listen to Potato insight"
                  aria-label="Listen to Potato insight"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+6.5% Strong Demand</span>
              </div>

              <p className="text-stone-700 text-sm leading-relaxed mb-3">
                &ldquo;{COMMODITY_PRICES[2].aiInsight[language]}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-bold text-stone-900">₹{COMMODITY_PRICES[2].modalPrice}/kg</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-md text-[11px]">
                {COMMODITY_PRICES[2].recommendation.action}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- SUB-MODALS FOR THE 4 CARDS (High accessibility, Large Touch UI) --- */}

      {/* Modal 1: My Products */}
      {activeModal === 'products' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-600">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sprout className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900">
                    {FARMER_VOICE_STRINGS.cardProducts.title[language]}
                  </h3>
                  <p className="text-xs text-stone-500">Live Farm Inventory</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {farmerStock.map((item) => (
                <div key={item.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item?.icon || '🌱'}</span>
                    <div>
                      <div className="font-extrabold text-stone-900 text-base">
                        {language === 'te' ? item.te : item.name}
                      </div>
                      <div className="text-xs text-emerald-700 font-bold">
                        Mandi Rate: ₹{item.price}/kg
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustStock(item.id, -50)}
                      className="w-10 h-10 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold flex items-center justify-center cursor-pointer"
                      title="Reduce stock by 50kg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-20 text-center font-black text-stone-900 text-base">
                      {item.kg} kg
                    </span>
                    <button
                      onClick={() => handleAdjustStock(item.id, 50)}
                      className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center cursor-pointer"
                      title="Add 50kg harvested stock"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setActiveModal('none');
                  speakText('Stock updated successfully', language, onStartSpeech, onEndSpeech);
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base cursor-pointer shadow-sm"
              >
                Done / सब सही है
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Market Prices */}
      {activeModal === 'prices' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-blue-600">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900">
                    {FARMER_VOICE_STRINGS.cardPrices.title[language]}
                  </h3>
                  <p className="text-xs text-stone-500">Live APMC Mandi Rates (Today)</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {COMMODITY_PRICES.map((p) => (
                <div key={p.commodity} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-stone-900 text-lg">
                      {language === 'hi' ? p.hindiName : language === 'te' ? p.teluguName : p.commodity}
                    </div>
                    <div className="text-xs text-stone-500">{p.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-700">₹{p.modalPrice} / kg</div>
                    <div className="text-xs font-bold text-stone-600">Range: ₹{p.minPrice} - ₹{p.maxPrice}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setActiveModal('none');
                  onNavigateToMarketIntel();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base cursor-pointer shadow-sm text-center"
              >
                Open Full Historical Charts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: My Orders */}
      {activeModal === 'orders' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-600">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900">
                    {FARMER_VOICE_STRINGS.cardOrders.title[language]}
                  </h3>
                  <p className="text-xs text-stone-500">Confirmed Orders for Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      Pickup in 45 Mins
                    </span>
                    <h4 className="text-lg font-black text-stone-900 mt-1">450 kg Tomato (Grade A)</h4>
                    <p className="text-xs text-stone-600">Buyer: Fresh Basket Retail Co.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-700">₹15,300</div>
                    <div className="text-[11px] text-stone-500">₹34/kg</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="text-stone-600">Vehicle: KA-04-EV-2041 (Assigned)</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Ready to Load
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">
                      Scheduled Tomorrow
                    </span>
                    <h4 className="text-lg font-black text-stone-900 mt-1">200 kg Red Onion</h4>
                    <p className="text-xs text-stone-600">Buyer: Green Valley FPO Wholesale</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-700">₹5,600</div>
                    <div className="text-[11px] text-stone-500">₹28/kg</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 text-white font-bold text-base cursor-pointer"
              >
                Close / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: My Earnings */}
      {activeModal === 'earnings' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-600">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900">
                    {FARMER_VOICE_STRINGS.cardEarnings.title[language]}
                  </h3>
                  <p className="text-xs text-stone-500">Direct Bank Account Passbook</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total Direct Earnings This Month
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-800 font-display mt-2">
                ₹ 42,850
              </div>
              <p className="text-xs text-stone-600 mt-2">
                &bull; 100% Direct to SBI A/c No. ending in **4819 &bull; Zero commission deducted
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 text-xs font-semibold">
                <span>Yesterday &bull; Tomato Dispatch (450 kg)</span>
                <span className="font-bold text-emerald-700">+₹15,300 (Credited)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 text-xs font-semibold">
                <span>Sep 5 &bull; Onion Bulk Lot (800 kg)</span>
                <span className="font-bold text-emerald-700">+₹22,400 (Credited)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 text-xs font-semibold">
                <span>Sep 2 &bull; Potato Batch (250 kg)</span>
                <span className="font-bold text-emerald-700">+₹5,150 (Credited)</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-base cursor-pointer"
              >
                Close / ठीक है
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
