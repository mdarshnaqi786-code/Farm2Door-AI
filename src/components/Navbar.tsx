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
  Repeat,
  ChevronDown,
  UserCheck,
  X
} from 'lucide-react';
import { AppView, LanguageCode, UserAccount } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import { speakLanguagePronunciation } from '../utils/speech';

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
  onSwitchRole: () => void;
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
  onSwitchRole,
  onStartSpeech,
  onEndSpeech,
}) => {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'farmer', label: 'Farmer Voice Hub', icon: Mic },
    { id: 'consumer', label: 'Marketplace', icon: ShoppingBag },
    { id: 'bulk_buyer', label: 'Bulk Buyer', icon: Building2 },
    { id: 'market_intel', label: 'Market Intelligence', icon: TrendingUp },
    { id: 'logistics', label: 'Logistics', icon: Truck },
  ];

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'farmer':
        return { label: 'Farmer / FPO', icon: '👨‍🌾', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'consumer':
        return { label: 'Customer', icon: '🛒', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'bulk_buyer':
        return { label: 'Bulk Buyer', icon: '🏢', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      default:
        return { label: 'Guest', icon: '🌱', bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo */}
            <button
              id="brand-logo-btn"
              onClick={onSwitchRole}
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer shrink-0"
              title="Return to Role Selection"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-stone-900 font-display">Farm2Door</span>
                  <span className="px-1.5 py-0.5 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-md">AI</span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">Direct Agricultural Network</p>
              </div>
            </button>

            {/* Center Navigation Links (Visible when logged in or exploring) */}
            <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                    <span>{item.label}</span>
                    {item.id === 'farmer' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Voice Enabled" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Audio status, Language selector, User Badge / Switch Role / Logout */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Audio Speaking Indicator */}
              {isSpeaking && (
                <button
                  id="audio-stop-btn"
                  onClick={onStopSpeech}
                  title="Audio is speaking. Tap to stop"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold animate-pulse cursor-pointer hover:bg-emerald-100"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span className="hidden sm:inline">Speaking</span>
                  <VolumeX className="w-3.5 h-3.5 text-stone-500 ml-1" />
                </button>
              )}

              {/* Multilingual Selector (supports 12 Indian languages) */}
              <button
                id="header-lang-toggle-btn"
                onClick={() => setIsLanguageModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                title="Select language (12 Indian languages supported)"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-extrabold">{currentLangObj.nameNative}</span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {/* Consumer Cart Button */}
              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition-colors cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Session & Role Controls */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  
                  {/* User Profile Pill */}
                  <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${roleInfo.bg}`}>
                    <span>{roleInfo.icon}</span>
                    <span className="truncate max-w-[120px]">{currentUser.fullName}</span>
                  </div>

                  {/* Switch Role Button */}
                  <button
                    id="header-switch-role-btn"
                    onClick={onSwitchRole}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                    title="Switch user role for SIH prototype evaluation"
                  >
                    <Repeat className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Switch Role</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    id="header-logout-btn"
                    onClick={onLogout}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 hover:border-red-200 transition-colors cursor-pointer"
                    title="Logout and return to role selection"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Not logged in yet: Quick Role Select link */
                <button
                  id="header-select-role-cta"
                  onClick={onSwitchRole}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Choose Role</span>
                </button>
              )}

            </div>
          </div>

          {/* Mobile Secondary Navigation Strip */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-stone-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Language Selection Modal (12 Indian Languages with Audio Pronunciation) */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-stone-200 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 font-display">
                    Select Language (भाषा चुनें)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Spoken pronunciation available for every language
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Indian Languages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1">
              {INDIAN_LANGUAGES.map((l) => {
                const isSelected = language === l.code;
                return (
                  <div
                    key={l.code}
                    id={`modal-lang-${l.code}`}
                    onClick={() => {
                      onLanguageChange(l.code);
                      setIsLanguageModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-sm font-extrabold text-stone-900 truncate">
                        {l.nameNative}
                      </div>
                      <div className="text-xs text-stone-500 font-semibold truncate">
                        {l.nameEn}
                      </div>
                    </div>

                    <button
                      id={`modal-speaker-lang-${l.code}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakLanguagePronunciation(l.nameNative, l.nameEn, l.code, onStartSpeech, onEndSpeech);
                      }}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title={`Pronounce ${l.nameEn}`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center text-xs text-stone-500">
              Selected: <span className="font-bold text-emerald-800">{currentLangObj.nameNative} ({currentLangObj.nameEn})</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
