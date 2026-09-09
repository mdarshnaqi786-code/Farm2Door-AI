import React from 'react';
import { 
  Sprout, 
  Mic, 
  ShoppingBag, 
  Building2, 
  Volume2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AppView, LanguageCode } from '../types';
import { speakText } from '../utils/speech';

interface LandingPageProps {
  onSelectRole: (role: AppView) => void;
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  language,
  onStartSpeech,
  onEndSpeech,
}) => {
  const handleHearIntroduction = () => {
    let introText = 'Welcome to Farm2Door AI. From Farms Directly to Your Doorstep. Please select whether you are a Farmer, a Consumer, or a Bulk Buyer.';
    if (language === 'hi') {
      introText = 'फार्म2डोर एआई में आपका स्वागत है। खेत से सीधे आपकी चौखट तक। कृपया चुनें कि आप किसान हैं, उपभोक्ता हैं, या थोक खरीदार हैं।';
    } else if (language === 'te') {
      introText = 'ఫార్మ్2డోర్ AI కి స్వాగతం. పొలాల నుండి నేరుగా మీ ఇంటి ముందుకు. దయచేసి మీరు రైతు, వినియోగదారుడు లేదా బల్క్ కొనుగోలుదారుడా అనేది ఎంచుకోండి.';
    }
    speakText(introText, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 w-full">
        
        {/* Top Leaf Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold mb-6 border border-emerald-200 shadow-xs">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>Smart Agricultural Marketplace &bull; Zero Middlemen</span>
            <button
              onClick={handleHearIntroduction}
              className="ml-1 p-1 hover:bg-emerald-200 rounded-full transition-colors cursor-pointer"
              title="Listen to intro"
              aria-label="Listen to intro"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>

          {/* Hero Title and Subtitle */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight max-w-4xl font-display leading-[1.15]">
            From Farms Directly to <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">Your Doorstep</span>
          </h1>
          
          <p className="mt-4 sm:mt-5 text-lg sm:text-xl text-stone-600 max-w-2xl font-normal leading-relaxed">
            Connecting Farmers, Consumers and Businesses through AI
          </p>
        </div>

        {/* Three Large Role Selection Cards */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          
          {/* 1. Farmer Card */}
          <div
            id="role-card-farmer"
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
            onClick={() => onSelectRole('farmer')}
          >
            <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase flex items-center gap-1">
              <Mic className="w-3 h-3 text-amber-300 animate-pulse" />
              Voice-First
            </div>

            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sprout className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-stone-900 font-display">I am a Farmer</h2>
              </div>
              <p className="text-xs font-bold text-emerald-700 mb-3">किसान / రైతు (FPO)</p>
              
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Easy voice-enabled access for listing harvest, tracking real-time mandi prices, and receiving direct bank payments without middlemen.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Large voice-guided buttons</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tomato, Onion, Potato Mandi AI rates</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hindi, Telugu & English support</span>
                </div>
              </div>
            </div>

            <button
              id="enter-farmer-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('farmer');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Enter Farmer Voice Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 2. Consumer Card */}
          <div
            id="role-card-consumer"
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            onClick={() => onSelectRole('consumer')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-display mb-1">I am a Consumer</h2>
              <p className="text-xs font-bold text-amber-700 mb-3">Fresh Farm Retail</p>
              
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Purchase farm-fresh tomatoes, onions, and potatoes directly from local cultivators with transparent pricing and doorstep delivery.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair price breakdown (farmer receives 78%+)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Harvest date & farmer traceability</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eco-friendly temperature-controlled transit</span>
                </div>
              </div>
            </div>

            <button
              id="enter-consumer-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('consumer');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Shop Fresh Produce</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 3. Bulk Buyer Card */}
          <div
            id="role-card-bulk-buyer"
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            onClick={() => onSelectRole('bulk_buyer')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-display mb-1">I am a Bulk Buyer</h2>
              <p className="text-xs font-bold text-teal-700 mb-3">Hotels, Processors & Exporters</p>
              
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Source quintals and metric tons of graded agricultural commodities with AI matching directly to verified FPOs and grower cooperatives.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI smart matching with certified FPOs</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bulk requirement RFP & direct quote bids</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cold logistics & contract assurance</span>
                </div>
              </div>
            </div>

            <button
              id="enter-bulk-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('bulk_buyer');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Source in Bulk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Key Agricultural Pillar Highlights */}
        <div className="mt-16 pt-10 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <ShieldCheck className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <div className="font-bold text-stone-900 text-sm">Direct Farm-Gate Price</div>
            <div className="text-xs text-stone-500 mt-0.5">Middlemen eliminated</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <Mic className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <div className="font-bold text-stone-900 text-sm">Voice-First Accessibility</div>
            <div className="text-xs text-stone-500 mt-0.5">Hindi, Telugu & English</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <TrendingUp className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <div className="font-bold text-stone-900 text-sm">AI Mandi Forecasts</div>
            <div className="text-xs text-stone-500 mt-0.5">Real-time price intelligence</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <Truck className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <div className="font-bold text-stone-900 text-sm">Smart Route Logistics</div>
            <div className="text-xs text-stone-500 mt-0.5">Cold chain & 24% distance saved</div>
          </div>
        </div>

      </div>

      {/* Footer / Clean Prototype Note */}
      <footer className="bg-white border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500">
        <p>Farm2Door AI &bull; Smart India Hackathon Prototype &bull; Designed for Rural Farmer Inclusion & Transparent Food Supply</p>
      </footer>
    </div>
  );
};
