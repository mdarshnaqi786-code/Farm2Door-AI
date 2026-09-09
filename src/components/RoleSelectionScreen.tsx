import React from 'react';
import { 
  Sprout, 
  Volume2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Truck,
  Building2,
  ShoppingBag,
  Mic
} from 'lucide-react';
import { UserRole } from '../types';
import { speakRoleDescription } from '../utils/speech';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  onExplorePublicView?: (view: 'market_intel' | 'logistics') => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  onExplorePublicView,
  onStartSpeech,
  onEndSpeech,
}) => {
  const handleSpeakRole = (e: React.MouseEvent, roleName: string, description: string) => {
    e.stopPropagation();
    speakRoleDescription(roleName, description, 'en', onStartSpeech, onEndSpeech);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between bg-stone-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Welcome Header */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo & Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-xs mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">Farm2Door AI</span>
            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-black rounded-md uppercase">
              SIH Prototype
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 font-display tracking-tight leading-tight">
            From Farms Directly to <span className="text-emerald-700">Your Doorstep</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-stone-600 font-medium">
            AI-powered direct agricultural commerce eliminating middlemen, with voice-first rural accessibility.
          </p>

          {/* Prompt Question */}
          <div className="mt-8 sm:mt-10 inline-block bg-stone-900 text-white px-6 py-2.5 rounded-full shadow-md">
            <p className="text-sm sm:text-base font-bold tracking-wide">
              How would you like to use Farm2Door AI?
            </p>
          </div>
        </div>

        {/* 3 Large Role Selection Cards */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          
          {/* Card 1: Farmer / FPO */}
          <div
            id="role-card-farmer"
            onClick={() => onSelectRole('farmer')}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/40 hover:border-emerald-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Voice-First</span>
              </span>

              {/* Speaker button to read aloud */}
              <button
                id="role-speaker-farmer"
                onClick={(e) =>
                  handleSpeakRole(
                    e,
                    'Farmer and FPO',
                    'Sell your agricultural products directly. Easy voice-guided listing and mandi prices.'
                  )
                }
                title="Hear role description aloud"
                aria-label="Hear Farmer role description aloud"
                className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div>
              {/* Large Icon */}
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 text-4xl shadow-inner group-hover:scale-105 transition-transform">
                <span>👨‍🌾</span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-black text-stone-900 font-display">
                FARMER / FPO
              </h2>
              <div className="text-xs font-bold text-emerald-700 mt-0.5 mb-3">
                किसान / రైతు / உழவர்
              </div>

              <p className="text-stone-700 text-sm font-semibold leading-relaxed mb-6">
                &ldquo;Sell your agricultural products directly.&rdquo;
              </p>

              {/* Feature points */}
              <div className="space-y-2 mb-6 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tap & Speak voice assistant in 12 Indian languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live APMC mandi rates for Tomato, Onion & Potato</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Receive direct bank payouts (78%+ farm-gate share)</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 group-hover:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors">
              <span>Continue as Farmer / FPO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Customer */}
          <div
            id="role-card-consumer"
            onClick={() => onSelectRole('consumer')}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                <span>Farm Retail</span>
              </span>

              {/* Speaker button to read aloud */}
              <button
                id="role-speaker-customer"
                onClick={(e) =>
                  handleSpeakRole(
                    e,
                    'Customer',
                    'Buy fresh products directly from farmers. Harvest traceability and doorstep delivery.'
                  )
                }
                title="Hear role description aloud"
                aria-label="Hear Customer role description aloud"
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div>
              {/* Large Icon */}
              <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 text-4xl shadow-inner group-hover:scale-105 transition-transform">
                <span>🛒</span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-black text-stone-900 font-display">
                CUSTOMER
              </h2>
              <div className="text-xs font-bold text-amber-700 mt-0.5 mb-3">
                Fresh Farm Retail Direct
              </div>

              <p className="text-stone-700 text-sm font-semibold leading-relaxed mb-6">
                &ldquo;Buy fresh products directly from farmers.&rdquo;
              </p>

              {/* Feature points */}
              <div className="space-y-2 mb-6 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Morning-plucked produce with complete farmer origin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transparent rupee split with zero broker commissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Electric cold-chain transit to your doorstep</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-stone-900 group-hover:bg-stone-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors">
              <span>Continue as Customer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Bulk Buyer */}
          <div
            id="role-card-bulk-buyer"
            onClick={() => onSelectRole('bulk_buyer')}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span>B2B & Wholesale</span>
              </span>

              {/* Speaker button to read aloud */}
              <button
                id="role-speaker-bulk"
                onClick={(e) =>
                  handleSpeakRole(
                    e,
                    'Bulk Buyer',
                    'Purchase agricultural products in bulk. Source quintals with AI FPO matching.'
                  )
                }
                title="Hear role description aloud"
                aria-label="Hear Bulk Buyer role description aloud"
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div>
              {/* Large Icon */}
              <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 text-4xl shadow-inner group-hover:scale-105 transition-transform">
                <span>🏢</span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-black text-stone-900 font-display">
                BULK BUYER
              </h2>
              <div className="text-xs font-bold text-teal-700 mt-0.5 mb-3">
                Hotels, Processors & Exporters
              </div>

              <p className="text-stone-700 text-sm font-semibold leading-relaxed mb-6">
                &ldquo;Purchase agricultural products in bulk.&rdquo;
              </p>

              {/* Feature points */}
              <div className="space-y-2 mb-6 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI algorithmic matching with verified FPO collectives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Post quintal & metric ton RFPs with quality specs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assured cold logistics & contract price stability</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-teal-800 group-hover:bg-teal-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors">
              <span>Continue as Bulk Buyer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Public Demonstration Quick-Links (Market Intelligence & Logistics) */}
        {onExplorePublicView && (
          <div className="mt-12 max-w-3xl mx-auto text-center bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-stone-500 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>SIH Live Evaluator Tools</span>
                </div>
                <p className="text-sm font-bold text-stone-800 mt-0.5">
                  Explore Live Mandi Intelligence or Green Logistics Fleet
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="quick-nav-mandi"
                  onClick={() => onExplorePublicView('market_intel')}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Mandi AI Intel</span>
                </button>
                <button
                  id="quick-nav-logistics"
                  onClick={() => onExplorePublicView('logistics')}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-teal-700" />
                  <span>Logistics Fleet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Agricultural Pillar Highlights */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
            <div className="font-bold text-stone-900 text-xs sm:text-sm">Direct Farm Gate Payout</div>
            <div className="text-[11px] text-stone-500 mt-0.5">78%+ straight to farmers</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <Mic className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
            <div className="font-bold text-stone-900 text-xs sm:text-sm">Voice-First Accessibility</div>
            <div className="text-[11px] text-stone-500 mt-0.5">12 Indian languages</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <TrendingUp className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
            <div className="font-bold text-stone-900 text-xs sm:text-sm">Mandi Price AI</div>
            <div className="text-[11px] text-stone-500 mt-0.5">Hold vs Sell predictive advice</div>
          </div>
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/60">
            <Truck className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
            <div className="font-bold text-stone-900 text-xs sm:text-sm">Cold Agri-Logistics</div>
            <div className="text-[11px] text-stone-500 mt-0.5">&lt;0.8% transit spoilage</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-stone-500">
        <p>Farm2Door AI &bull; Smart India Hackathon (SIH) Prototype &bull; Direct Agricultural Connectivity</p>
      </footer>
    </div>
  );
};
