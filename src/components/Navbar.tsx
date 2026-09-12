import React, { useState } from 'react';
import { 
  Sprout, 
  Volume2, 
  VolumeX, 
  ShoppingCart, 
  Mic, 
  ShoppingBag, 
  Building2, 
  TrendingUp, 
  Truck, 
  Languages, 
  LogOut, 
  User, 
  Package, 
  Home, 
  Menu, 
  X,
  Wheat,
  Check,
  ShieldCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { AppView, LanguageCode, UserAccount, SupportedLanguage } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import { speakLanguagePronunciation } from '../utils/speech';
import { t } from '../data/translations';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  cartCount: number;
  onOpenCart: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  cartCount,
  onOpenCart,
  isSpeaking,
  onStopSpeech,
  currentUser,
  onLogout,
  onOpenProfile,
  onStartSpeech,
  onEndSpeech,
}) => {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  // Configure navigation links: role-specific if authenticated, or public explore if pre-login
  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { id: 'landing' as AppView, label: t('nav.home', language) || 'Home', icon: Home },
        { id: 'customer_marketplace' as AppView, label: t('nav.marketplace', language) || 'Marketplace', icon: ShoppingBag },
        { id: 'farmer_market_intel' as AppView, label: t('nav.marketIntel', language) || 'Market Intel', icon: TrendingUp },
        { id: 'farmer_voice_hub' as AppView, label: t('nav.voiceHub', language) || 'Voice AI', icon: Mic },
      ];
    }

    switch (currentUser.role) {
      case 'farmer':
        return [
          { id: 'farmer_home' as AppView, label: t('nav.home', language), icon: Home },
          { id: 'farmer_products' as AppView, label: t('nav.myProducts', language), icon: Sprout },
          { id: 'farmer_orders' as AppView, label: t('nav.orders', language), icon: Package },
          { id: 'farmer_voice_hub' as AppView, label: t('nav.voiceHub', language), icon: Mic },
          { id: 'farmer_market_intel' as AppView, label: t('nav.marketIntel', language), icon: TrendingUp },
          { id: 'farmer_logistics' as AppView, label: t('nav.logistics', language), icon: Truck },
        ];
      case 'consumer':
        return [
          { id: 'customer_home' as AppView, label: t('nav.home', language), icon: Home },
          { id: 'customer_marketplace' as AppView, label: t('nav.marketplace', language), icon: ShoppingBag },
          { id: 'customer_orders' as AppView, label: t('nav.myOrders', language), icon: Package },
        ];
      case 'admin':
        return [
          { id: 'admin_dashboard' as AppView, label: 'Admin Dashboard', icon: ShieldCheck },
        ];
      case 'bulk_buyer':
        return [
          { id: 'bulk_home' as AppView, label: t('nav.home', language), icon: Home },
          { id: 'bulk_marketplace' as AppView, label: t('nav.farmMarketplace', language), icon: ShoppingBag },
          { id: 'bulk_orders' as AppView, label: t('nav.bulkSourcing', language), icon: Building2 },
          { id: 'bulk_market_intel' as AppView, label: t('nav.marketIntel', language), icon: TrendingUp },
          { id: 'bulk_logistics' as AppView, label: t('nav.logistics', language), icon: Truck },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isLinkActive = (id: AppView) => {
    if (currentView === id) return true;
    // Map legacy alias to new IDs
    if (id === 'farmer_home' && currentView === 'farmer') return true;
    if (id === 'customer_marketplace' && currentView === 'consumer') return true;
    if (id === 'bulk_orders' && currentView === 'bulk_buyer') return true;
    if (id.includes('market_intel') && currentView === 'market_intel') return true;
    if (id.includes('logistics') && currentView === 'logistics') return true;
    return false;
  };

  const getRoleBadge = () => {
    if (!currentUser) {
      return {
        label: 'Direct Marketplace',
        icon: '🌿',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }

    switch (currentUser.role) {
      case 'farmer':
        return { 
          label: language === 'hi' ? 'किसान / एफपीओ' : language === 'te' ? 'రైతు / FPO' : 'Farmer / FPO', 
          icon: '👨‍🌾', 
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' 
        };
      case 'consumer':
        return { 
          label: language === 'hi' ? 'सीधे उपभोक्ता' : language === 'te' ? 'వినియోగదారుడు' : 'Customer', 
          icon: '🛒', 
          bg: 'bg-amber-100 text-amber-900 border-amber-300' 
        };
      case 'admin':
        return { 
          label: 'Admin (naqi)', 
          icon: '🛡️', 
          bg: 'bg-purple-100 text-purple-900 border-purple-300' 
        };
      case 'bulk_buyer':
        return { 
          label: language === 'hi' ? 'थोक खरीदार' : language === 'te' ? 'బల్క్ కొనుగోలుదారు' : 'Bulk Buyer', 
          icon: '🏢', 
          bg: 'bg-teal-100 text-teal-900 border-teal-300' 
        };
      default:
        return {
          label: currentUser?.role || 'Member',
          icon: '👤',
          bg: 'bg-stone-100 text-stone-800 border-stone-200',
        };
    }
  };

  const roleBadge = getRoleBadge() || {
    label: 'Direct Marketplace',
    icon: '🌿',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  // Speak language name aloud in language modal
  const handleSpeakLanguage = (e: React.MouseEvent, lang: SupportedLanguage) => {
    e.stopPropagation();
    speakLanguagePronunciation(lang.nameNative, lang.nameEn, lang.code, onStartSpeech, onEndSpeech);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Left: Brand Logo & Role Badge */}
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-2.5 cursor-pointer" 
                onClick={() => onNavigate(currentUser ? (currentUser.role === 'farmer' ? 'farmer_home' : currentUser.role === 'consumer' ? 'customer_home' : currentUser.role === 'admin' ? 'admin_dashboard' : 'bulk_home') : 'landing')}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
                  <Sprout className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-stone-900 font-display block leading-none">
                    Farm2Door AI
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Direct Marketplace
                  </span>
                </div>
              </div>

              {/* Active Role Tag */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1 ${roleBadge?.bg || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                  <span>{roleBadge?.icon || '🌿'}</span>
                  <span>{roleBadge?.label || 'Direct Marketplace'}</span>
                </span>
              </div>
            </div>

            {/* Middle: Role-Specific Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.filter(Boolean).map((item) => {
                if (!item || !item.icon) return null;
                const Icon = item.icon;
                const active = isLinkActive(item.id);
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions (Audio, Language, Cart, Profile, Logout OR Login/Signup) */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Speaking Indicator & Stop Button */}
              {isSpeaking && (
                <button
                  id="stop-speaking-btn"
                  onClick={onStopSpeech}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 animate-pulse transition-transform hover:scale-105 cursor-pointer"
                  title={t('voice.stopAudio', language)}
                  aria-label={t('voice.stopAudio', language)}
                >
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('voice.stopAudio', language)}</span>
                </button>
              )}

              {/* Language Selector Button */}
              <button
                id="navbar-language-btn"
                onClick={() => setIsLanguageModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-bold border border-stone-200 transition-colors cursor-pointer"
                title="Change Language"
                aria-label="Select preferred language"
              >
                <Languages className="w-4 h-4 text-emerald-700" />
                <span className="hidden lg:inline">{currentLangObj.nameNative}</span>
                <span className="lg:hidden">{currentLangObj.code.toUpperCase()}</span>
              </button>

              {currentUser ? (
                <>
                  {/* Cart Button: ONLY visible for Customer role */}
                  {currentUser.role === 'consumer' && (
                    <button
                      id="navbar-cart-btn"
                      onClick={onOpenCart}
                      className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      title="Open Cart"
                      aria-label="Open Shopping Cart"
                    >
                      <ShoppingCart className="w-5 h-5 text-stone-800" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Profile Button */}
                  <button
                    id="navbar-profile-btn"
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs sm:text-sm font-bold border border-stone-200 transition-colors cursor-pointer"
                    title="View Profile"
                    aria-label="View user profile"
                  >
                    <User className="w-4 h-4 text-stone-600" />
                    <span className="hidden sm:inline truncate max-w-[110px]">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                  </button>

                  {/* Logout Button */}
                  <button
                    id="navbar-logout-btn"
                    onClick={onLogout}
                    className="p-2.5 rounded-xl bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 hover:border-red-200 transition-colors cursor-pointer"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    id="navbar-login-btn"
                    onClick={() => onNavigate('auth')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold border border-stone-300 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>

                  <button
                    id="navbar-signup-btn"
                    onClick={() => onNavigate('role_selection')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                id="mobile-nav-toggle-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer ml-1"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>

          {/* Mobile Menu Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-stone-200 space-y-2 animate-fade-in">
              <div className="px-2 py-1 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${roleBadge?.bg || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                  <span>{roleBadge?.icon || '🌿'}</span>
                  <span>{currentUser ? `${currentUser.fullName} (${roleBadge?.label || ''})` : 'Farm2Door Direct Marketplace'}</span>
                </span>
              </div>

              {navLinks.filter(Boolean).map((item) => {
                if (!item || !item.icon) return null;
                const Icon = item.icon;
                const active = isLinkActive(item.id);
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-stone-200 flex flex-col gap-2 px-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLanguageModalOpen(true);
                  }}
                  className="flex items-center justify-between text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    <span>Language: {currentLangObj.nameNative}</span>
                  </div>
                  <span className="text-xs uppercase text-emerald-600 font-semibold">{currentLangObj.code}</span>
                </button>

                {currentUser ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center justify-center gap-1.5 text-sm font-bold text-red-700 bg-red-50 px-3 py-2 rounded-xl w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('auth');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-bold text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('role_selection');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </header>

      {/* 12 Indian Languages Modal */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            id="language-selection-modal"
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900 font-display">
                    Select Preferred Language
                  </h3>
                  <p className="text-xs text-stone-500">
                    भाषा चुनें &bull; భాషను ఎంచుకోండి &bull; 12 Indian Languages with Voice Guidance
                  </p>
                </div>
              </div>
              <button
                id="close-language-modal-btn"
                onClick={() => setIsLanguageModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close language selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <div
                    key={lang.code}
                    id={`lang-option-${lang.code}`}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLanguageModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 shadow-xs'
                        : 'border-stone-200 hover:border-emerald-400 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-base font-extrabold text-stone-900">
                          {lang.nameNative}
                        </div>
                        <div className="text-xs text-stone-500 font-medium">
                          {lang.nameEn}
                        </div>
                      </div>

                      {/* Speaker pronunciation button */}
                      <button
                        onClick={(e) => handleSpeakLanguage(e, lang)}
                        title={`Pronounce ${lang.nameEn}`}
                        aria-label={`Listen to ${lang.nameEn} pronunciation`}
                        className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-emerald-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
                      <span>{lang.region}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-emerald-800 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
