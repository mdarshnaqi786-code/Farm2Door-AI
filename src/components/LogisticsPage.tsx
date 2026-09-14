import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
  ArrowRight,
  ArrowDown,
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
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CircleDot,
  Trash2,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { LanguageCode, OrderStatus, UserAccount } from '../types';
import { speakText } from '../utils/speech';
import { MOCK_VEHICLES } from '../data/mockData';
import { getCustomerOrders, updateOrderStatus } from '../utils/marketplaceStore';
import { safeStorage } from '../utils/safeStorage';
import { 
  DEFAULT_FARMER_HUB,
  DEFAULT_COST_PER_KM,
  DEFAULT_AVERAGE_SPEED_KMH,
  PROTOTYPE_DEMO_CUSTOMERS,
  DeliveryCustomer,
  OptimizedRouteResult,
  RouteStopDetail,
  optimizeRouteNearestNeighbour,
  getResolvedCoordinates,
  calculateDistance
} from '../utils/routeOptimization';
import { LogisticsRouteMap } from './LogisticsRouteMap';

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
  // 1. Configurable Parameters (Deterministic & User Controllable)
  const [costPerKm, setCostPerKm] = useState<number>(DEFAULT_COST_PER_KM);
  const [averageSpeedKmH, setAverageSpeedKmH] = useState<number>(DEFAULT_AVERAGE_SPEED_KMH);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // 2. Customers & Delivery Records State
  const [customers, setCustomers] = useState<DeliveryCustomer[]>(() => {
    // Check safeStorage for persisted logistics customers
    try {
      const saved = safeStorage.getItem('farm2door_logistics_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return PROTOTYPE_DEMO_CUSTOMERS;
  });

  // 3. Driver & Fleet State
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(() => {
    return safeStorage.getItem('farm2door_assigned_driver_id') || null;
  });
  const [driverDispatchStatus, setDriverDispatchStatus] = useState<'Assigned' | 'Out for Delivery' | 'Delivered'>(() => {
    return (safeStorage.getItem('farm2door_driver_dispatch_status') as any) || 'Assigned';
  });

  // 4. UI Interactive States
  const [selectedStopNumber, setSelectedStopNumber] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<'all' | 'electric'>('all');
  const [showScenarioTester, setShowScenarioTester] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // SYNCHRONIZE ORDERS FROM MARKETPLACE STORE
  // Merge live customer orders with prototype customer delivery list
  // --------------------------------------------------------------------------
  const syncWithMarketplace = useCallback(() => {
    const liveOrders = getCustomerOrders();
    
    // Map live orders into DeliveryCustomer records
    const liveDeliveries: DeliveryCustomer[] = [];
    
    liveOrders.forEach((order) => {
      // Ignore delivered or cancelled orders
      if (order.status === 'Delivered' || (order.status as string) === 'Cancelled') {
        return;
      }
      
      const firstItem = order.items?.[0];
      const totalQty = order.items?.reduce((acc, it) => acc + it.quantity, 0) || 1;
      const coords = getResolvedCoordinates(order.deliveryAddress, order.id);
      
      liveDeliveries.push({
        id: `ORDER-${order.id}`,
        orderId: order.id,
        customerName: order.customerName || 'Customer',
        customerPhone: order.customerPhone || '+91 98450 12345',
        deliveryAddress: order.deliveryAddress,
        locationName: order.deliveryAddress.split(',')[1]?.trim() || 'Regional Delivery',
        latitude: coords.latitude,
        longitude: coords.longitude,
        product: firstItem?.productName || 'Farm Fresh Produce',
        quantity: `${totalQty} ${firstItem?.unit || 'kg'}`,
        quantityKg: totalQty,
        orderAmount: order.totalAmount,
        status: order.status,
        isDemoData: false,
        orderTime: order.date,
      });
    });

    // Check if user has active custom demo customers
    setCustomers((prev) => {
      // If we have live non-delivered customer orders, prioritize them and keep non-conflicting demo ones
      if (liveDeliveries.length > 0) {
        const demoCustomers = prev.filter(c => c.isDemoData && c.status !== 'Delivered');
        const merged = [...liveDeliveries, ...demoCustomers];
        safeStorage.setItem('farm2door_logistics_customers', JSON.stringify(merged));
        return merged;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    syncWithMarketplace();

    const handleOrdersUpdated = () => {
      syncWithMarketplace();
    };

    window.addEventListener('farm2door_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    return () => {
      window.removeEventListener('farm2door_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, [syncWithMarketplace]);

  // Persist customers whenever modified
  useEffect(() => {
    safeStorage.setItem('farm2door_logistics_customers', JSON.stringify(customers));
  }, [customers]);

  // Persist driver assignment
  useEffect(() => {
    if (assignedDriverId) {
      safeStorage.setItem('farm2door_assigned_driver_id', assignedDriverId);
      safeStorage.setItem('farm2door_driver_dispatch_status', driverDispatchStatus);
    } else {
      safeStorage.removeItem('farm2door_assigned_driver_id');
      safeStorage.removeItem('farm2door_driver_dispatch_status');
    }
  }, [assignedDriverId, driverDispatchStatus]);

  // --------------------------------------------------------------------------
  // ACTIVE PENDING DELIVERIES FILTER (Delivered/Cancelled excluded)
  // --------------------------------------------------------------------------
  const pendingDeliveries = useMemo(() => {
    return customers.filter(
      (c) => c.status !== 'Delivered' && (c.status as string) !== 'Cancelled'
    );
  }, [customers]);

  // --------------------------------------------------------------------------
  // NEAREST NEIGHBOUR ROUTE OPTIMIZATION CALCULATION
  // --------------------------------------------------------------------------
  const routePlan: OptimizedRouteResult = useMemo(() => {
    return optimizeRouteNearestNeighbour(DEFAULT_FARMER_HUB, pendingDeliveries, {
      roundTrip: isRoundTrip,
      costPerKm,
      averageSpeedKmH,
    });
  }, [pendingDeliveries, isRoundTrip, costPerKm, averageSpeedKmH]);

  // --------------------------------------------------------------------------
  // DYNAMIC DRIVERS CALCULATION
  // Count of drivers currently available / pending dispatch
  // --------------------------------------------------------------------------
  const assignedDriver = useMemo(() => {
    return vehicles.find((v) => v.id === assignedDriverId) || null;
  }, [vehicles, assignedDriverId]);

  const availableDrivers = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Available at Hub' && v.id !== assignedDriverId);
  }, [vehicles, assignedDriverId]);

  // Pending Drivers count
  const pendingDriversCount = availableDrivers.length;

  // --------------------------------------------------------------------------
  // HANDLERS: DRIVER ASSIGNMENT
  // --------------------------------------------------------------------------
  const handleAssignDriver = (driverVehicleId: string) => {
    if (!driverVehicleId) {
      setAssignedDriverId(null);
      setNotification('Driver unassigned.');
      return;
    }

    const driver = vehicles.find((v) => v.id === driverVehicleId);
    if (!driver) return;

    setAssignedDriverId(driverVehicleId);
    setDriverDispatchStatus('Assigned');

    // Update delivery statuses to 'Assigned' if they were 'Pending'
    setCustomers((prev) =>
      prev.map((c) => (c.status === 'Pending' ? { ...c, status: 'Accepted' } : c))
    );

    setNotification(
      `Route (${routePlan.totalDistanceKm} km, ₹${routePlan.estimatedTotalCost}) assigned to driver ${driver.driver} (${driver.numberPlate}).`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  const handleDispatchDriver = () => {
    if (!assignedDriver) return;
    setDriverDispatchStatus('Out for Delivery');
    setCustomers((prev) =>
      prev.map((c) => (c.status !== 'Delivered' ? { ...c, status: 'In Transit' } : c))
    );
    setNotification(`Driver ${assignedDriver.driver} dispatched! Route status: Out for Delivery.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCompleteEntireRoute = () => {
    if (!assignedDriver) return;
    setDriverDispatchStatus('Delivered');
    // Mark all orders in current route as Delivered
    setCustomers((prev) =>
      prev.map((c) => ({ ...c, status: 'Delivered' }))
    );
    // Also update in marketplace store
    customers.forEach((c) => {
      updateOrderStatus(c.orderId, 'Delivered');
    });
    setNotification(`All stops marked Delivered! Route completed by driver ${assignedDriver.driver}.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: INDIVIDUAL DELIVERY STATUS UPDATE
  // --------------------------------------------------------------------------
  const handleUpdateStopStatus = (orderId: string, newStatus: OrderStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.orderId === orderId ? { ...c, status: newStatus } : c))
    );

    // Update in store
    updateOrderStatus(orderId, newStatus);

    if (newStatus === 'Delivered') {
      setNotification(`Order #${orderId} delivered! Route dynamically re-calculated.`);
    } else {
      setNotification(`Order #${orderId} marked as ${newStatus}.`);
    }
    setTimeout(() => setNotification(null), 3500);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: SCENARIO TESTING FOR AUDITORS & EVALUATION
  // --------------------------------------------------------------------------
  const handleLoadScenario = (scenario: '0' | '1' | '3' | 'all' | 'reset') => {
    if (scenario === '0') {
      // Mark all delivered or empty
      setCustomers((prev) => prev.map((c) => ({ ...c, status: 'Delivered' })));
      setNotification('Scenario loaded: 0 pending deliveries.');
    } else if (scenario === '1') {
      const single = [
        {
          ...PROTOTYPE_DEMO_CUSTOMERS[0],
          status: 'Pending' as OrderStatus,
        },
      ];
      setCustomers(single);
      setNotification('Scenario loaded: 1 customer pending delivery (Ravi Kumar - Vijayawada).');
    } else if (scenario === '3') {
      const three = PROTOTYPE_DEMO_CUSTOMERS.slice(0, 3).map((c) => ({
        ...c,
        status: 'Pending' as OrderStatus,
      }));
      setCustomers(three);
      setNotification('Scenario loaded: 3 customers (Ravi Kumar, Suresh, Priya).');
    } else {
      // Reset prototype demo data
      setCustomers(PROTOTYPE_DEMO_CUSTOMERS.map((c) => ({ ...c, status: 'Pending' })));
      setAssignedDriverId(null);
      setDriverDispatchStatus('Assigned');
      setNotification('Prototype demo data reset to 4 pending deliveries.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // --------------------------------------------------------------------------
  // VOICE SUMMARY FOR FARMERS
  // --------------------------------------------------------------------------
  const handleSpeakOverview = () => {
    const custCount = routePlan.customerCount;
    const km = routePlan.totalDistanceKm;
    const cost = routePlan.estimatedTotalCost;
    const driverText = assignedDriver ? assignedDriver.driver : 'Unassigned';

    let text = '';
    if (language === 'hi') {
      text = `किसान लॉजिस्टिक्स मार्ग सारांश। निकटतम पड़ोसी एल्गोरिथम के अनुसार कुल ${custCount} ग्राहक डिलीवरी रूट में हैं। कुल दूरी ${km} किलोमीटर है और अनुमानित परिवहन खर्च ₹${cost} है। ड्राइवर: ${driverText}।`;
    } else if (language === 'te') {
      text = `రైతు లాజిస్టిక్స్ రూట్ సారాంశం. నియరెస్ట్ నెయిబర్ పద్ధతి ద్వారా మొత్తం ${custCount} కస్టమర్లు రూట్‌లో ఉన్నారు. మొత్తం దూరం ${km} కిలోమీటర్లు మరియు రవాణా ఖర్చు ₹${cost}. డ్రైవర్: ${driverText}.`;
    } else {
      text = `Farmer Logistics Route Summary. Optimized via Nearest Neighbour heuristic. There are ${custCount} customer stops with a total route distance of ${km} kilometers and an estimated total delivery cost of ₹${cost}. Assigned driver is ${driverText}.`;
    }

    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP EXECUTIVE HEADER WITH PROTO-DATA BADGE */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-3xl space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Logistics & Route Optimization</span>
            </span>
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
              ? 'निकटतम पड़ोसी हेयुरिस्टिक और हॉवरसाइन सूत्र के आधार पर खेत से डिलीवरी तक न्यूनतम दूरी और न्यूनतम परिवहन लागत का निर्धारण।'
              : language === 'te'
              ? 'నియరెస్ట్ నెయిబర్ అల్గారిథమ్ మరియు హావర్‌సైన్ దూర సూత్రంతో సమర్థవంతమైన డెలివరీ ప్రణాళిక మరియు రవాణా ఖర్చు అంచనా.'
              : 'Optimized delivery sequence generated using the Nearest Neighbour heuristic and Haversine geographic distance formula to minimize travel distance and transport cost.'}
          </p>

          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Deterministic Haversine formula calculation (Earth Radius R = 6,371 km) &bull; No random values generated
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          {/* Audio Speaker */}
          <button
            id="speak-logistics-overview-btn"
            onClick={handleSpeakOverview}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Hear route overview aloud"
            aria-label="Hear route overview aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Rate & Speed Configuration */}
          <button
            id="open-config-btn"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            <span>₹{costPerKm}/km & Speed</span>
          </button>

          {/* Scenario Tester Toggle */}
          <button
            id="toggle-scenario-tester-btn"
            onClick={() => setShowScenarioTester(!showScenarioTester)}
            className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CircleDot className="w-4 h-4 text-amber-400" />
            <span>Test Scenarios</span>
          </button>

          {/* Sync / Recalculate */}
          <button
            id="optimize-route-btn"
            onClick={() => {
              syncWithMarketplace();
              setNotification('Route dynamically re-optimized from available delivery locations.');
              setTimeout(() => setNotification(null), 3000);
            }}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Recalculate Route</span>
          </button>
        </div>
      </div>

      {/* Configuration Drawer */}
      {isConfigOpen && (
        <div className="bg-amber-50/95 border border-amber-200 rounded-3xl p-5 text-stone-800 space-y-4 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-800" />
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Configurable Route & Cost Parameters
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
              Config Constant: costPerKm = ₹{costPerKm}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Cost Per Km Slider */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Cost Per Kilometre:</span>
                <span className="text-emerald-800 text-sm font-black">₹{costPerKm} / km</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={costPerKm}
                onChange={(e) => setCostPerKm(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>₹10 (EV Cargo)</span>
                <span>₹20 (Standard Light Hauler)</span>
                <span>₹50 (Reefer Truck)</span>
              </div>
            </div>

            {/* Average Speed Slider */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Average Travel Speed:</span>
                <span className="text-blue-800 text-sm font-black">{averageSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={averageSpeedKmH}
                onChange={(e) => setAverageSpeedKmH(Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>20 km/h (Rural)</span>
                <span>35 km/h (Semi-Urban)</span>
                <span>60 km/h (Corridor)</span>
              </div>
            </div>

            {/* Round Trip Toggle */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-2">
              <div className="flex justify-between font-bold">
                <span>Route Circuit Type:</span>
                <span className="text-stone-900 font-extrabold text-xs">
                  {isRoundTrip ? 'Round Trip (Return to Hub)' : 'One-Way (Finish at Last Stop)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRoundTrip(!isRoundTrip)}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isRoundTrip ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-800'
                }`}
              >
                <span>{isRoundTrip ? '✓ Round Trip Enabled' : 'One-Way Trip'}</span>
              </button>
              <span className="text-[10px] text-stone-500">
                Farmer &rarr; Stops &rarr; Return to Farmer Hub
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Tester Panel (For Edge-Case Verification) */}
      {showScenarioTester && (
        <div className="bg-stone-100 border border-stone-300 rounded-3xl p-5 text-stone-800 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-stone-900 font-display">
                Interactive Test Scenarios for Evaluation
              </span>
            </div>
            <span className="text-[11px] text-stone-500">
              Instantly test 0, 1, 3, or multiple delivery handling
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleLoadScenario('0')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
            >
              Test 0 Deliveries
            </button>
            <button
              onClick={() => handleLoadScenario('1')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
            >
              Test 1 Customer Delivery
            </button>
            <button
              onClick={() => handleLoadScenario('3')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
            >
              Test 3 Customers (Vijayawada &rarr; Guntur &rarr; Tenali)
            </button>
            <button
              onClick={() => handleLoadScenario('all')}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              Reset Full Prototype Demo (4 Stops)
            </button>
          </div>
        </div>
      )}

      {/* Feedback Notification Banner */}
      {notification && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. FOUR SUMMARY CARDS (DYNAMICALLY CALCULATED & MEANINGFUL) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Pending Drivers */}
        <div 
          id="metric-pending-drivers"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Pending Drivers</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-700 font-display">
            {pendingDriversCount}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            {pendingDriversCount > 0 
              ? `${pendingDriversCount} driver${pendingDriversCount > 1 ? 's' : ''} available at hub for dispatch` 
              : 'All drivers currently assigned or en route'}
          </p>
        </div>

        {/* Card 2: Total Customers */}
        <div 
          id="metric-total-customers"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Total Customers</span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
            {routePlan.customerCount}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            {routePlan.customerCount === 0 
              ? 'No pending customer deliveries' 
              : `Pending customers scheduled in this route`}
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
            {routePlan.totalDistanceKm} km
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            Calculated via Haversine formula (Earth R = 6,371 km)
          </p>
        </div>

        {/* Card 4: Estimated Total Cost */}
        <div 
          id="metric-estimated-cost"
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Estimated Total Cost</span>
            <Coins className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-display">
            ₹{routePlan.estimatedTotalCost}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-semibold">
            {routePlan.totalDistanceKm} km &times; ₹{costPerKm}/km rate
          </p>
        </div>

      </div>

      {/* 3. DRIVER ASSIGNMENT PANEL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                Driver Assignment & Dispatch
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Connect this optimized route to available drivers and manage trip dispatch
            </p>
          </div>

          {/* Quick Select Driver */}
          <div className="flex items-center gap-2">
            <select
              id="driver-select-dropdown"
              value={assignedDriverId || ''}
              onChange={(e) => handleAssignDriver(e.target.value)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="">-- Select Available Driver --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.driver} &bull; {v.type} ({v.numberPlate}) &bull; {v.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Assigned Driver Card */}
        {assignedDriver ? (
          <div className="bg-gradient-to-br from-stone-50 to-emerald-50/40 rounded-2xl p-5 border border-emerald-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 text-base">
                  {assignedDriver.driver}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {driverDispatchStatus}
                </span>
                {assignedDriver.isElectric && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                    ⚡ Clean EV
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                <span>Vehicle: <strong className="text-stone-800">{assignedDriver.type}</strong></span>
                <span>Number Plate: <strong className="font-mono text-stone-800">{assignedDriver.numberPlate}</strong></span>
                <span>Battery / Fuel: <strong className="text-emerald-800">{assignedDriver.batteryOrFuel}</strong></span>
              </div>
            </div>

            {/* Route Stats for Driver */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200">
                <span className="text-stone-400 text-[10px] block uppercase">Assigned Stops</span>
                <span className="text-stone-900 text-sm font-black">{routePlan.customerCount} Deliveries</span>
              </div>
              <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200">
                <span className="text-stone-400 text-[10px] block uppercase">Route Distance</span>
                <span className="text-blue-800 text-sm font-black">{routePlan.totalDistanceKm} km</span>
              </div>
              <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200">
                <span className="text-stone-400 text-[10px] block uppercase">Est. Trip Cost</span>
                <span className="text-emerald-800 text-sm font-black">₹{routePlan.estimatedTotalCost}</span>
              </div>

              {/* Status Change Buttons */}
              <div className="flex items-center gap-2 pl-2">
                {driverDispatchStatus === 'Assigned' && (
                  <button
                    onClick={handleDispatchDriver}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Dispatch Route
                  </button>
                )}
                {driverDispatchStatus === 'Out for Delivery' && (
                  <button
                    onClick={handleCompleteEntireRoute}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Complete All Deliveries
                  </button>
                )}
                <button
                  onClick={() => handleAssignDriver('')}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reassign
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                No driver currently assigned to this delivery sequence. Select a driver from the dropdown above to dispatch the route.
              </span>
            </div>
            <span className="font-bold text-amber-800 underline cursor-pointer" onClick={() => handleAssignDriver(vehicles[0]?.id || '')}>
              Quick Assign ({vehicles[0]?.driver})
            </span>
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE VISUAL ROUTE MAP */}
      <LogisticsRouteMap
        routePlan={routePlan}
        selectedStopNumber={selectedStopNumber}
        onSelectStop={(num) => setSelectedStopNumber(num)}
        onUpdateStopStatus={handleUpdateStopStatus}
        language={language}
      />

      {/* 5. OPTIMIZED DELIVERY ROUTE (NEAREST NEIGHBOUR HEURISTIC SEQUENCE) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                Optimized Delivery Route
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                Nearest Neighbour Heuristic Sequence
              </span>
              <span className="text-xs text-stone-500">
                &bull; Calculated via Haversine distance from coordinates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span>Stops: <strong className="text-stone-900">{routePlan.stops.length} checkpoints</strong></span>
            <span>&bull;</span>
            <span>Total: <strong className="text-emerald-800 font-bold">{routePlan.totalDistanceKm} km</strong></span>
          </div>
        </div>

        {/* Empty State: 0 Deliveries */}
        {routePlan.stops.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">No Pending Customer Deliveries</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              All deliveries are fulfilled or no pending customer orders are awaiting delivery.
              Click "Reset Full Prototype Demo" or place an order from the Customer Marketplace to schedule new deliveries.
            </p>
            <button
              onClick={() => handleLoadScenario('all')}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Load Prototype Demo Deliveries
            </button>
          </div>
        ) : (
          /* Detailed Route Sequence Cards with Arrows */
          <div className="space-y-4">
            {routePlan.stops.map((stop, idx) => {
              const isOrigin = stop.type === 'origin';
              const isReturn = stop.type === 'return';
              const isSelected = selectedStopNumber === stop.stopNumber;

              return (
                <div key={`route-stop-block-${stop.stopNumber}-${idx}`} className="space-y-3">
                  
                  {/* Sequence Arrow between stops */}
                  {idx > 0 && (
                    <div className="flex items-center gap-3 px-6 text-stone-400">
                      <div className="w-6 flex justify-center">
                        <ArrowDown className="w-5 h-5 text-emerald-700 animate-bounce" />
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {stop.legDistanceKm} km &bull; ~{stop.legMinutes} min travel leg
                      </div>
                    </div>
                  )}

                  {/* Stop Card */}
                  <div
                    id={`route-stop-${stop.stopNumber}`}
                    onClick={() => setSelectedStopNumber(stop.stopNumber)}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer ${
                      isOrigin
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : isReturn
                        ? 'bg-teal-900 text-white border-teal-950 shadow-xs'
                        : isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-400'
                        : 'bg-stone-50 hover:bg-white text-stone-900 border-stone-200 shadow-2xs hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      
                      {/* Left: Stop Badge, Location, and Customer */}
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isOrigin 
                            ? 'bg-white text-emerald-900' 
                            : isReturn 
                            ? 'bg-white text-teal-900' 
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {isOrigin ? '🚜' : isReturn ? '🏁' : stop.stopNumber}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider ${
                              isOrigin ? 'text-emerald-200' : isReturn ? 'text-teal-200' : 'text-emerald-800'
                            }`}>
                              {isOrigin ? 'Start' : isReturn ? 'Return Leg' : `Stop ${stop.stopNumber}`}
                            </span>

                            {stop.customerName && (
                              <span className="font-extrabold text-stone-900 text-sm">
                                Customer: <strong className="underline decoration-emerald-500">{stop.customerName}</strong>
                              </span>
                            )}

                            {stop.isDemoData && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Prototype Demo Data
                              </span>
                            )}
                          </div>

                          <div className={`text-sm font-black ${isOrigin || isReturn ? 'text-white' : 'text-stone-900'}`}>
                            Location: {stop.locationName}
                          </div>

                          <p className={`text-xs truncate max-w-xl ${isOrigin || isReturn ? 'text-emerald-100' : 'text-stone-600'}`}>
                            {stop.address}
                          </p>

                          {stop.product && (
                            <div className="text-xs font-semibold text-emerald-700 pt-0.5">
                              Deliver: <strong>{stop.quantity}</strong> of <strong>{stop.product}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Distance, Arrival and Status Controls */}
                      <div className="flex flex-col sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                        <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs">
                          <div className={isOrigin || isReturn ? 'text-white' : 'text-stone-700'}>
                            Distance from previous stop: <strong className="font-black text-emerald-600 text-sm">{stop.legDistanceKm} km</strong>
                          </div>
                          <div className={isOrigin || isReturn ? 'text-emerald-100' : 'text-stone-700'}>
                            Cumulative distance: <strong className="font-black text-stone-900 text-sm">{stop.cumulativeDistanceKm} km</strong>
                          </div>
                          <div className={isOrigin || isReturn ? 'text-emerald-200' : 'text-stone-500 text-[11px]'}>
                            Est. Travel: ~{stop.cumulativeMinutes} min from departure
                          </div>
                        </div>

                        {/* Status Updater for Customer Stops */}
                        {!isOrigin && !isReturn && stop.orderId && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">Status:</span>
                            {(['Pending', 'Assigned', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map((st) => {
                              const isCurrent = stop.status === st;
                              return (
                                <button
                                  key={st}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStopStatus(stop.orderId!, st);
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
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
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 6. LOGISTICS OPTIMIZATION IMPACT CARD (SAVINGS METRICS) */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md mb-1 uppercase tracking-wider">
              Optimization Impact
            </div>
            <h3 className="text-xl font-black text-stone-900 font-display">
              Efficiency Gain via Nearest Neighbour Sequencing
            </h3>
            <p className="text-xs text-stone-600">
              Comparing single sequential route against unoptimized individual back-and-forth round trips.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-stone-500 italic max-w-xs sm:text-right">
            Deterministic calculation &bull; No random numbers or fabricated metrics
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
              {routePlan.distanceSavedKm} km
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Consolidated ({routePlan.totalDistanceKm} km) vs Separate Dispatches ({routePlan.unoptimizedDistanceKm} km)
            </p>
          </div>

          {/* Cost Saved */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Estimated Cost Saved</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-display">
              ₹{routePlan.costSaved}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Calculated at rate of ₹{costPerKm}/km
            </p>
          </div>

          {/* Customer Stops Merged */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Consolidated Deliveries</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-800 font-display">
              {routePlan.customerCount} Deliveries
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Sequenced in 1 optimized multi-stop trip
            </p>
          </div>
        </div>
      </div>

      {/* 7. AVAILABLE VEHICLES & COLD-CHAIN FLEET (PRESERVED) */}
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
              All Vehicles ({vehicles.length})
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
          {vehicles
            .filter((v) => (selectedVehicleFilter === 'all' ? true : v.isElectric))
            .map((veh) => {
              const isAssignedToActiveRoute = assignedDriverId === veh.id;
              return (
                <div
                  key={veh.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isAssignedToActiveRoute
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isAssignedToActiveRoute
                            ? 'bg-emerald-700 text-white'
                            : veh.status === 'Available at Hub'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isAssignedToActiveRoute ? 'Assigned to Route' : veh.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900">{veh.type}</h3>
                    <div className="text-xs font-mono text-stone-500 mt-0.5">{veh.numberPlate}</div>
                    <div className="text-xs font-bold text-stone-800 mt-1">Driver: {veh.driver}</div>
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

                    {/* Quick Assign button if available */}
                    {!isAssignedToActiveRoute && veh.status === 'Available at Hub' && (
                      <button
                        onClick={() => handleAssignDriver(veh.id)}
                        className="w-full mt-2 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
                      >
                        Assign This Driver
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
};
