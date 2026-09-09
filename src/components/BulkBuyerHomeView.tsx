import React from 'react';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Truck, 
  ShieldCheck, 
  Volume2, 
  Clock, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText } from '../utils/speech';

interface BulkBuyerHomeViewProps {
  onNavigateToBulkOrders: () => void;
  onNavigateToMarketIntel: () => void;
  onNavigateToLogistics: () => void;
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const BulkBuyerHomeView: React.FC<BulkBuyerHomeViewProps> = ({
  onNavigateToBulkOrders,
  onNavigateToMarketIntel,
  onNavigateToLogistics,
  language,
  onStartSpeech,
  onEndSpeech,
}) => {
  const handleSpeakBriefing = () => {
    const speech =
      'Bulk Buyer Portal summary. Over 4,850 quintals are currently available across 120 verified FPOs. Tomato wholesale quotes average rupees 3,200 per quintal, offering an estimated 18% savings compared to standard terminal mandis.';
    speakText(speech, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Direct B2B Agricultural Procurement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
            Institutional Procurement & FPO Sourcing
          </h1>

          <p className="mt-3 text-teal-100 text-sm sm:text-base leading-relaxed">
            Source quintals and metric tons directly from verified Farmer Producer Organizations (FPOs). Lock in volume contracts, eliminate multi-tier auction commissions, and track refrigerated transit.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-post-bulk-req-btn"
              onClick={onNavigateToBulkOrders}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-teal-700/30 transition-all cursor-pointer"
            >
              <span>Post New Bulk Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-mandi-intel-btn"
              onClick={onNavigateToMarketIntel}
              className="px-4 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-teal-100 font-bold text-sm sm:text-base flex items-center gap-2 border border-teal-700/50 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Mandi Price Trends</span>
            </button>

            <button
              onClick={handleSpeakBriefing}
              className="w-11 h-11 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-teal-300 border border-teal-700/50 flex items-center justify-center transition-colors cursor-pointer"
              title="Hear wholesale briefing aloud"
              aria-label="Hear wholesale briefing aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-72 text-white">
          <div className="text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
            Available Network Capacity
          </div>
          <div className="text-3xl font-black font-display text-white">4,850+ Qtl</div>
          <div className="mt-4 space-y-2 text-xs text-teal-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>120+ Verified FPO Collectives</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>~18.5% Average Procurement Savings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Direct Farm-Gate Weighment & QC</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Contracts</span>
            <FileText className="w-5 h-5 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">3 Active</div>
          <div className="text-xs text-stone-500 mt-1">75 Quintals in execution</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Wholesale Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">₹3,200 / Qtl</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">18% below terminal mandi</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">FPO Match Speed</span>
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">&lt; 15 Mins</div>
          <div className="text-xs text-stone-500 mt-1">AI automated collective match</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fleet In-Transit</span>
            <Truck className="w-5 h-5 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">2 Vehicles</div>
          <div className="text-xs text-stone-500 mt-1">Cold-chain tracked at 4°C</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bulk Orders Card */}
        <div 
          onClick={onNavigateToBulkOrders}
          className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-teal-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Bulk Orders & RFP Matching</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Post specific commodity requirements in quintals or metric tons. Instant AI match with certified regional FPOs with transparent quotes.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-teal-800 font-bold text-sm">
            <span>Manage Requirements</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mandi Intelligence Card */}
        <div 
          onClick={onNavigateToMarketIntel}
          className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-emerald-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Market Intelligence</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Live APMC wholesale arrivals, 7-day trend projections, and predictive price signals to optimize institutional procurement timing.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
            <span>View APMC Analytics</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Logistics Fleet Card */}
        <div 
          onClick={onNavigateToLogistics}
          className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-stone-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Cold-Chain Logistics</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Real-time refrigerated truck telemetry, GPS waypoint routing, and automated delivery confirmation from farm-gate to warehouse hub.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-stone-900 font-bold text-sm">
            <span>Track Cold Fleet</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

    </div>
  );
};
