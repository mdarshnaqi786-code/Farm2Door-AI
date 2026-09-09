import { LanguageCode } from '../types';

export interface TranslationDict {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

export const TRANSLATIONS: TranslationDict = {
  // Navigation
  'nav.home': {
    en: 'Home',
    hi: 'होम (Home)',
    te: 'హోమ్',
  },
  'nav.myProducts': {
    en: 'My Products',
    hi: 'मेरी फसलें',
    te: 'నా ఉత్పత్తులు',
  },
  'nav.orders': {
    en: 'Orders & Requests',
    hi: 'आर्डर और अनुरोध',
    te: 'ఆర్డర్లు & విజ్ఞప్తులు',
  },
  'nav.voiceHub': {
    en: 'Voice Hub',
    hi: 'वॉइस हब',
    te: 'వాయిస్ హబ్',
  },
  'nav.marketIntel': {
    en: 'Market Intel',
    hi: 'मंडी भाव',
    te: 'మార్కెట్ సమాచారం',
  },
  'nav.logistics': {
    en: 'Logistics',
    hi: 'लॉजिस्टिक्स',
    te: 'లాజిస్టిక్స్',
  },
  'nav.marketplace': {
    en: 'Marketplace',
    hi: 'कृषि बाज़ार',
    te: 'మార్కెట్‌ప్లేస్',
  },
  'nav.farmMarketplace': {
    en: 'Farm Marketplace',
    hi: 'थोक कृषि बाज़ार',
    te: 'రైతు మార్కెట్‌ప్లేస్',
  },
  'nav.myOrders': {
    en: 'My Orders',
    hi: 'मेरे आर्डर',
    te: 'నా ఆర్డర్లు',
  },
  'nav.bulkSourcing': {
    en: 'Bulk Sourcing',
    hi: 'थोक खरीद',
    te: 'బల్క్ సోర్సింగ్',
  },
  'nav.profile': {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    te: 'ప్రొఫైల్',
  },
  'nav.logout': {
    en: 'Logout',
    hi: 'लॉगआउट',
    te: 'లాగ్ అవుట్',
  },
  'nav.cart': {
    en: 'Cart',
    hi: 'कार्ट',
    te: 'కార్ట్',
  },
  'nav.language': {
    en: 'Language',
    hi: 'भाषा',
    te: 'భాష',
  },

  // Voice Hub Status & Actions
  'voice.hubTitle': {
    en: 'Farmer Voice Hub',
    hi: 'किसान आवाज केंद्र (Voice Hub)',
    te: 'రైతు వాయిస్ హబ్ (Voice Hub)',
  },
  'voice.hubSubtitle': {
    en: 'Voice-First AI Assistant for Mandi Rates, Crop Selling, Orders, & Navigation in Telugu, Hindi & English.',
    hi: 'तेलुगु, हिन्दी और अंग्रेजी में मंडी भाव, फसल बिक्री, आर्डर और नेविगेशन के लिए किसान AI सहायक।',
    te: 'తెలుగు, హిందీ మరియు ఆంగ్లంలో మార్కెట్ ధరలు, పంట అమ్మకం, ఆర్డర్లు మరియు నావిగేషన్ కోసం AI వాయిస్ సహాయకుడు.',
  },
  'voice.statusIdle': {
    en: 'Ready — Tap microphone or pick an example question',
    hi: 'तैयार — माइक दबाएं या उदाहरण सवाल चुनें',
    te: 'సిద్ధంగా ఉంది — మైక్ నొక్కండి లేదా ప్రశ్నను ఎంచుకోండి',
  },
  'voice.statusListening': {
    en: 'Listening to your voice...',
    hi: 'आपकी आवाज सुन रहे हैं...',
    te: 'మీ స్వరాన్ని వింటున్నాము...',
  },
  'voice.statusProcessing': {
    en: 'AI is generating answer in your language...',
    hi: 'AI आपकी भाषा में उत्तर तैयार कर रहा है...',
    te: 'AI మీ భాషలో సమాధానాన్ని రూపొందిస్తోంది...',
  },
  'voice.statusAnswerReady': {
    en: 'Answer ready — tap speaker to listen',
    hi: 'उत्तर तैयार है — सुनने के लिए स्पीकर दबाएं',
    te: 'సమాధానం సిద్ధం — వినడానికి స్పీకర్ నొక్కండి',
  },
  'voice.statusSpeaking': {
    en: 'Reading answer aloud...',
    hi: 'उत्तर बोलकर सुनाया जा रहा है...',
    te: 'సమాధానం వినిపిస్తున్నాము...',
  },
  'voice.statusError': {
    en: 'Voice input error — please try typing or use Demo Mode',
    hi: 'आवाज इनपुट त्रुटि — कृपया लिखकर पूछें या डेमो मोड उपयोग करें',
    te: 'వాయిస్ లోపం — దయచేసి టైప్ చేయండి లేదా డెమో మోడ్ ఉపయోగించండి',
  },
  'voice.tapToSpeak': {
    en: 'Tap to Speak',
    hi: 'बोलने के लिए दबाएं',
    te: 'మాట్లాడటానికి నొక్కండి',
  },
  'voice.stopListening': {
    en: 'Stop Listening',
    hi: 'सुनना बंद करें',
    te: 'వినడం ఆపండి',
  },
  'voice.listenAloud': {
    en: 'Hear Answer',
    hi: 'जवाब सुनें',
    te: 'సమాధానం వినండి',
  },
  'voice.stopAudio': {
    en: 'Stop Audio',
    hi: 'आवाज रोकें',
    te: 'ఆడియో ఆపండి',
  },
  'voice.typeManually': {
    en: 'Type question manually',
    hi: 'सवाल लिखकर पूछें',
    te: 'ప్రశ్నను టైప్ చేయండి',
  },
  'voice.askAi': {
    en: 'Ask AI',
    hi: 'पूछें',
    te: 'అడగండి',
  },
  'voice.clearHistory': {
    en: 'Clear History',
    hi: 'इतिहास मिटाएं',
    te: 'చరిత్రను క్లియర్ చేయండి',
  },
  'voice.demoMode': {
    en: 'Voice Demo Mode',
    hi: 'वॉइस डेमो मोड',
    te: 'వాయిస్ డెమో మోడ్',
  },
  'voice.demoModeDesc': {
    en: 'Simulates live spoken interaction for SIH presentations when microphone is unavailable in browser.',
    hi: 'ब्राउज़र में माइक उपलब्ध न होने पर भी प्रस्तुति के लिए इंटरैक्टिव वॉइस सिमुलेशन।',
    te: 'మైక్రోఫోన్ అందుబాటులో లేనప్పుడు ప్రదర్శన కోసం ఇంటరాక్టివ్ వాయిస్ సిమ్యులేషన్.',
  },
  'voice.navCommandsHint': {
    en: 'Voice Navigation: Say "Open marketplace", "Open logistics", "Open orders", "Open my products", "Open market intelligence", or "Go to home".',
    hi: 'वॉइस नेविगेशन: बोलें "बाज़ार खोलो", "लॉजिस्टिक्स खोलो", "मेरे आर्डर खोलो", "मेरी फसलें खोलो", "मंडी भाव खोलो", या "होम पर जाओ"।',
    te: 'వాయిస్ నావిగేషన్: "మార్కెట్ తెరవండి", "లాజిస్టిక్స్", "ఆర్డర్లు", "నా ఉత్పత్తులు", "మార్కెట్ సమాచారం", లేదా "హోమ్" అని మాట్లాడండి.',
  },

  // Common Buttons
  'btn.listen': {
    en: 'Listen',
    hi: 'सुनें',
    te: 'వినండి',
  },
  'btn.save': {
    en: 'Save',
    hi: 'सुरक्षित करें',
    te: 'భద్రపరచు',
  },
  'btn.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    te: 'రద్దు చేయి',
  },
  'btn.addToCart': {
    en: 'Add to Cart',
    hi: 'कार्ट में जोड़ें',
    te: 'కార్ట్‌కు జోడించు',
  },
  'btn.buyNow': {
    en: 'Buy Now',
    hi: 'अभी खरीदें',
    te: 'ఇప్పుడే కొనండి',
  },
  'btn.checkout': {
    en: 'Proceed to Checkout',
    hi: 'चेकआउट करें',
    te: 'చెక్‌అవుట్ చేయండి',
  },
  'btn.addProduct': {
    en: 'Add Harvest Listing',
    hi: 'नई फसल जोड़ें',
    te: 'కొత్త పంట నమోదు',
  },
  'btn.viewDetails': {
    en: 'View Details',
    hi: 'विवरण देखें',
    te: 'వివరాలు చూడండి',
  },
  'btn.requestQuote': {
    en: 'Request Bulk Quote',
    hi: 'थोक भाव मांगें',
    te: 'బల్క్ కోట్ అడగండి',
  },
  'btn.filter': {
    en: 'Filter',
    hi: 'फ़िल्टर',
    te: 'ఫిల్టర్',
  },
  'btn.refresh': {
    en: 'Refresh',
    hi: 'ताज़ा करें',
    te: 'తాజాకరించు',
  },
  'btn.close': {
    en: 'Close',
    hi: 'बंद करें',
    te: 'మూసివేయి',
  },

  // Dashboard Headings
  'farmer.welcomeTitle': {
    en: 'Welcome to Farm2Door AI',
    hi: 'फार्म2डोर एआई में आपका स्वागत है',
    te: 'Farm2Door AI కి స్వాగతం',
  },
  'farmer.welcomeSubtitle': {
    en: 'Voice-First Digital Agricultural Marketplace for Indian Farmers',
    hi: 'भारतीय किसानों के लिए आवाज-संचालित डिजिटल कृषि बाज़ार',
    te: 'భారతీయ రైతుల కోసం వాయిస్-ఆధారిత డిజిటల్ వ్యవసాయ మార్కెట్',
  },
  'farmer.preferredLanguage': {
    en: 'Preferred Language:',
    hi: 'अपनी भाषा चुनें:',
    te: 'భాషను ఎంచుకోండి:',
  },
  'farmer.quickNavigation': {
    en: 'Quick Navigation',
    hi: 'मुख्य सुविधाएं',
    te: 'ప్రధాన సేవలు',
  },
  'farmer.tapToHear': {
    en: 'Tap 🔊 to hear card',
    hi: 'सुनने के लिए 🔊 दबाएं',
    te: 'వినడానికి 🔊 నొక్కండి',
  },
  'farmer.aiMarketInsights': {
    en: 'AI Mandi Market Insights',
    hi: 'एआई मंडी सुझाव (AI Market Insights)',
    te: 'AI మార్కెట్ విశ్లేషణ (AI Insights)',
  },
  'farmer.fullAnalytics': {
    en: 'Full Market Analytics',
    hi: 'पूरा चार्ट देखें',
    te: 'పూర్తి గ్రాఫ్ చూడండి',
  },
  'farmer.myInventory': {
    en: 'My Current Harvest Stock',
    hi: 'मेरी वर्तमान फसल स्टॉक',
    te: 'నా ప్రస్తుత పంట నిల్వ',
  },
  'farmer.recentOrders': {
    en: 'Recent Direct Orders',
    hi: 'हालिया सीधे खरीद आर्डर',
    te: 'ఇటీవలి ప్రత్యక్ష ఆర్డర్లు',
  },
  'farmer.logisticsDispatch': {
    en: 'Smart Logistics Dispatch',
    hi: 'स्मार्ट लॉजिस्टिक्स डिस्पैच',
    te: 'స్మార్ట్ లాజిస్టిక్స్ డిస్పాచ్',
  },

  // Marketplace & Product
  'marketplace.title': {
    en: 'Farm Fresh Direct Marketplace',
    hi: 'खेत से सीधा ताजा कृषि बाज़ार',
    te: 'తోట నుండి నేరుగా వ్యవసాయ మార్కెట్‌ప్లేస్',
  },
  'marketplace.subtitle': {
    en: '100% Cultivator Direct • Zero Middlemen • Fair Price Guarantee',
    hi: '100% किसान से सीधा • बिचौलियों का कमीशन शून्य • उचित दाम गारंटी',
    te: '100% రైతు నుండి నేరుగా • దళారుల కమీషన్ సున్నా • సరసమైన ధర హామీ',
  },
  'marketplace.searchPlaceholder': {
    en: 'Search crop, variety, farmer or region...',
    hi: 'फसल, किस्म, किसान या क्षेत्र खोजें...',
    te: 'పంట, రకం, రైతు లేదా ప్రాంతాన్ని వెతకండి...',
  },
  'marketplace.allCategories': {
    en: 'All Categories',
    hi: 'सभी श्रेणियां',
    te: 'అన్ని విభాగాలు',
  },
  'product.pricePerKg': {
    en: 'Price per kg',
    hi: 'भाव प्रति किलो',
    te: 'కేజీ ధర',
  },
  'product.available': {
    en: 'Available Stock',
    hi: 'उपलब्ध स्टॉक',
    te: 'లభ్యత నిల్వ',
  },
  'product.minOrder': {
    en: 'Min Order',
    hi: 'न्यूनतम आर्डर',
    te: 'కనిష్ట ఆర్డర్',
  },
  'product.farmerShare': {
    en: 'Farmer Direct Payout',
    hi: 'किसान को शुद्ध भुगतान',
    te: 'రైతుకు చేరే చెల్లింపు',
  },
  'product.harvestDate': {
    en: 'Harvest Date',
    hi: 'फसल कटाई समय',
    te: 'పంట కోత సమయం',
  },
  'product.cultivator': {
    en: 'Cultivator',
    hi: 'किसान',
    te: 'రైతు',
  },

  // Orders
  'orders.title': {
    en: 'My Orders & Purchase Records',
    hi: 'मेरे आर्डर और खरीद रिकॉर्ड',
    te: 'నా ఆర్డర్లు మరియు కొనుగోలు రికార్డులు',
  },
  'orders.orderId': {
    en: 'Order ID',
    hi: 'आर्डर नंबर',
    te: 'ఆర్డర్ ఐడి',
  },
  'orders.date': {
    en: 'Date',
    hi: 'दिनांक',
    te: 'తేదీ',
  },
  'orders.status': {
    en: 'Status',
    hi: 'स्थिति',
    te: 'స్థితి',
  },
  'orders.total': {
    en: 'Total Amount',
    hi: 'कुल राशि',
    te: 'మొత్తం మొత్తం',
  },
  'orders.statusPending': {
    en: 'Pending',
    hi: 'लंबित',
    te: 'పెండింగ్',
  },
  'orders.statusAccepted': {
    en: 'Accepted',
    hi: 'स्वीकृत',
    te: 'ఆమోదించబడింది',
  },
  'orders.statusReady': {
    en: 'Ready for Delivery',
    hi: 'डिलीवरी के लिए तैयार',
    te: 'డెలివరీకి సిద్ధం',
  },
  'orders.statusTransit': {
    en: 'In Transit',
    hi: 'रास्ते में',
    te: 'రవాణాలో ఉంది',
  },
  'orders.statusDelivered': {
    en: 'Delivered',
    hi: 'डिलीवर हो गया',
    te: 'డెలివరీ పూర్తయింది',
  },

  // Cart
  'cart.title': {
    en: 'Your Farm Cart',
    hi: 'आपकी फार्म कार्ट',
    te: 'మీ ఫార్మ్ కార్ట్',
  },
  'cart.empty': {
    en: 'Your cart is currently empty',
    hi: 'आपकी कार्ट खाली है',
    te: 'మీ కార్ట్ ప్రస్తుతం ఖాళీగా ఉంది',
  },
  'cart.subtotal': {
    en: 'Produce Subtotal',
    hi: 'उप-योग',
    te: 'ఉప-మొత్తం',
  },
  'cart.logistics': {
    en: 'Farm-Gate Logistics',
    hi: 'खेत से डिलीवरी',
    te: 'తోట వద్ద రవాణా',
  },
  'cart.total': {
    en: 'Total Amount',
    hi: 'कुल देय राशि',
    te: 'మొత్తం చెల్లించవలసినది',
  },
  'cart.fairShareNotice': {
    en: '80% of this purchase goes directly to the cultivator without commission deductions.',
    hi: 'इस खरीद का 80% सीधे किसान के बैंक खाते में बिना किसी कमीशन के जमा होता है।',
    te: 'ఈ కొనుగోలులో 80% నేరుగా రైతు ఖాతాకు చేరుతుంది, ఎటువంటి దళారీ కమీషన్ ఉండదు.',
  },

  // Role Selection & Auth
  'auth.welcome': {
    en: 'Welcome to Farm2Door AI',
    hi: 'फार्म2डोर एआई में आपका स्वागत है',
    te: 'Farm2Door AI కి స్వాగతం',
  },
  'auth.chooseRole': {
    en: 'Select your role to enter the marketplace',
    hi: 'कृषि बाज़ार में प्रवेश करने के लिए अपनी भूमिका चुनें',
    te: 'మార్కెట్‌లోకి ప్రవేశించడానికి మీ పాత్రను ఎంచుకోండి',
  },
  'auth.farmerRole': {
    en: 'Farmer / FPO',
    hi: 'किसान / एफपीओ',
    te: 'రైతు / FPO',
  },
  'auth.consumerRole': {
    en: 'Direct Consumer',
    hi: 'सीधे उपभोक्ता',
    te: 'వినియోగదారుడు',
  },
  'auth.bulkBuyerRole': {
    en: 'Bulk Buyer / Wholesaler',
    hi: 'थोक खरीदार / व्यापारी',
    te: 'బల్క్ కొనుగోలుదారు / వ్యాపారి',
  },
  'auth.signIn': {
    en: 'Sign In',
    hi: 'साइन इन करें',
    te: 'సైన్ ఇన్',
  },
  'auth.signUp': {
    en: 'Create Account',
    hi: 'खाता बनाएं',
    te: 'ఖాతాను సృష్టించండి',
  },
  'auth.fullName': {
    en: 'Full Name',
    hi: 'पूरा नाम',
    te: 'పూర్తి పేరు',
  },
  'auth.phone': {
    en: 'Phone Number',
    hi: 'फ़ोन नंबर',
    te: 'ఫోన్ నంబర్',
  },

  // Profile Modal
  'profile.title': {
    en: 'Farmer / User Profile',
    hi: 'उपयोगकर्ता प्रोफ़ाइल',
    te: 'యూజర్ ప్రొఫైల్',
  },
  'profile.role': {
    en: 'Account Role',
    hi: 'खाता प्रकार',
    te: 'ఖాతా పాత్ర',
  },
  'profile.language': {
    en: 'Active Application Language',
    hi: 'सक्रिय ऐप भाषा',
    te: 'యాప్ ప్రదర్శన భాష',
  },
};

/**
 * Universal translation helper
 */
export function getTranslation(key: string, lang: LanguageCode = 'en'): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  const validLang = (lang === 'hi' || lang === 'te') ? lang : 'en';
  return item[validLang] || item.en || key;
}

export const t = getTranslation;
