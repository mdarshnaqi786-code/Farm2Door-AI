import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sprout, 
  ShoppingBag, 
  Building2, 
  Volume2, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  Check, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { UserRole, UserAccount, SupportedLanguage } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import { speakText, speakLanguagePronunciation } from '../utils/speech';

interface RoleAuthPageProps {
  role: UserRole;
  onBackToRoleSelection: () => void;
  onAuthSuccess: (account: UserAccount) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const RoleAuthPage: React.FC<RoleAuthPageProps> = ({
  role,
  onBackToRoleSelection,
  onAuthSuccess,
  onStartSpeech,
  onEndSpeech,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLanguage, setSignupLanguage] = useState<string>(role === 'farmer' ? 'hi' : 'en');
  
  // Validation / Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Role metadata
  const roleConfig = {
    farmer: {
      title: 'Farmer / FPO',
      subtitle: 'किसान / రైతు / உழவர் लॉगिन',
      icon: '👨‍🌾',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accentColor: 'emerald',
      demoName: 'Ramesh Patil',
      demoContact: '+91 98765 43210',
      demoFPO: 'Sahyadri Kisan Producer Co.',
      voicePrompt: 'Farmer login page. Please enter your mobile number and password, or create a new account to start selling directly.',
    },
    consumer: {
      title: 'Customer',
      subtitle: 'Fresh Farm Produce Direct',
      icon: '🛒',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      btnBg: 'bg-stone-900 hover:bg-stone-800 text-white',
      accentColor: 'amber',
      demoName: 'Priya Sharma',
      demoContact: 'priya.sharma@example.com',
      demoFPO: '',
      voicePrompt: 'Customer login page. Please enter your mobile number or email and password to shop fresh produce directly from farmers.',
    },
    bulk_buyer: {
      title: 'Bulk Buyer',
      subtitle: 'Hotels, Processors & Exporters',
      icon: '🏢',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      btnBg: 'bg-teal-800 hover:bg-teal-900 text-white',
      accentColor: 'teal',
      demoName: 'Rajan Fresh Foods Ltd.',
      demoContact: 'procure@rajanfoods.com',
      demoFPO: '',
      voicePrompt: 'Bulk buyer login page. Enter credentials to source quintals and metric tons directly from verified FPOs.',
    },
  }[role];

  // Hear page instructions aloud
  const handleSpeakPageInstructions = () => {
    speakText(roleConfig.voicePrompt, 'en', onStartSpeech, onEndSpeech);
  };

  // Pronounce language name aloud when speaker clicked
  const handleSpeakLanguage = (e: React.MouseEvent, lang: SupportedLanguage) => {
    e.stopPropagation();
    speakLanguagePronunciation(lang.nameNative, lang.nameEn, lang.code, onStartSpeech, onEndSpeech);
  };

  // Quick Demo fill for SIH evaluators
  const handleFillDemo = () => {
    setErrorMessage(null);
    if (authMode === 'login') {
      setLoginIdentifier(roleConfig.demoContact);
      setLoginPassword('farm2door@2026');
    } else {
      setSignupName(roleConfig.demoName);
      setSignupIdentifier(roleConfig.demoContact);
      setSignupPassword('farm2door@2026');
      setSignupLanguage(role === 'farmer' ? 'hi' : 'en');
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Look up in localStorage or create default profile
    setTimeout(() => {
      let savedAccounts: UserAccount[] = [];
      try {
        const stored = localStorage.getItem('farm2door_registered_users');
        if (stored) savedAccounts = JSON.parse(stored);
      } catch (err) {
        console.warn('Failed to parse stored users:', err);
      }

      const existing = savedAccounts.find(
        (u) => u.contact.toLowerCase() === loginIdentifier.trim().toLowerCase() && u.role === role
      );

      const activeAccount: UserAccount = existing || {
        id: `usr-${Date.now()}`,
        fullName: loginIdentifier.includes('@')
          ? loginIdentifier.split('@')[0].replace('.', ' ')
          : roleConfig.demoName,
        contact: loginIdentifier.trim(),
        role: role,
        language: role === 'farmer' ? 'hi' : 'en',
        createdAt: new Date().toISOString(),
      };

      // Save active session
      localStorage.setItem('farm2door_user_session', JSON.stringify(activeAccount));
      if (activeAccount.language) {
        localStorage.setItem('farm2door_preferred_language', activeAccount.language);
        if (!localStorage.getItem('farm2door_registered_preferred_language')) {
          localStorage.setItem('farm2door_registered_preferred_language', activeAccount.language);
        }
      }
      setIsLoading(false);
      onAuthSuccess(activeAccount);
    }, 450);
  };

  // Handle Sign-up submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!signupIdentifier.trim()) {
      setErrorMessage('Please enter your Mobile Number or Email.');
      return;
    }
    if (signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (!signupLanguage) {
      setErrorMessage('Please select your preferred language.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newAccount: UserAccount = {
        id: `usr-${Date.now()}`,
        fullName: signupName.trim(),
        contact: signupIdentifier.trim(),
        role: role,
        language: signupLanguage,
        createdAt: new Date().toISOString(),
      };

      // Save to registered users array in localStorage
      try {
        const stored = localStorage.getItem('farm2door_registered_users');
        const list: UserAccount[] = stored ? JSON.parse(stored) : [];
        list.push(newAccount);
        localStorage.setItem('farm2door_registered_users', JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to save to local storage:', err);
      }

      // Save active session
      localStorage.setItem('farm2door_user_session', JSON.stringify(newAccount));
      localStorage.setItem('farm2door_registered_preferred_language', signupLanguage);
      localStorage.setItem('farm2door_preferred_language', signupLanguage);
      setIsLoading(false);
      onAuthSuccess(newAccount);
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="back-to-role-select-btn"
            onClick={onBackToRoleSelection}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-bold bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Role</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-stone-900 font-display">
              Farm2Door AI
            </span>
          </div>

          {/* Speaker button to hear instructions */}
          <button
            id="auth-instruction-speaker"
            onClick={handleSpeakPageInstructions}
            className="w-10 h-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 border border-stone-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
            title="Hear instructions aloud"
            aria-label="Hear instructions aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
          
          {/* Role Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
                <span>{roleConfig.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleConfig.badgeBg}`}>
                    {roleConfig.title}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">{roleConfig.subtitle}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-1">
                  {authMode === 'login' ? `${roleConfig.title} Login` : `${roleConfig.title} Sign Up`}
                </h1>
              </div>
            </div>

            {/* Quick Demo Pre-fill */}
            <button
              id="demo-fill-btn"
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              title="Pre-fill with sample credentials for quick evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Pre-fill</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Login
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-800 font-bold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. +91 98765 43210 or user@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${roleConfig.btnBg}`}
              >
                {isLoading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login to {roleConfig.title} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500">
                Don&apos;t have an account?{' '}
                <button
                  id="switch-to-signup-link"
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-emerald-700 font-extrabold hover:underline cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN-UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={role === 'farmer' ? 'e.g. Ramesh Patil' : role === 'consumer' ? 'e.g. Priya Sharma' : 'e.g. Rajan Fresh Foods'}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Mobile Number or Email */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-identifier-input"
                    type="text"
                    required
                    value={signupIdentifier}
                    onChange={(e) => setSignupIdentifier(e.target.value)}
                    placeholder="e.g. +91 98765 43210 or user@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Choose a secure password"
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* LANGUAGE SELECTION SECTION */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                    Select Preferred Language (अपनी भाषा चुनें)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    🔊 Tap speaker to hear name aloud
                  </span>
                </div>
                
                <p className="text-xs text-stone-500 mb-3">
                  Each option includes spoken pronunciation for accessibility so all users can easily identify their mother tongue.
                </p>

                {/* 12 Major Indian Languages Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                  {INDIAN_LANGUAGES.map((lang) => {
                    const isSelected = signupLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        id={`lang-card-${lang.code}`}
                        onClick={() => setSignupLanguage(lang.code)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="text-sm font-extrabold text-stone-900 truncate">
                            {lang.nameNative}
                          </div>
                          <div className="text-[11px] font-semibold text-stone-500 truncate">
                            {lang.nameEn}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          {/* Dedicated speaker button for language option */}
                          <button
                            id={`speaker-lang-${lang.code}`}
                            type="button"
                            onClick={(e) => handleSpeakLanguage(e, lang)}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                            title={`Hear ${lang.nameEn} pronunciation`}
                            aria-label={`Hear ${lang.nameEn} pronunciation`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sign Up Submit Button */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${roleConfig.btnBg}`}
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register & Enter {roleConfig.title} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-stone-500">
                Already have an account?{' '}
                <button
                  id="switch-to-login-link"
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-emerald-700 font-extrabold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
