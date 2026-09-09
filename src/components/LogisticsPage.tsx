import React, { useState } from 'react';
import { 
  Truck, 
  BatteryCharging, 
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
  Leaf
} from 'lucide-react';
import { MOCK_DELIVERIES, MOCK_VEHICLES } from '../data/mockData';

export const LogisticsPage: React.FC = () => {
  const [isReoptimizing, setIsReoptimizing] = useState(false);
  const [routeOptimizedNotice, setRouteOptimizedNotice] = useState(false);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<'all' | 'electric'>('all');

  const handleReoptimizeRoute = () => {
    setIsReoptimizing(true);
    setTimeout(() => {
      setIsReoptimizing(false);
      setRouteOptimizedNotice(true);
      setTimeout(() => setRouteOptimizedNotice(false), 3000);
    }, 800);
  };

  const filteredVehicles = MOCK_VEHICLES.filter((v) =>
    selectedVehicleFilter === 'all' ? true : v.isElectric
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Dynamic Agri-Routing & Cold Chain</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Smart Agricultural Logistics
          </h1>
          <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
            Consolidating smallholder farmer harvests into optimized electric cold-chain transport. Zero food waste, direct city hub routing, and transparent real-time tracking.
          </p>
        </div>

        {/* Quick CTA to Re-optimize */}
        <button
          id="reoptimize-route-btn"
          onClick={handleReoptimizeRoute}
          disabled={isReoptimizing}
          className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${isReoptimizing ? 'animate-spin' : ''}`} />
          <span>{isReoptimizing ? 'Calculating Route...' : 'AI Re-Optimize Routes'}</span>
        </button>
      </div>

      {routeOptimizedNotice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Route recalculated: Saved additional 3.2 km by batching Indiranagar and Koramangala drop clusters!</span>
        </div>
      )}

      {/* 4 Key Logistics Impact Metrics: Estimated Distance Saved & Delivery Time */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Distance Saved */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Distance Saved</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-display">
            18.4 km
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            24.2% shorter route via multi-farmer consolidation
          </p>
        </div>

        {/* Metric 2: Estimated Delivery Time */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Estimated Delivery Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
            42 min
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            Down from 1 hr 45 min traditional transit
          </p>
        </div>

        {/* Metric 3: Cold Chain Freshness & Spoilage */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Spoilage Loss</span>
            <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 font-display">
            &lt; 0.8%
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            vs 18% in un-refrigerated tractors
          </p>
        </div>

        {/* Metric 4: Carbon Emission Saved */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>EV Green Hauling</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-display">
            34.6 kg
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            CO2 emissions prevented today
          </p>
        </div>

      </div>

      {/* Example Optimized Delivery Route Visualizer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                Example Optimized Delivery Route
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live AI multi-point routing: Farm cluster pickup &rarr; Central cold sort &rarr; Direct doorstep delivery
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Route: Kolar &rarr; Bengaluru Metro (Trip #TR-402)</span>
          </div>
        </div>

        {/* Visual Route Stepper / Schematic */}
        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-md mb-3">
                1
              </div>
              <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                Farm Cluster Hub
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">Kolar Agri Co-op</h4>
              <p className="text-xs text-stone-500 mt-1">
                Harvest pickup from 14 smallholders (600 kg Tomato, 400 kg Onion).
              </p>
              <div className="text-[11px] text-emerald-700 font-bold mt-2">Departed 6:15 AM</div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md mb-3">
                2
              </div>
              <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                Sorting & Cold Pack
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">Hosakote Solar Hub</h4>
              <p className="text-xs text-stone-500 mt-1">
                Pre-cooling to 16°C & biodegradable box packing.
              </p>
              <div className="text-[11px] text-emerald-700 font-bold mt-2">Completed in 18 mins</div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-base shadow-md mb-3 animate-pulse">
                3
              </div>
              <span className="text-[11px] font-extrabold uppercase text-teal-800 tracking-wider">
                Current Transit
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">Outer Ring Micro-Hub</h4>
              <p className="text-xs text-stone-500 mt-1">
                Electric 3-wheeler split for rapid residential dispatch.
              </p>
              <div className="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> ETA: 12 mins
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-stone-200 text-stone-700 flex items-center justify-center font-black text-base mb-3">
                4
              </div>
              <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Doorstep Delivery
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">18 Consumer Drop Points</h4>
              <p className="text-xs text-stone-500 mt-1">
                Direct handoff with zero intermediary handling.
              </p>
              <div className="text-[11px] text-stone-400 font-medium mt-2">By 9:00 AM Today</div>
            </div>

          </div>
        </div>

      </div>

      {/* Active Deliveries Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Active Deliveries
            </h2>
            <p className="text-xs text-stone-500">Live monitoring of dispatches in transit</p>
          </div>
          <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl">
            {MOCK_DELIVERIES.length} Shipments Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_DELIVERIES.map((del) => (
            <div
              key={del.id}
              className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-stone-600 bg-stone-200/80 px-2 py-0.5 rounded-md">
                    {del.id}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      del.status === 'En Route'
                        ? 'bg-amber-100 text-amber-900'
                        : del.status === 'Sorting Hub'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {del.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-stone-900 font-display leading-tight">
                  {del.commodity}
                </h3>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">{del.quantity}</div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                    <span>Transit Progress</span>
                    <span className="font-bold text-stone-800">{del.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${del.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Route info */}
                <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">From: {del.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium text-stone-900">To: {del.destination}</span>
                  </div>
                </div>
              </div>

              {/* Driver & Temperature footer */}
              <div className="pt-3 border-t border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{del.driverName}</div>
                  <div className="text-[11px] text-stone-500">{del.vehicleId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md block">
                    {del.temperature}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
                    ETA: {del.etaMinutes} min
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Available Vehicles Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Available Vehicles & Fleet Status
            </h2>
            <p className="text-xs text-stone-500">
              Clean agricultural haulers ready for dispatch
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
              All Vehicles
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
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{veh.batteryOrFuel}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
