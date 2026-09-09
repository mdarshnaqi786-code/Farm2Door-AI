import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  BarChart2, 
  Info, 
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LanguageCode, CommodityPrice } from '../types';
import { COMMODITY_PRICES } from '../data/mockData';
import { speakText } from '../utils/speech';

interface MarketIntelligenceProps {
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({
  language,
  onStartSpeech,
  onEndSpeech,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<'Tomato' | 'Onion' | 'Potato'>('Tomato');
  const [selectedMarket, setSelectedMarket] = useState('Kolar APMC Market');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; price: number } | null>(null);

  const marketOptions = [
    'Kolar APMC Market (Karnataka)',
    'Lasalgaon Mandi (Maharashtra)',
    'Agra Mandi (Uttar Pradesh)',
    'Azadpur Mandi (Delhi NCR)',
    'Bowenpally Market (Hyderabad)',
  ];

  const currentCommodity: CommodityPrice =
    COMMODITY_PRICES.find((c) => c.commodity === selectedCrop) || COMMODITY_PRICES[0];

  // Read AI recommendation aloud
  const handleSpeakRecommendation = () => {
    let text = `${currentCommodity.commodity} AI Recommendation. Action: ${currentCommodity.recommendation.action}. ${currentCommodity.recommendation[language]}`;
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // SVG Chart calculation
  const history = currentCommodity.history7Days;
  const prices = history.map((h) => h.price);
  const minChartPrice = Math.floor(Math.min(...prices) * 0.9);
  const maxChartPrice = Math.ceil(Math.max(...prices) * 1.1);
  const priceRange = maxChartPrice - minChartPrice || 1;

  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = history.map((item, index) => {
    const x = paddingX + (index / (history.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((item.price - minChartPrice) / priceRange) * (chartHeight - paddingY * 2);
    return { x, y, date: item.date, price: item.price };
  });

  const pathD = points.reduce((acc, point, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Real-Time APMC Mandi Data & Predictive AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            AI Market Intelligence & Price Forecasting
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Eliminating information asymmetry for Indian farmers. Real-time modal prices, 7-day arrival trends, and actionable hold vs dispatch AI recommendations.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Commodity Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
            1. Select Commodity
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: 'Tomato', name: 'Tomato (टमाटर)', icon: '🍅' },
              { id: 'Onion', name: 'Onion (प्याज)', icon: '🧅' },
              { id: 'Potato', name: 'Potato (आलू)', icon: '🥔' },
            ].map((crop) => (
              <button
                key={crop.id}
                id={`market-select-${crop.id.toLowerCase()}`}
                onClick={() => setSelectedCrop(crop.id as any)}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCrop === crop.id
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{crop.icon}</span>
                <span>{crop.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Market Selector */}
        <div className="md:w-72">
          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
            2. Select APMC Market
          </label>
          <select
            id="apmc-market-dropdown"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm font-bold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
          >
            {marketOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 3 Price Stat Badges (Minimum, Maximum, Modal Price) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Minimum Price */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Minimum Price (Lowest Gate)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-stone-800 font-display">
              ₹{currentCommodity.minPrice}
            </span>
            <span className="text-xs font-semibold text-stone-500">/ kg</span>
          </div>
          <div className="mt-1 text-xs text-stone-500 font-medium">
            (₹{(currentCommodity.minPrice * 100).toLocaleString()} / Quintal)
          </div>
        </div>

        {/* Modal Price (Benchmark) */}
        <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-500 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
              Modal Price (Weighted Benchmark)
            </div>
            <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              Current Market Rate
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-900 font-display">
              ₹{currentCommodity.modalPrice}
            </span>
            <span className="text-xs font-bold text-emerald-800">/ kg</span>
          </div>
          <div className="mt-1 text-xs text-emerald-800 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>+{currentCommodity.changePercent}% vs last week in {selectedMarket.split('(')[0]}</span>
          </div>
        </div>

        {/* Maximum Price */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Maximum Price (Top Grade A)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700 font-display">
              ₹{currentCommodity.maxPrice}
            </span>
            <span className="text-xs font-semibold text-stone-500">/ kg</span>
          </div>
          <div className="mt-1 text-xs text-stone-500 font-medium">
            (₹{(currentCommodity.maxPrice * 100).toLocaleString()} / Quintal)
          </div>
        </div>

      </div>

      {/* Historical Price Trend Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-display">
                Historical Price Trend (Last 7 Days)
              </h2>
              <p className="text-xs text-stone-500">
                Daily recorded modal rates in ₹ per kg
              </p>
            </div>
            
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {hoveredPoint ? `${hoveredPoint.date}: ₹${hoveredPoint.price}/kg` : 'Hover point for rate'}
            </div>
          </div>

          {/* SVG Responsive Line Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 sm:h-64"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#e7e5e4"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={chartHeight / 2}
                x2={chartWidth - paddingX}
                y2={chartHeight / 2}
                stroke="#e7e5e4"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#d6d3d1"
              />

              {/* Area */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#047857"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-7 transition-all"
                    onMouseEnter={() => setHoveredPoint({ date: p.date, price: p.price })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Date label */}
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#78716c"
                    fontWeight="600"
                  >
                    {p.date}
                  </text>
                  {/* Price label */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#064e3b"
                    fontWeight="800"
                  >
                    ₹{p.price}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
            <span>Source: AGMARKNET Daily Arrivals & APMC Yard Slips</span>
            <span className="text-emerald-700 font-bold">Updated Today at 6:00 AM</span>
          </div>
        </div>

        {/* AI Insight & Farmer Recommendation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI-Generated Market Insight */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-900 font-display">AI Market Intelligence</h2>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-700 text-sm leading-relaxed">
              &ldquo;{currentCommodity.aiInsight[language]}&rdquo;
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inter-state freight routes operating at normal capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cold chain storage occupancy: 68% (optimal)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Retail consumer demand index: 114 (elevated)</span>
              </div>
            </div>
          </div>

          {/* Simple Recommendation for Farmer with Speaker Button */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-black text-amber-950 font-display">
                  Recommended Farmer Action
                </h3>
              </div>

              {/* Speaker Button */}
              <button
                id="recommendation-speaker-btn"
                onClick={handleSpeakRecommendation}
                className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
                title="Hear recommendation aloud"
                aria-label="Hear recommendation aloud"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* Action Badge */}
            <div className="inline-block px-4 py-1.5 bg-amber-600 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-xs">
              {currentCommodity.recommendation.action}
            </div>

            <p className="text-sm font-bold text-amber-900 leading-relaxed">
              {currentCommodity.recommendation[language]}
            </p>

            <div className="text-[11px] text-amber-800/80 font-medium">
              Calculated using mandi arrival volume forecasting and retail demand sensors.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
