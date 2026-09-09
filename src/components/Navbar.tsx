import React from 'react';
import { 
  Sprout, 
  Volume2, 
  VolumeX, 
  ShoppingCart, 
  Mic, 
  Layers, 
  ShoppingBag, 
  Building2, 
  TrendingUp, 
  Truck,
  Languages
} from 'lucide-react';
import { AppView, LanguageCode } from '../types';
import { stopSpeech } from '../utils/speech';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  cartCount: number;
  onOpenCart: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
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
}) => {
  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Home', icon: Layers },
    { id: 'farmer', label: 'Farmer Voice Hub', icon: Mic },
    { id: 'consumer', label: 'Marketplace', icon: ShoppingBag },
    { id: 'bulk_buyer', label: 'Bulk Buyer', icon: Building2 },
    { id: 'market_intel', label: 'Market Intelligence', icon: TrendingUp },
    { id: 'logistics', label: 'Logistics', icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-stone-900 font-display">Farm2Door</span>
                <span className="px-1.5 py-0.5 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-md">AI</span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Direct Agricultural Network</p>
            </div>
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                  <span>{item.label}</span>
                  {item.id === 'farmer' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Voice Enabled" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Audio status, Language selector, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audio Indicator */}
            {isSpeaking && (
              <button
                id="audio-stop-btn"
                onClick={onStopSpeech}
                title="Audio is speaking. Tap to stop"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold animate-pulse cursor-pointer hover:bg-emerald-100"
              >
                <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span className="hidden sm:inline">Speaking</span>
                <VolumeX className="w-3.5 h-3.5 text-stone-500 ml-1" />
              </button>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
              <Languages className="w-4 h-4 text-stone-500 ml-2 mr-1 hidden sm:block" />
              <button
                id="lang-btn-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                id="lang-btn-hi"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                id="lang-btn-te"
                onClick={() => onLanguageChange('te')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  language === 'te'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Consumer Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-stone-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
