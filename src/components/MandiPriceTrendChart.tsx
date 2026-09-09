import React, { useState, useMemo } from 'react';
import { TrendDataPoint } from '../data/marketDataService';
import { TrendingUp, TrendingDown, Minus, Activity, Eye, EyeOff } from 'lucide-react';

interface MandiPriceTrendChartProps {
  data: TrendDataPoint[];
  commodity: string;
  trendStatus: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  language?: string;
}

export const MandiPriceTrendChart: React.FC<MandiPriceTrendChartProps> = ({
  data,
  commodity,
  trendStatus,
  language = 'en',
}) => {
  const [showModal, setShowModal] = useState(true);
  const [showMin, setShowMin] = useState(true);
  const [showMax, setShowMax] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const t = {
    modalPrice: language === 'hi' ? 'मॉडल भाव (औसत)' : language === 'te' ? 'మోడల్ ధర (సగటు)' : 'Modal Price (Avg)',
    minPrice: language === 'hi' ? 'न्यूनतम भाव' : language === 'te' ? 'కనిష్ట ధర' : 'Minimum Price',
    maxPrice: language === 'hi' ? 'अधिकतम भाव' : language === 'te' ? 'గరిష్ట ధర' : 'Maximum Price',
    trendIncreasing: language === 'hi' ? 'भाव में तेजी (Increasing)' : language === 'te' ? 'ధరల పెరుగుదల (Increasing)' : 'Price Increasing',
    trendDecreasing: language === 'hi' ? 'भाव में मंदी (Decreasing)' : language === 'te' ? 'ధరల తగ్గుదల (Decreasing)' : 'Price Decreasing',
    trendStable: language === 'hi' ? 'भाव स्थिर (Stable)' : language === 'te' ? 'ధరల స్థిరత్వం (Stable)' : 'Price Stable',
    trendVolatile: language === 'hi' ? 'उतार-चढ़ाव (Volatile)' : language === 'te' ? 'అస్థిరత (Volatile)' : 'Price Volatile',
    noData: language === 'hi' ? 'चयनित अवधि के लिए कोई मंडी रिकॉर्ड नहीं मिला' : language === 'te' ? 'ఎంచుకున్న కాలానికి మార్కెట్ రికార్డులు లేవు' : 'No mandi records available for this filter',
    marketsLogged: language === 'hi' ? 'मंडियां दर्ज' : language === 'te' ? 'మార్కెట్లు నమోదు' : 'mandis logged',
  };

  // Dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Min & Max calculations for scaling
  const { minVal, maxVal } = useMemo(() => {
    if (!data || data.length === 0) return { minVal: 0, maxVal: 100 };
    let min = Infinity;
    let max = -Infinity;
    data.forEach((d) => {
      if (d.minPriceKg < min) min = d.minPriceKg;
      if (d.maxPriceKg > max) max = d.maxPriceKg;
      if (d.modalPriceKg > max) max = d.modalPriceKg;
      if (d.modalPriceKg < min) min = d.modalPriceKg;
    });
    // Add padding to domain
    const floor = Math.max(0, Math.floor(min * 0.85));
    const ceil = Math.ceil(max * 1.15) || 10;
    return { minVal: floor, maxVal: ceil };
  }, [data]);

  // Scalers
  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + chartHeight / 2;
    const ratio = (val - minVal) / (maxVal - minVal);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  // Generate SVG paths
  const modalPath = useMemo(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.modalPriceKg)}`)
      .join(' ');
  }, [data, minVal, maxVal]);

  const minPath = useMemo(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.minPriceKg)}`)
      .join(' ');
  }, [data, minVal, maxVal]);

  const maxPath = useMemo(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.maxPriceKg)}`)
      .join(' ');
  }, [data, minVal, maxVal]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    const step = (maxVal - minVal) / 4;
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(minVal + step * i);
      ticks.push({ val, y: getY(val) });
    }
    return ticks;
  }, [minVal, maxVal]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10 text-center text-stone-500 text-sm">
        <Activity className="w-8 h-8 mx-auto text-stone-400 mb-2" />
        <p>{t.noData}</p>
      </div>
    );
  }

  const activeHover = hoverIndex !== null && hoverIndex < data.length ? data[hoverIndex] : null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header with Title, Trend Status, and Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
            📈
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              {commodity} Historical Mandi Price Trend
            </h3>
            <p className="text-xs text-stone-500">
              Interactive timeline across verified Andhra Pradesh APMC mandis
            </p>
          </div>
        </div>

        {/* Trend Direction Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {trendStatus === 'increasing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.trendIncreasing}</span>
            </span>
          )}
          {trendStatus === 'decreasing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>{t.trendDecreasing}</span>
            </span>
          )}
          {trendStatus === 'stable' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              <Minus className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.trendStable}</span>
            </span>
          )}
          {trendStatus === 'volatile' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.trendVolatile}</span>
            </span>
          )}
        </div>
      </div>

      {/* Series Toggles */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold flex-wrap bg-stone-50 p-2.5 rounded-2xl border border-stone-200/70">
        <span className="text-stone-500 text-[11px] uppercase tracking-wider pl-1">Toggle Series:</span>
        
        {/* Modal Price Toggle */}
        <button
          type="button"
          onClick={() => setShowModal(!showModal)}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            showModal
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-stone-400 border border-stone-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
          <span>{t.modalPrice}</span>
          {showModal ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Max Price Toggle */}
        <button
          type="button"
          onClick={() => setShowMax(!showMax)}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            showMax
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-white text-stone-400 border border-stone-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-purple-300 inline-block"></span>
          <span>{t.maxPrice}</span>
          {showMax ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Min Price Toggle */}
        <button
          type="button"
          onClick={() => setShowMin(!showMin)}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            showMin
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white text-stone-400 border border-stone-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block"></span>
          <span>{t.minPrice}</span>
          {showMin ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>
      </div>

      {/* SVG Interactive Chart Area */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-80 select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={svgWidth - padding.right}
                y2={tick.y}
                stroke="#e7e5e4"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="600"
                fill="#78716c"
              >
                ₹{tick.val}
              </text>
            </g>
          ))}

          {/* Y-axis title */}
          <text
            x={15}
            y={padding.top - 10}
            fontSize="10"
            fontWeight="bold"
            fill="#a8a29e"
          >
            ₹/kg
          </text>

          {/* Area fill under Modal Price */}
          {showModal && data.length > 1 && (
            <path
              d={`${modalPath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`}
              fill="url(#emeraldGrad)"
            />
          )}

          {/* Max Price Line */}
          {showMax && maxPath && (
            <path
              d={maxPath}
              fill="none"
              stroke="#9333ea"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Min Price Line */}
          {showMin && minPath && (
            <path
              d={minPath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Modal Price Line */}
          {showModal && modalPath && (
            <path
              d={modalPath}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points on Modal Line */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.modalPriceKg);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Invisible hover trigger column */}
                <rect
                  x={cx - (chartWidth / data.length / 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {/* X-axis date labels for key points */}
                {(data.length <= 8 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                  <text
                    x={cx}
                    y={padding.top + chartHeight + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fill={isHovered ? '#0f172a' : '#78716c'}
                  >
                    {d.date.slice(5)}
                  </text>
                )}

                {/* Visible dot for Modal */}
                {showModal && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 3.5}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}
              </g>
            );
          })}

          {/* Active Hover Guide Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + chartHeight}
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {activeHover && hoverIndex !== null && (
          <div
            className="absolute top-2 bg-stone-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-stone-700 text-xs pointer-events-none transition-all space-y-1 z-20"
            style={{
              left: `clamp(10px, ${(getX(hoverIndex) / svgWidth) * 100}%, calc(100% - 170px))`,
            }}
          >
            <div className="font-bold text-emerald-300 flex items-center justify-between gap-3">
              <span>📅 {activeHover.date}</span>
              <span className="text-[10px] text-stone-400 font-normal">
                {activeHover.marketCount} {t.marketsLogged}
              </span>
            </div>
            <div className="space-y-0.5 pt-0.5 text-[11px]">
              {showModal && (
                <div className="flex justify-between items-center gap-3">
                  <span className="text-emerald-300 font-medium">Modal Reference:</span>
                  <span className="font-black text-white">₹{activeHover.modalPriceKg}/kg</span>
                </div>
              )}
              {showMax && (
                <div className="flex justify-between items-center gap-3">
                  <span className="text-purple-300 font-medium">Maximum:</span>
                  <span className="font-bold text-white">₹{activeHover.maxPriceKg}/kg</span>
                </div>
              )}
              {showMin && (
                <div className="flex justify-between items-center gap-3">
                  <span className="text-amber-300 font-medium">Minimum:</span>
                  <span className="font-bold text-white">₹{activeHover.minPriceKg}/kg</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-stone-500 italic text-center sm:text-left">
        * Mandi Reference Price reflects government APMC auction transactions. Farmers selling direct on Farm2Door avoid transport deductions.
      </div>
    </div>
  );
};
