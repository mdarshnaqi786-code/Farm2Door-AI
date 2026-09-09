import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ThermometerSnowflake, 
  PhoneCall, 
  ArrowRight,
  RotateCw,
  Zap,
  Leaf,
  Layers,
  Coins,
  Volume2,
  Sliders,
  AlertCircle,
  PackageCheck,
  Check,
  Building2,
  User,
  HelpCircle,
  Info
} from 'lucide-react';
import { LanguageCode, OrderStatus, UserAccount } from '../types';
import { speakText } from '../utils/speech';
import { MOCK_VEHICLES } from '../data/mockData';
import { 
  DeliveryRecord, 
  OptimizedRoutePlan, 
  DeliveryCluster,
  getLogisticsDeliveries, 
  computeOptimizedRoute, 
  groupNearbyDeliveries, 
  updateDeliveryStatusInStore,
  calculateTransportCost,
  calculateTravelTimeMinutes
} from '../data/logisticsDataService';

interface LogisticsPageProps {
  currentUser?: UserAccount | null;
  language?: LanguageCode;
  onStartSpeech?: () => void;
  onEndSpeech?: () => void;
}

export const LogisticsPage: React.FC<LogisticsPageProps> = ({
  currentUser,
  language = 'en',
  onStartSpeech = () => {},
  onEndSpeech = () => {},
}) => {
  // Configurable Parameters for Demonstration
  const [costPerKm, setCostPerKm] = useState<number>(20); // ₹20/km default
  const [averageSpeedKmH, setAverageSpeedKmH] = useState<number>(35); // 35 km/h default
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Deliveries & Route State
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [routePlan, setRoutePlan] = useState<OptimizedRoutePlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizedNotice, setOptimizedNotice] = useState<string | null>(null);

  // Group Nearby Deliveries State
  const [showGroupedDeliveries, setShowGroupedDeliveries] = useState<boolean>(false);
  const [clusters, setClusters] = useState<DeliveryCluster[]>([]);

  // Fleet View Filter
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<'all' | 'electric'>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'delivery_list' | 'fleet'>('dashboard');

  // Load Initial Deliveries and Compute Initial Route
  useEffect(() => {
    const initialDeliveries = getLogisticsDeliveries(costPerKm, averageSpeedKmH);
    setDeliveries(initialDeliveries);
    const initialPlan = computeOptimizedRoute(initialDeliveries, costPerKm, averageSpeedKmH);
    setRoutePlan(initialPlan);
    setClusters(groupNearbyDeliveries(initialDeliveries));
  }, []);

  // Update calculations when Cost per KM or Speed changes
  const handleRecalculateParameters = (newCost: number, newSpeed: number) => {
    setCostPerKm(newCost);
    setAverageSpeedKmH(newSpeed);

    const updatedDeliveries = deliveries.map((del) => {
      return {
        ...del,
        estimatedMinutes: calculateTravelTimeMinutes(del.distanceKm, newSpeed),
        transportCost: calculateTransportCost(del.distanceKm, newCost),
      };
    });
    setDeliveries(updatedDeliveries);
    const updatedPlan = computeOptimizedRoute(updatedDeliveries, newCost, newSpeed);
    setRoutePlan(updatedPlan);
  };

  // Deterministic Route Optimization
  const handleOptimizeRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const optimized = computeOptimizedRoute(deliveries, costPerKm, averageSpeedKmH);
      setRoutePlan(optimized);
      setIsOptimizing(false);
      
      const msg = language === 'hi' 
        ? `रूट अपडेट किया गया: निकटतम बिंदु आधार पर कुल ${optimized.totalDistanceKm} किमी (${optimized.totalEstimatedMinutes} मिनट, ₹${optimized.totalEstimatedCost})।`
        : language === 'te'
        ? `రూట్ అప్డేట్ చేయబడింది: మొత్తం ${optimized.totalDistanceKm} కిమీ (${optimized.totalEstimatedMinutes} నిమిషాలు, రవాణా ఖర్చు ₹${optimized.totalEstimatedCost}).`
        : `Route optimized: Deterministic nearest-neighbor planned ${optimized.stops.length - 1} stops across ${optimized.totalDistanceKm} km (Est. ${optimized.totalEstimatedMinutes} min, ₹${optimized.totalEstimatedCost}).`;
      
      setOptimizedNotice(msg);
      setTimeout(() => setOptimizedNotice(null), 5000);
    }, 600);
  };

  // Group Nearby Deliveries Toggle
  const handleToggleGroupDeliveries = () => {
    const nextState = !showGroupedDeliveries;
    setShowGroupedDeliveries(nextState);
    if (nextState) {
      setClusters(groupNearbyDeliveries(deliveries));
    }
  };

  // Update Individual Delivery Status
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = deliveries.map((del) => {
      if (del.orderId === orderId) {
        return { ...del, status: newStatus };
      }
      return del;
    });
    setDeliveries(updated);
    updateDeliveryStatusInStore(orderId, newStatus);
    
    // Also notify user
    setOptimizedNotice(`Order #${orderId} marked as "${newStatus}".`);
    setTimeout(() => setOptimizedNotice(null), 3000);
  };

  // Voice narration for accessibility
  const handleSpeakOverview = () => {
    if (!routePlan) return;
    const pendingCount = deliveries.filter((d) => d.status !== 'Delivered').length;
    
    let text = '';
    if (language === 'hi') {
      text = `किसान लॉजिस्टिक्स डैशबोर्ड। आपके पास कुल ${deliveries.length} डिलीवरी हैं, जिनमें से ${pendingCount} सक्रिय हैं। कुल रूट दूरी ${routePlan.totalDistanceKm} किलोमीटर है और अनुमानित परिवहन खर्च ₹${routePlan.totalEstimatedCost} है। यह प्रोटोटाइप डेमो डेटा है।`;
    } else if (language === 'te') {
      text = `రైతు లాజిస్టిక్స్ డాష్‌బోర్డ్. మొత్తం ${deliveries.length} డెలివరీలు ఉన్నాయి, అందులో ${pendingCount} ఇంకా పెండింగ్‌లో ఉన్నాయి. మొత్తం రూట్ దూరం ${routePlan.totalDistanceKm} కిలోమీటర్లు, అంచనా రవాణా ఖర్చు ₹${routePlan.totalEstimatedCost}. ఇది ప్రోటోటైప్ డెమో డేటా.`;
    } else {
      text = `Farmer Logistics Dashboard. You have ${deliveries.length} total deliveries with ${pendingCount} pending. Consolidated route distance is ${routePlan.totalDistanceKm} kilometers with an estimated transport cost of ₹${routePlan.totalEstimatedCost}. Clearly marked as prototype demo data.`;
    }
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // Summary Card values
  const pendingCount = deliveries.filter((d) => d.status !== 'Delivered').length;
  const todayTotalCount = deliveries.length;
  const totalDistance = routePlan ? routePlan.totalDistanceKm : 0;
  const totalCost = routePlan ? routePlan.totalEstimatedCost : 0;

  const filteredVehicles = MOCK_VEHICLES.filter((v) =>
    selectedVehicleFilter === 'all' ? true : v.isElectric
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP BANNER WITH DEMO DISCLAIMER & PRIMARY CTA */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="max-w-3xl space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Logistics & Route Optimization</span>
            </span>
            {/* MANDATORY PROTOTYPE DEMO LABEL */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase tracking-wider">
              Prototype Demo Data
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
            {language === 'hi' 
              ? 'किसान स्मार्ट लॉजिस्टिक्स और रूट अनुकूलन' 
              : language === 'te' 
              ? 'రైతు స్మార్ట్ లాజిస్టిక్స్ & రూట్ ఆప్టిమైజేషన్' 
              : 'Farmer Smart Logistics & Route Optimization'}
          </h1>
          
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {language === 'hi'
              ? 'खेत से ग्राहक और थोक खरीदार तक की डिलीवरी दूरी, समय और परिवहन लागत को कम करने के लिए एआई आधारित रूट योजना। (प्रोटोटाइप प्रदर्शन — लाइव जीपीएस का दावा नहीं)।'
              : language === 'te'
              ? 'రైతు నుండి కస్టమర్లు మరియు బల్క్ కొనుగోలుదారుల వరకు డెలివరీ దూరం, సమయం మరియు రవాణా ఖర్చులను తగ్గించడానికి స్మార్ట్ రూట్ సిఫార్సు. (ప్రోటోటైప్ మోడల్).'
              : 'Helping farmers reduce delivery distance, delivery time, and transportation cost through intelligent delivery sequencing and multi-stop consolidation.'}
          </p>

          <div className="text-[11px] text-stone-400 flex items-center gap-1 pt-1">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Prototype Demonstration: Deterministic Haversine distance. No real-time GPS tracking or live traffic claimed.</span>
          </div>
        </div>

        {/* Action Buttons: Speaker + Optimize Route + Config */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            id="speak-logistics-overview-btn"
            onClick={handleSpeakOverview}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Hear logistics summary aloud"
            aria-label="Hear logistics summary aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            id="open-config-btn"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            <span>Rates & Speed</span>
          </button>

          <button
            id="optimize-route-btn"
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Calculating Route...' : 'Optimize Route'}</span>
          </button>
        </div>

      </div>

      {/* Config Drawer for SIH Demonstration Parameters */}
      {isConfigOpen && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 text-stone-800 space-y-4 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Demo Simulation Controls (Prototype Parameters)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Configurable Speed & Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Transport Cost per KM:</span>
                <span className="text-emerald-700 text-sm">₹{costPerKm} / km</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={costPerKm}
                onChange={(e) => handleRecalculateParameters(Number(e.target.value), averageSpeedKmH)}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>₹10/km (Small EV)</span>
                <span>₹20/km (Standard Light Commercial)</span>
                <span>₹50/km (Cold-Truck)</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Average Vehicle Speed:</span>
                <span className="text-blue-700 text-sm">{averageSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={averageSpeedKmH}
                onChange={(e) => handleRecalculateParameters(costPerKm, Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>20 km/h (Rural Roads)</span>
                <span>35 km/h (Peri-Urban Average)</span>
                <span>60 km/h (Expressway Corridor)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Success Notice */}
      {optimizedNotice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{optimizedNotice}</span>
        </div>
      )}

      {/* 2. FOUR FUNCTIONAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Pending Deliveries */}
        <div 
          id="metric-pending-deliveries"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Pending Deliveries</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-700 font-display">
            {pendingCount}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            {pendingCount === 0 ? 'All scheduled dispatches completed' : 'Awaiting dispatch or in transit'}
          </p>
        </div>

        {/* Card 2: Today's Deliveries */}
        <div 
          id="metric-todays-deliveries"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Today's Deliveries</span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
            {todayTotalCount}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            Active order volume across corridor
          </p>
        </div>

        {/* Card 3: Total Distance */}
        <div 
          id="metric-total-distance"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Total Distance</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 font-display">
            {totalDistance} km
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            Calculated via Haversine distance formula
          </p>
        </div>

        {/* Card 4: Estimated Transport Cost */}
        <div 
          id="metric-transport-cost"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Estimated Transport Cost</span>
            <Coins className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-display">
            ₹{totalCost}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            {totalDistance} km &times; ₹{costPerKm}/km rate
          </p>
        </div>

      </div>

      {/* 3. AI SMART ROUTE RECOMMENDATION SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                AI Smart Route Recommendation
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                AI-Assisted Route Recommendation
              </span>
              <span className="text-xs text-stone-500">
                • Prototype route — demonstration data (Nearest-Neighbor Heuristic)
              </span>
            </div>
          </div>

          {/* Group Deliveries Toggle CTA */}
          <button
            id="group-nearby-deliveries-btn"
            onClick={handleToggleGroupDeliveries}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showGroupedDeliveries
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{showGroupedDeliveries ? 'Hide Grouped Corridors' : 'Group Nearby Deliveries'}</span>
          </button>
        </div>

        {/* Group Nearby Deliveries Recommendation Card (When toggled) */}
        {showGroupedDeliveries && (
          <div className="bg-teal-50/90 border border-teal-200 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-md mb-1">
                  <Layers className="w-3.5 h-3.5 text-teal-700" />
                  <span>Potential Grouped Delivery</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900">
                  Recommended Geographic Corridors for Single-Vehicle Batching
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Recommendation only. Do not merge customer orders. Orders remain independently invoiced and verified.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map((cluster, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-teal-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-xs">{cluster.clusterName}</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Approx {cluster.totalDistanceKm} km
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{cluster.savingReason}</p>
                  <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                    <span className="font-bold text-stone-700">Orders in this run: </span>
                    {cluster.deliveries.map((d) => `${d.orderId} (${d.buyerName})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Route Diagram: Farmer/FPO Hub ↓ Customer A ↓ Customer B ↓ Customer C */}
        <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2">
            <div className="font-bold text-stone-800 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Optimized Sequence: Farmer Origin &rarr; Drop Points</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Avg Speed: <strong className="text-stone-900">{averageSpeedKmH} km/h</strong></span>
              <span>Rate: <strong className="text-stone-900">₹{costPerKm}/km</strong></span>
            </div>
          </div>

          {/* Stepper Timeline Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 relative">
            {routePlan?.stops.map((stop, index) => {
              const isOrigin = stop.stopNumber === 0;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOrigin 
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs' 
                      : 'bg-white text-stone-900 border-stone-200 shadow-2xs hover:border-emerald-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        isOrigin ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOrigin ? '📍' : stop.stopNumber}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isOrigin ? 'bg-emerald-700/80 text-emerald-100' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isOrigin ? 'Origin Hub' : `Leg: ${stop.legDistanceKm} km`}
                      </span>
                    </div>

                    <h4 className={`text-sm font-black leading-snug ${isOrigin ? 'text-white' : 'text-stone-900'}`}>
                      {stop.locationName}
                    </h4>

                    {!isOrigin && (
                      <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
                        <div className="font-semibold text-stone-700 truncate">{stop.buyerName}</div>
                        <div className="truncate text-emerald-700 font-bold">{stop.commodity} • {stop.quantity}</div>
                      </div>
                    )}
                  </div>

                  <div className={`mt-3 pt-2 text-[11px] font-bold border-t flex items-center justify-between ${
                    isOrigin ? 'border-emerald-700 text-emerald-200' : 'border-stone-100 text-stone-600'
                  }`}>
                    <span>{isOrigin ? 'Start Point' : `Cum: ${stop.cumulativeDistanceKm} km`}</span>
                    <span>{isOrigin ? '0 min' : `+${stop.legMinutes} min`}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Route Summary Metrics Strip */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-stone-700">
            <div className="flex items-center gap-4">
              <span>Total Distance: <span className="text-emerald-800 text-sm font-black">{routePlan?.totalDistanceKm} km</span></span>
              <span>Estimated Travel Time: <span className="text-amber-800 text-sm font-black">{routePlan?.totalEstimatedMinutes} min</span></span>
              <span>Estimated Transport Cost: <span className="text-stone-900 text-sm font-black">₹{routePlan?.totalEstimatedCost}</span></span>
            </div>
            <div className="text-[11px] text-stone-500 font-normal">
              Heuristic approximation for SIH demonstration • No real-world traffic claimed
            </div>
          </div>

        </div>

      </div>

      {/* 4. LOGISTICS OPTIMIZATION IMPACT CARD */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md mb-1 uppercase tracking-wider">
              Prototype Estimate
            </div>
            <h3 className="text-xl font-black text-stone-900 font-display">
              Logistics Optimization Impact
            </h3>
            <p className="text-xs text-stone-600">
              Comparing un-optimized individual round-trips against single consolidated route.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-stone-500 italic max-w-xs sm:text-right">
            Notice: Prototype simulation model. Do not claim these are actual Farm2Door savings.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Distance Saved */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Distance Saved</span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-display">
              {routePlan?.distanceSavedKm || 0} km
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Consolidated vs individual back-and-forth round trips ({routePlan?.unoptimizedDistanceKm} km &rarr; {routePlan?.totalDistanceKm} km)
            </p>
          </div>

          {/* Cost Saved */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Estimated Cost Saved</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-display">
              ₹{routePlan?.costSaved || 0}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Calculated at ₹{costPerKm}/km transport saving rate
            </p>
          </div>

          {/* Potential Grouped Deliveries */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Potential Grouped Deliveries</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-800 font-display">
              {deliveries.length} Deliveries
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Merged into 1 sequential route run instead of multiple dispatch legs
            </p>
          </div>

        </div>
      </div>

      {/* 5. DELIVERY LIST SECTION (TABLE / CARDS WITH STATUS UPDATER) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Delivery List & Order Status Tracking
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage order fulfillment, delivery progress, and customer drop details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl">
              {deliveries.length} Total Records
            </span>
          </div>
        </div>

        {/* Deliveries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {deliveries.map((del) => (
            <div
              key={del.id}
              id={`delivery-card-${del.orderId}`}
              className="bg-stone-50 rounded-3xl p-5 sm:p-6 border border-stone-200 hover:border-emerald-500 shadow-2xs transition-all space-y-4"
            >
              {/* Card Top: Order ID, Type & Demo Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-stone-900 text-base">
                      Order #{del.orderId}
                    </span>
                    {del.isDemoData ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Prototype Demo Data
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Live Order
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{del.orderTime}</div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  del.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : del.status === 'In Transit'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : del.status === 'Ready for Delivery'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-stone-200 text-stone-800'
                }`}>
                  {del.status}
                </span>
              </div>

              {/* Product & Buyer Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-2xl border border-stone-200/80">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Product</span>
                  <span className="font-black text-stone-900 text-sm">{del.product}</span>
                  <span className="text-emerald-700 font-bold block">{del.quantity}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Buyer</span>
                  <span className="font-bold text-stone-900 truncate block">{del.buyerName}</span>
                  <span className="text-stone-500 block text-[11px]">{del.buyerType}</span>
                </div>
              </div>

              {/* Location & Calculated Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Location</span>
                  <span className="font-bold text-stone-800 truncate block text-[11px] mt-0.5">
                    {del.locationName.split('—')[0]}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Distance</span>
                  <span className="font-black text-blue-700 text-xs mt-0.5 block">
                    {del.distanceKm} km
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Est. Time</span>
                  <span className="font-black text-stone-900 text-xs mt-0.5 block">
                    {del.estimatedMinutes} min
                  </span>
                </div>
              </div>

              {/* Status Step Indicator: Pending -> Accepted -> Ready for Delivery -> In Transit -> Delivered */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase">
                  <span>Delivery Status Lifecycle</span>
                  <span>Update:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['Pending', 'Accepted', 'Ready for Delivery', 'In Transit', 'Delivered'] as OrderStatus[]).map((st) => {
                    const isCurrent = del.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(del.orderId, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 6. AVAILABLE VEHICLES & COLD FLEET (PRESERVING PHASE 3 FUNCTIONALITY) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Available Vehicles & Cold-Chain Fleet Status
            </h2>
            <p className="text-xs text-stone-500">
              Clean agricultural haulers ready for dispatch from regional consolidation hub
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedVehicleFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedVehicleFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Vehicles ({MOCK_VEHICLES.length})
            </button>
            <button
              onClick={() => setSelectedVehicleFilter('electric')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedVehicleFilter === 'electric'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ⚡ EV Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredVehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      veh.status === 'Available at Hub'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900">{veh.type}</h3>
                <div className="text-xs font-mono text-stone-500 mt-0.5">{veh.numberPlate}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Capacity:</span>
                  <span className="font-bold text-stone-900">{veh.capacityKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Current Load:</span>
                  <span className="font-bold text-emerald-800">{veh.currentLoadKg} kg</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600 font-medium pt-1">
                  <span className="truncate text-[11px]">{veh.batteryOrFuel}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
