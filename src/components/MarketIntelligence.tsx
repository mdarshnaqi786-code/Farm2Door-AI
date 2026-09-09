import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Volume2, 
  Mic,
  ShieldCheck, 
  BarChart2, 
  Info, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { LanguageCode } from '../types';
import { 
  DateRangeFilter, 
  calculateOverviewStats, 
  calculateMarketComparison, 
  calculatePriceTrend, 
  generateAIInsights, 
  calculatePriceForecast,
  getAvailableCommodities,
  getAvailableDistricts,
  getAvailableMarkets,
  syncCsvDataset,
  answerMarketQueryFromData
} from '../data/marketDataService';
import { MandiPriceTrendChart } from './MandiPriceTrendChart';
import { speakText, stopSpeech } from '../utils/speech';

interface MarketIntelligenceProps {
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({
  language,
  onStartSpeech,
  onEndSpeech,
  onOpenVoiceAssistant,
}) => {
  // Filter States
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDates, setShowCustomDates] = useState(false);

  // Quick Voice Assistant Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [voiceAnswerText, setVoiceAnswerText] = useState<string | null>(null);

  // Synchronize CSV on mount
  useEffect(() => {
    syncCsvDataset();
  }, []);

  // Filter options derived from dataset
  const availableCommodities = useMemo(() => getAvailableCommodities(), []);
  const availableDistricts = useMemo(() => getAvailableDistricts(selectedCommodity), [selectedCommodity]);
  const availableMarkets = useMemo(
    () => getAvailableMarkets(selectedCommodity, selectedDistrict),
    [selectedCommodity, selectedDistrict]
  );

  // Reset market if not in available markets when district/commodity changes
  useEffect(() => {
    if (selectedMarket !== 'All' && !availableMarkets.includes(selectedMarket)) {
      setSelectedMarket('All');
    }
  }, [availableMarkets, selectedMarket]);

  useEffect(() => {
    if (selectedDistrict !== 'All' && !availableDistricts.includes(selectedDistrict)) {
      setSelectedDistrict('All');
    }
  }, [availableDistricts, selectedDistrict]);

  // Calculated stats from dataset
  const overviewStats = useMemo(
    () => calculateOverviewStats(selectedCommodity, selectedDistrict, selectedMarket),
    [selectedCommodity, selectedDistrict, selectedMarket]
  );

  const marketComparisons = useMemo(
    () => calculateMarketComparison(selectedCommodity, selectedDistrict),
    [selectedCommodity, selectedDistrict]
  );

  const trendData = useMemo(
    () => calculatePriceTrend(selectedCommodity, selectedDistrict, selectedMarket, dateRange),
    [selectedCommodity, selectedDistrict, selectedMarket, dateRange]
  );

  const aiInsights = useMemo(
    () => generateAIInsights(selectedCommodity, selectedDistrict, selectedMarket),
    [selectedCommodity, selectedDistrict, selectedMarket]
  );

  const forecast = useMemo(
    () => calculatePriceForecast(selectedCommodity, selectedDistrict, selectedMarket),
    [selectedCommodity, selectedDistrict, selectedMarket]
  );

  // Localized texts
  const t = {
    title: {
      en: 'AI Market Intelligence & Mandi Price Forecasting',
      hi: 'एआई मंडी भाव व मूल्य पूर्वानुमान',
      te: 'AI మార్కెట్ సమాచారం & ధరల అంచనా',
    },
    subtitle: {
      en: 'Official Mandi Reference Prices from Andhra Pradesh APMCs. Empowering cultivators with transparent benchmark rates and AI projections.',
      hi: 'आंध्र प्रदेश एपीएमसी से आधिकारिक मंडी संदर्भ भाव। किसानों के लिए पारदर्शी बेंचमार्क और एआई पूर्वानुमान।',
      te: 'ఆంధ్రప్రదేశ్ APMC మార్కెట్ల నుండి అధికారిక రిఫరెన్స్ ధరలు. రైతులకు పారదర్శక సమాచారం మరియు AI అంచనాలు.',
    },
    askKisanAI: {
      en: 'Ask Kisan AI',
      hi: 'किसान एआई से पूछें',
      te: 'కిసాన్ AI ని అడగండి',
    },
    mandiReference: {
      en: 'Mandi Reference Price',
      hi: 'मंडी संदर्भ भाव (मॉडल)',
      te: 'మార్కెట్ రిఫరెన్స్ ధర',
    },
    minPrice: {
      en: 'Minimum Price',
      hi: 'न्यूनतम भाव',
      te: 'కనిష్ట ధర',
    },
    maxPrice: {
      en: 'Maximum Price',
      hi: 'अधिकतम भाव',
      te: 'గరిష్ట ధర',
    },
    modalPrice: {
      en: 'Modal Price',
      hi: 'मॉडल भाव',
      te: 'మోడల్ ధర',
    },
    recentChange: {
      en: 'Recent Price Change',
      hi: 'हालिया भाव बदलाव',
      te: 'ఇటీవలి ధరల మార్పు',
    },
    availableMarkets: {
      en: 'Available Markets',
      hi: 'सक्रिय मंडियां',
      te: 'అందుబాటులో ఉన్న మార్కెట్లు',
    },
    bestMarket: {
      en: 'Highest Reference Market',
      hi: 'सर्वोच्च भाव वाली मंडी',
      te: 'అత్యధిక ధర గల మార్కెట్',
    },
    lowestMarket: {
      en: 'Lowest Reference Market',
      hi: 'न्यूनतम भाव वाली मंडी',
      te: 'అత్యల్ప ధర గల మార్కెట్',
    },
    priceUp: {
      en: 'Price Going Up',
      hi: 'भाव बढ़ रहा है',
      te: 'ధర పెరుగుతోంది',
    },
    priceDown: {
      en: 'Price Going Down',
      hi: 'भाव घट रहा है',
      te: 'ధర తగ్గుతోంది',
    },
    priceStable: {
      en: 'Price Stable',
      hi: 'भाव स्थिर है',
      te: 'ధర స్థిరంగా ఉంది',
    },
    disclaimer: {
      en: 'Reference Notice: Mandi Reference Prices reflect historical APMC auction records. Farmer selling price on Farm2Door is set independently by the cultivator.',
      hi: 'सूचना: मंडी संदर्भ भाव सरकारी एपीएमसी नीलामी रिकॉर्ड पर आधारित हैं। फार्म2डोर पर किसान का विक्रय मूल्य किसान स्वयं तय करता है।',
      te: 'గమనిక: మార్కెట్ రిఫరెన్స్ ధరలు APMC రికార్డులపై ఆధారపడి ఉన్నాయి. ఫార్మ్2డోర్‌లో రైతు అమ్మకపు ధరను రైతు స్వయంగా నిర్ణయిస్తారు.',
    },
  };

  // Voice playback handler
  const handleSpeakInsight = (text: string) => {
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // Handle Voice Assistant query
  const handleQuickVoiceQuery = (query: string) => {
    setVoiceQueryText(query);
    const answer = answerMarketQueryFromData(query, language);
    if (answer) {
      setVoiceAnswerText(answer);
      speakText(answer, language, onStartSpeech, onEndSpeech);
    } else {
      const fallback =
        language === 'hi'
          ? `उपलब्ध मंडी आंकड़ों के अनुसार ${selectedCommodity} का मॉडल भाव ₹${overviewStats.latestModalPriceKg} प्रति किलो है।`
          : language === 'te'
          ? `అందుబాటులో ఉన్న రికార్డుల ప్రకారం ${selectedCommodity} మోడల్ ధర కేజీకి ₹${overviewStats.latestModalPriceKg} గా ఉంది.`
          : `According to available mandi data, ${selectedCommodity} modal reference rate is ₹${overviewStats.latestModalPriceKg} per kg.`;
      setVoiceAnswerText(fallback);
      speakText(fallback, language, onStartSpeech, onEndSpeech);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER WITH ASK KISAN AI BUTTON                                */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Phase 3: Andhra Pradesh Mandi Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
            {t.title[language]}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Voice Trigger Button: Ask Kisan AI */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            id="ask-kisan-ai-btn"
            onClick={() => {
              if (onOpenVoiceAssistant) {
                onOpenVoiceAssistant();
              } else {
                setIsVoiceModalOpen(true);
              }
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Mic className="w-5 h-5 text-stone-950 animate-pulse" />
            <span>{t.askKisanAI[language]}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMMODITY & DISTRICT FILTERS                                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider pb-2 border-b border-stone-100">
          <Filter className="w-3.5 h-3.5 text-emerald-700" />
          <span>Mandi Reference Price Filters (Interactive)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Commodity Dropdown / Buttons */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Agricultural Commodity
            </label>
            <select
              id="commodity-filter-select"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm font-bold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              {availableCommodities.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === 'Tomato' && '🍅 Tomato (టమోటా / टमाटर)'}
                  {crop === 'Onion' && '🧅 Onion (ఉల్లిపాయ / प्याज)'}
                  {crop === 'Potato' && '🥔 Potato (బంగాళాదుంప / आलू)'}
                  {crop === 'Rice' && '🌾 Rice (బియ్యం / चावल)'}
                  {crop === 'Wheat' && '🌾 Wheat (గోధుమలు / गेहूं)'}
                  {!['Tomato', 'Onion', 'Potato', 'Rice', 'Wheat'].includes(crop) && crop}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              District (Andhra Pradesh)
            </label>
            <select
              id="district-filter-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm font-bold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist.charAt(0).toUpperCase() + dist.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Market Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              APMC Mandi / Rythu Bazar
            </label>
            <select
              id="market-filter-select"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm font-bold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">All Mandis ({availableMarkets.length})</option>
              {availableMarkets.map((mkt) => (
                <option key={mkt} value={mkt}>
                  {mkt}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Historical Timeline
            </label>
            <div className="flex items-center gap-1.5">
              <select
                id="date-range-select"
                value={dateRange}
                onChange={(e) => {
                  const val = e.target.value as DateRangeFilter;
                  setDateRange(val);
                  setShowCustomDates(val === 'all');
                }}
                className="flex-1 p-2.5 text-xs sm:text-sm font-bold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="latest">Latest Record</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">Full Dataset / Custom</option>
              </select>
            </div>
          </div>

        </div>

        {/* Custom Date Range if requested */}
        {showCustomDates && (
          <div className="pt-2 border-t border-stone-100 flex items-center gap-3 text-xs flex-wrap">
            <span className="font-bold text-stone-600">Custom Date Span:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="p-1.5 border border-stone-200 rounded-lg text-xs font-medium"
            />
            <span>to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="p-1.5 border border-stone-200 rounded-lg text-xs font-medium"
            />
            <span className="text-stone-400 text-[11px]">(Leave blank to view entire historical window)</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MARKET OVERVIEW STATS CARDS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Latest Mandi Reference Price */}
        <div className="col-span-2 sm:col-span-1 bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-500 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
            {t.mandiReference[language]}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-display">
              ₹{overviewStats.latestModalPriceKg}
            </span>
            <span className="text-xs font-bold text-emerald-800">/ kg</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
            ₹{(overviewStats.latestModalPriceKg * 100).toLocaleString()} / Quintal
          </div>
        </div>

        {/* Minimum Price */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.minPrice[language]}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-amber-700 font-display">
              ₹{overviewStats.minPriceKg}
            </span>
            <span className="text-xs font-medium text-stone-500">/ kg</span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400">
            Lowest mandi trade
          </div>
        </div>

        {/* Maximum Price */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.maxPrice[language]}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-purple-700 font-display">
              ₹{overviewStats.maxPriceKg}
            </span>
            <span className="text-xs font-medium text-stone-500">/ kg</span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400">
            Top Grade A ceiling
          </div>
        </div>

        {/* Modal Price */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.modalPrice[language]}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-stone-800 font-display">
              ₹{overviewStats.modalPriceKg}
            </span>
            <span className="text-xs font-medium text-stone-500">/ kg</span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400">
            Most frequent auction rate
          </div>
        </div>

        {/* Recent Price Change */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.recentChange[language]}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {overviewStats.priceChangeKg >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span
              className={`text-lg sm:text-xl font-black font-display ${
                overviewStats.priceChangeKg >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {overviewStats.priceChangeKg >= 0 ? '+' : ''}₹{overviewStats.priceChangeKg}/kg
            </span>
          </div>
          <div
            className={`mt-1 text-[10px] font-bold ${
              overviewStats.priceChangeKg >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            ({overviewStats.priceChangePercent >= 0 ? '+' : ''}
            {overviewStats.priceChangePercent.toFixed(1)}%)
          </div>
        </div>

        {/* Available Markets Count */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.availableMarkets[language]}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-teal-800 font-display">
              {overviewStats.availableMarketsCount}
            </span>
            <span className="text-xs font-medium text-stone-500">mandis</span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400">
            {overviewStats.availableDistrictsCount} AP districts
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. HISTORICAL PRICE TREND CHART (INTERACTIVE WITH TOGGLES)               */}
      {/* ========================================================================= */}
      <MandiPriceTrendChart
        data={trendData}
        commodity={selectedCommodity}
        trendStatus={overviewStats.trendStatus}
        language={language}
      />

      {/* ========================================================================= */}
      {/* 5. PRICE CHANGE ANALYSIS & PRICE FORECAST GRID                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Price Change Analysis (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              📊
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                Price Movement & Change Analysis
              </h3>
              <p className="text-xs text-stone-500">
                Shift between latest mandi arrivals and previous session
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">Current Reference Price</span>
              <span className="text-xl font-black text-stone-900 font-display">
                ₹{overviewStats.latestModalPriceKg} / kg
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Date: {overviewStats.latestDate}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">Previous Reference Price</span>
              <span className="text-xl font-black text-stone-700 font-display">
                {overviewStats.prevModalPriceKg !== null ? `₹${overviewStats.prevModalPriceKg} / kg` : 'N/A'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Prior auction session</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span>Net Price Difference:</span>
              <span className="text-sm font-black text-emerald-800">
                {overviewStats.priceChangeKg >= 0 ? '+' : ''}₹{overviewStats.priceChangeKg} / kg ({overviewStats.priceChangePercent >= 0 ? '+' : ''}{overviewStats.priceChangePercent.toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              {overviewStats.trendStatus === 'increasing' &&
                `Historical records indicate rising mandi reference rates for ${selectedCommodity}. Farmers holding ready harvest can benefit from current pricing windows.`}
              {overviewStats.trendStatus === 'decreasing' &&
                `Historical data shows recent softening in ${selectedCommodity} mandi bids due to arrival spikes. Farm2Door direct buyer contracts offer price insulation.`}
              {overviewStats.trendStatus === 'stable' &&
                `${selectedCommodity} prices have traded within a tight band across Andhra Pradesh mandis, indicating steady supply-demand equilibrium.`}
            </p>
          </div>
        </div>

        {/* Right: AI Price Forecast (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                🔮
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  7-Day AI Price Forecast
                </h3>
                <p className="text-xs text-stone-500">
                  Projected reference trajectory from historical momentum
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
              Estimated Projections
            </span>
          </div>

          {forecast.isSufficientData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {forecast.forecastDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 hover:border-amber-400 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-stone-500">{day.dayLabel.split(',')[0]}</div>
                    <div className="text-xs font-black text-stone-900 font-display my-1">
                      ₹{day.estimatedPriceKg}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      ₹{day.lowerBoundKg}-{day.upperBoundKg}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">{forecast.confidenceNote}</span>
                  <span className="text-amber-800/80">
                    Projections are indicative reference benchmarks and do not guarantee future settlement prices.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-stone-500 text-xs bg-stone-50 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-stone-400 mx-auto mb-2" />
              <span>{forecast.confidenceNote}</span>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. MARKET-WISE PRICE COMPARISON (ANDHRA PRADESH MANDIS)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Market-Wise Mandi Price Comparison
            </h3>
            <p className="text-xs text-stone-500">
              Sorted by latest modal auction price to identify high-reference trading centers
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              🏆 Highest Reference
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
              🔻 Lowest Reference
            </span>
          </div>
        </div>

        {marketComparisons.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No comparative mandi records for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Mandi / Market Name</th>
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3 text-right">Min (₹/kg)</th>
                  <th className="py-3 px-3 text-right">Max (₹/kg)</th>
                  <th className="py-3 px-3 text-right font-black text-stone-800">Latest Modal (₹/kg)</th>
                  <th className="py-3 px-3 text-center">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {marketComparisons.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-stone-50 transition-colors ${
                      item.isHighest ? 'bg-emerald-50/40' : item.isLowest ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-stone-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.market}</span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{item.district}</td>
                    <td className="py-3 px-3 text-right text-stone-600">₹{item.minPriceKg}</td>
                    <td className="py-3 px-3 text-right text-stone-600">₹{item.maxPriceKg}</td>
                    <td className="py-3 px-3 text-right font-black text-stone-900 text-sm">
                      ₹{item.latestModalPriceKg}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.isHighest && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-700 text-white font-black text-[10px]">
                          Highest Price
                        </span>
                      )}
                      {item.isLowest && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-bold text-[10px]">
                          Lowest Price
                        </span>
                      )}
                      {!item.isHighest && !item.isLowest && (
                        <span className="text-stone-400 text-[10px]">Standard Range</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. AI MARKET INSIGHTS WITH AUDIO PLAYBACK                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                AI Market Insights (Multilingual Audio)
              </h3>
              <p className="text-xs text-stone-500">
                Automated analytical deductions synthesized from historical mandi arrivals
              </p>
            </div>
          </div>

          <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {language === 'hi' ? 'हिन्दी में सुनें' : language === 'te' ? 'తెలుగులో వినండి' : 'Listen in English'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {insight.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSpeakInsight(insight.speechText[language])}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-400 cursor-pointer shadow-2xs transition-all"
                    title="Listen aloud in your language"
                    aria-label="Listen aloud in your language"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                  {insight.title[language]}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {insight.description[language]}
                </p>
              </div>

              <div className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-200/50">
                * Based on available historical mandi data
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. LEGAL DISCLAIMER & MANDI NOTICE                                        */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-stone-100 text-stone-600 text-xs border border-stone-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.disclaimer[language]}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* QUICK VOICE ASSISTANT MODAL (ASK KISAN AI)                                */}
      {/* ========================================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <Mic className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    {t.askKisanAI[language]}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Voice & text agricultural intelligence in {language.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsVoiceModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Prompt examples suggested by user requirements */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 block">
                Tap a sample question or ask your own:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  "What is today's tomato reference price?",
                  'Which market has the highest tomato price?',
                  'Is onion price increasing?',
                  'What is the recent potato price trend?',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickVoiceQuery(sample)}
                    className="p-2.5 text-left rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-400 font-medium text-stone-800 transition-colors cursor-pointer text-xs"
                  >
                    💬 &ldquo;{sample}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? 'यहाँ सवाल लिखें (उदा. टमाटर का भाव क्या है)...'
                    : language === 'te'
                    ? 'ఇక్కడ ప్రశ్న టైప్ చేయండి (ఉదా. టమోటా ధర ఎంత)...'
                    : 'Type a question (e.g. Tomato price)...'
                }
                value={voiceQueryText}
                onChange={(e) => setVoiceQueryText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && voiceQueryText.trim()) {
                    handleQuickVoiceQuery(voiceQueryText);
                  }
                }}
                className="flex-1 p-3 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <button
                type="button"
                onClick={() => {
                  if (voiceQueryText.trim()) handleQuickVoiceQuery(voiceQueryText);
                }}
                className="px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Ask
              </button>
            </div>

            {/* Answer Display */}
            {voiceAnswerText && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                    Kisan AI Response:
                  </span>
                  <button
                    type="button"
                    onClick={() => speakText(voiceAnswerText, language, onStartSpeech, onEndSpeech)}
                    className="p-1 rounded-md bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 cursor-pointer"
                    title="Replay Audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {voiceAnswerText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
