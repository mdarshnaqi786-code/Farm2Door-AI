import { LanguageCode } from '../types';

// Speech synthesis helper
let currentUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let hasLoggedVoices = false;

const logVoicesOnce = (voices: SpeechSynthesisVoice[]) => {
  if (!hasLoggedVoices && voices.length > 0) {
    hasLoggedVoices = true;
    console.log(
      'Available SpeechSynthesis voices on this system:',
      voices.map((v) => `${v.name} (${v.lang})`)
    );
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  logVoicesOnce(cachedVoices);
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    logVoicesOnce(cachedVoices);
  };
}

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
    logVoicesOnce(cachedVoices);
    return cachedVoices;
  }
  return [];
};

export const speakText = (
  text: string,
  lang: LanguageCode = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    // ignore
  }

  const cleanText = text.replace(/[*#_`~]/g, '').trim();
  if (!cleanText) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Set language tag
  const langMap: Record<string, string> = {
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
    or: 'or-IN',
    en: 'en-IN',
  };

  // Smart script-based language override to guarantee Telugu script is spoken with te-IN
  let effectiveLang = lang;
  if (/[\u0C00-\u0C7F]/.test(cleanText)) {
    effectiveLang = 'te';
  } else if (/[\u0900-\u097F]/.test(cleanText)) {
    effectiveLang = 'hi';
  }

  const targetBcp47 = langMap[effectiveLang] || (effectiveLang.includes('-') ? effectiveLang : 'en-IN');
  utterance.lang = targetBcp47;

  // Find suitable voice if available
  const voices = getAvailableVoices();
  let matchedVoice: SpeechSynthesisVoice | null = null;

  if (voices.length > 0) {
    if (effectiveLang === 'te' || targetBcp47 === 'te-IN') {
      matchedVoice = voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        const n = v.name.toLowerCase();
        return l === 'te-in' || l.startsWith('te') || n.includes('telugu') || n.includes('te-in');
      }) || null;
    } else if (effectiveLang === 'hi' || targetBcp47 === 'hi-IN') {
      matchedVoice = voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        const n = v.name.toLowerCase();
        return l === 'hi-in' || l.startsWith('hi') || n.includes('hindi') || n.includes('hi-in');
      }) || null;
    } else if (effectiveLang === 'en' || targetBcp47 === 'en-IN') {
      matchedVoice = voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        const n = v.name.toLowerCase();
        return l === 'en-in' || n.includes('india') || n.includes('en-in');
      }) || null;

      if (!matchedVoice) {
        console.warn(
          'Indian English voice (en-IN) is not installed on this browser/device. Falling back to default English voice.'
        );
      }
    }

    if (!matchedVoice) {
      matchedVoice = voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === targetBcp47.toLowerCase() || l.startsWith(effectiveLang.toLowerCase());
      }) || null;
    }
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.rate = 0.95; // slightly slower for better clarity for rural users
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech error:', e);
    currentUtterance = null;
    onError?.();
    onEnd?.();
  };

  // Safe invocation
  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('speechSynthesis.speak failed:', e);
      onEnd?.();
    }
  }, 10);
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

// Common translations for Farmer voice assistance
export const FARMER_VOICE_STRINGS = {
  welcome: {
    en: 'Welcome to Farm2Door AI. Tap any button with a speaker to hear information aloud, or tap the microphone to talk.',
    hi: 'फार्म2डोर एआई में आपका स्वागत है। जानकारी सुनने के लिए स्पीकर बटन दबाएं, या बोलने के लिए माइक बटन दबाएं।',
    te: 'ఫార్మ్2డోర్ AI కి స్వాగతం. సమాచారం వినడానికి స్పీకర్ బటన్‌ను నొక్కండి లేదా మాట్లాడటానికి మైక్రోఫోన్‌ను నొక్కండి.',
  },
  tapToSpeak: {
    en: 'Listening. Please say what you want to check, like market prices, tomato rates, or my orders.',
    hi: 'सुन रहे हैं। कृपया बताएं आप क्या जानना चाहते हैं, जैसे मंडी भाव, टमाटर का रेट, या मेरे आर्डर।',
    te: 'వింటున్నాము. మార్కెట్ ధరలు, టమోటా రేటు లేదా ఆర్డర్ల గురించి మాట్లాడండి.',
  },
  cardProducts: {
    title: {
      en: 'My Products',
      hi: 'मेरी फसलें',
      te: 'నా ఉత్పత్తులు',
    },
    speech: {
      en: 'My Products. Check your listed vegetables, tomato, onion, and potato harvest stock.',
      hi: 'मेरी फसलें। यहां अपनी ताजी सब्जियां, टमाटर, प्याज और आलू का स्टॉक देखें।',
      te: 'నా ఉత్పత్తులు. మీ టమోటా, ఉల్లిపాయ, మరియు బంగాళాదుంప పంట వివరాలు చూడండి.',
    },
  },
  cardPrices: {
    title: {
      en: 'Market Prices',
      hi: 'मंडी भाव',
      te: 'మార్కెట్ ధరలు',
    },
    speech: {
      en: 'Market Prices. Check today\'s live prices for tomato, onion, and potato in major mandis.',
      hi: 'मंडी भाव। आज का ताजा मंडी भाव देखें। टमाटर, प्याज और आलू के ताजा रेट।',
      te: 'మార్కెట్ ధరలు. నేటి టమోటా, ఉల్లిపాయ మరియు బంగాళాదుంప లైవ్ మార్కెట్ ధరలు చూడండి.',
    },
  },
  cardOrders: {
    title: {
      en: 'My Orders',
      hi: 'मेरे आर्डर',
      te: 'నా ఆర్డర్లు',
    },
    speech: {
      en: 'My Orders. View direct consumer and bulk buyer purchase orders ready for dispatch.',
      hi: 'मेरे आर्डर। ग्राहकों और व्यापारियों से आए सीधे खरीद आर्डर यहां देखें।',
      te: 'నా ఆర్డర్లు. వినియోగదారులు మరియు వ్యాపారుల నుండి వచ్చిన ఆర్డర్లు చూడండి.',
    },
  },
  cardEarnings: {
    title: {
      en: 'My Earnings',
      hi: 'मेरी कमाई',
      te: 'నా సంపాదన',
    },
    speech: {
      en: 'My Earnings. View your total sales money transferred directly into your bank account without middleman cuts.',
      hi: 'मेरी कमाई। बिचौलियों के बिना सीधे आपके बैंक खाते में जमा हुई कुल राशि देखें।',
      te: 'నా సంపాదన. దళారుల ప్రమేయం లేకుండా నేరుగా మీ బ్యాంకు ఖాతాకు చేరిన ఆదాయం చూడండి.',
    },
  },
};

export const speakRoleDescription = (
  roleName: string,
  description: string,
  lang: string = 'en',
  onStart?: () => void,
  onEnd?: () => void
) => {
  const speechText = `${roleName}. ${description}`;
  speakText(speechText, lang, onStart, onEnd);
};

export const speakLanguagePronunciation = (
  nativeName: string,
  englishName: string,
  langCode: string,
  onStart?: () => void,
  onEnd?: () => void
) => {
  // Speaks native language name followed by English name
  const speechText = `${nativeName}. ${englishName}.`;
  speakText(speechText, langCode, onStart, onEnd);
};
