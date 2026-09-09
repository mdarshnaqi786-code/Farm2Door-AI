import { LanguageCode } from '../types';

/**
 * Robust multilingual language detection for Indian agricultural voice assistance.
 * Supports:
 * - Telugu ('te')
 * - Hindi ('hi')
 * - English ('en')
 * 
 * Language Priority Rules:
 * 1. Detect the language spoken/written in the current question.
 * 2. Respond in that same language.
 * 3. If language detection fails, respond using the user's preferred language.
 */

// Telugu Unicode Script Range: \u0C00 - \u0C7F
export const TELUGU_UNICODE_REGEX = /[\u0C00-\u0C7F]/;
// Devanagari (Hindi) Unicode Script Range: \u0900 - \u097F
export const DEVANAGARI_UNICODE_REGEX = /[\u0900-\u097F]/;

// Common Telugu transliterated and script keywords
const TELUGU_KEYWORDS = [
  'eeroju', 'eroju', 'tamata', 'tamato', 'tomato', 'dhara', 'dharalu', 'enta', 'enti', 'entha',
  'ekkada', 'ammali', 'ammukovali', 'panta', 'raithu', 'rythu', 'bhavamu', 'bhavam',
  'undhi', 'unnadi', 'unnayi', 'marketlo', 'mandilo', 'kisan', 'namaskaram',
  'telugu', 'naa', 'meeru', 'kavale', 'kavali', 'cheppandi', 'ivvandi',
  'ullipaya', 'ulli', 'bangaladumpa', 'aloogadda', 'mirchi', 'manchi',
  'labham', 'dharan', 'kharcheelu', 'rate-lu', 'market', 'rate'
];

// Common Hindi transliterated and script keywords
const HINDI_KEYWORDS = [
  'aaj', 'tamatar', 'bhav', 'daam', 'kaha', 'kahan', 'kahaa', 'kya', 'hai', 'hain',
  'bechna', 'beche', 'kitna', 'kitne', 'mandi', 'kisan', 'kripya', 'namaste',
  'bataiye', 'batao', 'pyaj', 'pyaaz', 'aloo', 'fasal', 'meri', 'mera', 'kaise',
  'accha', 'achha', 'sabzi', 'mandi', 'dam'
];

// Common English agricultural keywords
const ENGLISH_KEYWORDS = [
  'what', 'where', 'how', 'price', 'rate', 'rates', 'sell', 'today', 'market',
  'crop', 'crops', 'cost', 'best', 'earnings',
  'highest', 'good', 'farmer', 'agriculture', 'produce', 'order'
];

/**
 * Gets the stored preferred language selected by the user during registration
 */
export const getStoredUserPreferredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return 'en';

  try {
    const regLang = localStorage.getItem('farm2door_registered_preferred_language');
    if (regLang && (regLang === 'te' || regLang === 'hi' || regLang === 'en')) {
      return regLang;
    }

    const prefLang = localStorage.getItem('farm2door_preferred_language');
    if (prefLang && (prefLang === 'te' || prefLang === 'hi' || prefLang === 'en')) {
      return prefLang;
    }

    const sessionStr = localStorage.getItem('farm2door_user_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.language && (session.language === 'te' || session.language === 'hi' || session.language === 'en')) {
        return session.language;
      }
    }
  } catch (e) {
    console.warn('Could not read preferred language from localStorage:', e);
  }

  return 'en';
};

/**
 * Detects the language of a given text.
 * Priority:
 * 1. Script/Unicode detection (100% reliable for Telugu and Devanagari)
 * 2. Transliterated/Romanized keywords
 * 3. Fallback to provided fallbackLang or stored user preferred language
 */
export const detectLanguage = (
  text: string,
  fallbackLang?: LanguageCode
): 'te' | 'hi' | 'en' => {
  if (!text || typeof text !== 'string') {
    const effectiveFallback = fallbackLang || getStoredUserPreferredLanguage();
    return (effectiveFallback === 'te' || effectiveFallback === 'hi') ? effectiveFallback : 'en';
  }

  const trimmed = text.trim();
  if (!trimmed) {
    const effectiveFallback = fallbackLang || getStoredUserPreferredLanguage();
    return (effectiveFallback === 'te' || effectiveFallback === 'hi') ? effectiveFallback : 'en';
  }

  // 1. Script-level detection: ANY Telugu character means Telugu
  const teluguChars = (trimmed.match(/[\u0C00-\u0C7F]/g) || []).length;
  const devanagariChars = (trimmed.match(/[\u0900-\u097F]/g) || []).length;

  if (teluguChars > 0 && teluguChars >= devanagariChars) {
    return 'te';
  }
  if (devanagariChars > 0) {
    return 'hi';
  }

  // 2. If caller explicitly specifies Telugu or Hindi as the current voice/input language
  if (fallbackLang === 'te' && devanagariChars === 0) {
    // If the active input context is Telugu, maintain Telugu unless pure English inquiry
    const hasTeluguKeyword = TELUGU_KEYWORDS.some(w => trimmed.toLowerCase().includes(w));
    if (hasTeluguKeyword) return 'te';
  }

  if (fallbackLang === 'hi' && teluguChars === 0) {
    const hasHindiKeyword = HINDI_KEYWORDS.some(w => trimmed.toLowerCase().includes(w));
    if (hasHindiKeyword) return 'hi';
  }

  // 3. Transliterated keyword matching
  const lower = trimmed.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/);

  let teluguScore = 0;
  let hindiScore = 0;
  let englishScore = 0;

  for (const word of words) {
    if (!word) continue;
    if (TELUGU_KEYWORDS.includes(word)) teluguScore += 3;
    if (HINDI_KEYWORDS.includes(word)) hindiScore += 3;
    if (ENGLISH_KEYWORDS.includes(word)) englishScore += 1;
  }

  if (teluguScore > 0 && teluguScore >= hindiScore && teluguScore >= englishScore) {
    return 'te';
  }
  if (hindiScore > 0 && hindiScore > englishScore) {
    return 'hi';
  }
  if (englishScore > 0 && !fallbackLang) {
    return 'en';
  }

  // 4. Fallback to caller's language or user preferred language
  const resolvedFallback = fallbackLang || getStoredUserPreferredLanguage();
  if (resolvedFallback === 'te' || resolvedFallback === 'hi') {
    return resolvedFallback;
  }

  return 'en';
};

/**
 * Returns the exact locale tag for Web Speech Recognition API
 * For Telugu: 'te-IN'
 * For Hindi: 'hi-IN'
 * For English: 'en-IN'
 */
export const getSpeechRecognitionLocale = (lang: string): string => {
  switch (lang) {
    case 'te':
      return 'te-IN';
    case 'hi':
      return 'hi-IN';
    case 'ta':
      return 'ta-IN';
    case 'kn':
      return 'kn-IN';
    case 'mr':
      return 'mr-IN';
    case 'bn':
      return 'bn-IN';
    case 'gu':
      return 'gu-IN';
    case 'pa':
      return 'pa-IN';
    case 'ur':
      return 'ur-IN';
    default:
      return 'en-IN';
  }
};
