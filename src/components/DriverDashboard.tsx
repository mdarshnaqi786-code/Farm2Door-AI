import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Volume2,
  Sparkles,
  Package,
  Layers,
  Zap,
  Leaf,
  RotateCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  Check,
  DollarSign
} from 'lucide-react';
import { LanguageCode, OrderStatus, UserAccount } from '../types';
import { safeStorage } from '../utils/safeStorage';
import { speakText } from '../utils/speech';
import { getCustomerOrders, updateOrderStatus } from '../utils/marketplaceStore';
import { 
  DEFAULT_FARMER_HUB, 
  PROTOTYPE_DEMO_CUSTOMERS, 
  DeliveryCustomer, 
  calculateDistance 
} from '../utils/routeOptimization';

interface DriverDashboardProps {
  currentUser: UserAccount;
  language?: LanguageCode;
  onLogout: () => void;
  onStartSpeech?: () => void;
  onEndSpeech?: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  language = 'en',
  onLogout,
  onStartSpeech = () => {},
  onEndSpeech = () => {},
}) => {
  // 1. Driver Availability Status
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>(() => {
    if (currentUser.driverStatus === 'busy' || currentUser.driverStatus === 'offline') {
      return currentUser.driverStatus;
    }
    return 'available';
  });

  // 2. Dispatch / Route Status (shared with Farmer's Logistics Page)
  const [dispatchStatus, setDispatchStatus] = useState<'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered'>(() => {
    const saved = safeStorage.getItem('farm2door_driver_dispatch_status');
    if (saved === 'Out for Delivery' || saved === 'Delivered' || saved === 'Assigned' || saved === 'Picked Up') {
      return saved as any;
    }
    return 'Assigned';
  });

  // 3. Assigned Deliveries State
  const [deliveries, setDeliveries] = useState<DeliveryCustomer[]>(() => {
    try {
      const saved = safeStorage.getItem('farm2door_logistics_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load logistics customers:', e);
    }
    return PROTOTYPE_DEMO_CUSTOMERS;
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  // Synchronize with customer orders & logistics storage
  const syncDeliveries = useCallback(() => {
    try {
      const saved = safeStorage.getItem('farm2door_logistics_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDeliveries(parsed);
        }
      }
      const savedStatus = safeStorage.getItem('farm2door_driver_dispatch_status');
      if (savedStatus) {
        setDispatchStatus(savedStatus as any);
      }
    } catch (e) {
      console.warn('Sync error:', e);
    }
  }, []);

  useEffect(() => {
    syncDeliveries();

    const handleUpdate = () => {
      syncDeliveries();
    };

    window.addEventListener('farm2door_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('farm2door_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncDeliveries]);

  // Update driver status in session & storage
  const handleToggleStatus = (newStatus: 'available' | 'busy' | 'offline') => {
    setDriverStatus(newStatus);
    const updated = { ...currentUser, driverStatus: newStatus };
    safeStorage.setItem('farm2door_user_session', JSON.stringify(updated));
    setNotification(`Status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Dispatch stage transitions
  const handleUpdateDispatchStage = (newStage: 'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered') => {
    setDispatchStatus(newStage);
    safeStorage.setItem('farm2door_driver_dispatch_status', newStage);
    safeStorage.setItem('farm2door_assigned_driver_id', currentUser.id);

    if (newStage === 'Picked Up') {
      setDeliveries((prev) =>
        prev.map((c) => (c.status !== 'Delivered' ? { ...c, status: 'In Transit' as OrderStatus } : c))
      );
      safeStorage.setItem(
        'farm2door_logistics_customers',
        JSON.stringify(
          deliveries.map((c) => (c.status !== 'Delivered' ? { ...c, status: 'In Transit' as OrderStatus } : c))
        )
      );
      setNotification('Produce picked up from Farm Consolidation Hub. Ready for delivery run!');
    } else if (newStage === 'Out for Delivery') {
      setDeliveries((prev) =>
        prev.map((c) => (c.status !== 'Delivered' ? { ...c, status: 'In Transit' as OrderStatus } : c))
      );
      safeStorage.setItem(
        'farm2door_logistics_customers',
        JSON.stringify(
          deliveries.map((c) => (c.status !== 'Delivered' ? { ...c, status: 'In Transit' as OrderStatus } : c))
        )
      );
      setNotification('Route started! Deliveries are Out for Delivery.');
    } else if (newStage === 'Delivered') {
      setDeliveries((prev) =>
        prev.map((c) => ({ ...c, status: 'Delivered' as OrderStatus }))
      );
      safeStorage.setItem(
        'farm2door_logistics_customers',
        JSON.stringify(deliveries.map((c) => ({ ...c, status: 'Delivered' as OrderStatus })))
      );
      deliveries.forEach((c) => {
        updateOrderStatus(c.orderId, 'Delivered');
      });
      setNotification('Congratulations! All assigned deliveries marked Delivered.');
    }

    window.dispatchEvent(new Event('farm2door_orders_updated'));
    setTimeout(() => setNotification(null), 4000);
  };

  // Mark single stop delivered
  const handleMarkStopDelivered = (orderId: string) => {
    const updated = deliveries.map((c) =>
      c.orderId === orderId ? { ...c, status: 'Delivered' as OrderStatus } : c
    );
    setDeliveries(updated);
    safeStorage.setItem('farm2door_logistics_customers', JSON.stringify(updated));
    updateOrderStatus(orderId, 'Delivered');

    // Check if all are delivered
    const remaining = updated.filter((c) => c.status !== 'Delivered');
    if (remaining.length === 0) {
      setDispatchStatus('Delivered');
      safeStorage.setItem('farm2door_driver_dispatch_status', 'Delivered');
      setNotification(`Stop delivered! All route deliveries now successfully completed!`);
    } else {
      setNotification(`Order #${orderId} marked as Delivered to customer.`);
    }

    window.dispatchEvent(new Event('farm2door_orders_updated'));
    setTimeout(() => setNotification(null), 3500);
  };

  // Calculations & KPIs
  const pendingStops = useMemo(() => {
    return deliveries.filter((d) => d.status !== 'Delivered');
  }, [deliveries]);

  const deliveredStops = useMemo(() => {
    return deliveries.filter((d) => d.status === 'Delivered');
  }, [deliveries]);

  const totalKg = useMemo(() => {
    return deliveries.reduce((acc, d) => acc + (d.quantityKg || 10), 0);
  }, [deliveries]);

  const totalRevenue = useMemo(() => {
    return deliveries.reduce((acc, d) => acc + (d.orderAmount || 500), 0);
  }, [deliveries]);

  // Read route aloud
  const handleSpeakRouteSummary = () => {
    const text = language === 'hi'
      ? `नमस्ते ${currentUser.fullName}. आपकी वाहन संख्या ${currentUser.vehicleNumber || 'KA-51-EV-9012'} है। आज कुल ${deliveries.length} डिलीवरी स्टॉप हैं, जिसमें से ${pendingStops.length} डिलीवरी बाकी हैं। वर्तमान स्थिति: ${dispatchStatus}.`
      : language === 'te'
      ? `నమస్తే ${currentUser.fullName}. మీ వాహనం సంఖ్య ${currentUser.vehicleNumber || 'KA-51-EV-9012'}. ఈ రోజు మొత్తం ${deliveries.length} డెలివరీ స్టాప్‌లు ఉన్నాయి. మిగిలినవి ${pendingStops.length}. ప్రస్తుత స్థితి: ${dispatchStatus}.`
      : `Hello ${currentUser.fullName}. Your vehicle number is ${currentUser.vehicleNumber || 'KA-51-EV-9012'}. You have ${deliveries.length} total stops with ${pendingStops.length} remaining to be delivered. Current route status is ${dispatchStatus}.`;

    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{notification}</span>
          </div>
        )}

        {/* Header / Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Driver Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                <Truck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                    🚚 Registered Driver
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified License</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                  {currentUser.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-stone-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-bold text-stone-900">{currentUser.contact}</span>
                  </span>
                  {currentUser.email && (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <span>{currentUser.email}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">
                      DL: {currentUser.drivingLicenseNumber || 'DL-0420190038491'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Card & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Vehicle Pill */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xs font-black uppercase tracking-wider text-stone-500">
                    Vehicle Number & Type
                  </div>
                  <div className="text-sm font-black font-mono text-stone-900">
                    {currentUser.vehicleNumber || 'KA-51-EV-9012'}
                  </div>
                  <div className="text-2xs text-stone-600 font-medium">
                    {currentUser.vehicleType || 'Electric Cargo Van (Mahindra Zor Grand)'}
                  </div>
                </div>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                <button
                  id="driver-status-available-btn"
                  onClick={() => handleToggleStatus('available')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    driverStatus === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                  title="Mark available for new route assignments"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Online</span>
                </button>
                <button
                  id="driver-status-busy-btn"
                  onClick={() => handleToggleStatus('busy')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    driverStatus === 'busy'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                  title="Currently on delivery run"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-200"></span>
                  <span>En Route</span>
                </button>
                <button
                  id="driver-status-offline-btn"
                  onClick={() => handleToggleStatus('offline')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    driverStatus === 'offline'
                      ? 'bg-stone-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                  title="Offline / Off-duty"
                >
                  <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                  <span>Offline</span>
                </button>
              </div>

              {/* Audio Readout */}
              <button
                id="driver-speak-summary-btn"
                onClick={handleSpeakRouteSummary}
                className="w-11 h-11 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                title="Hear route briefing aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Sign out */}
              <button
                id="driver-logout-btn"
                onClick={onLogout}
                className="w-11 h-11 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-all cursor-pointer"
                title="Sign out of Driver Account"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Dispatch Stage & Route Progression Action Bar */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-200 mb-1.5">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Live Route Dispatch Stage</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                  Stage: {dispatchStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  dispatchStatus === 'Delivered' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : dispatchStatus === 'Out for Delivery'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                }`}>
                  {pendingStops.length} Pending • {deliveredStops.length} Delivered
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 max-w-xl">
                Changes made here sync in real-time with the Farmer Logistics dashboard and Customer Order Tracking.
              </p>
            </div>

            {/* Stage Progress Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="driver-stage-assigned-btn"
                onClick={() => handleUpdateDispatchStage('Assigned')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  dispatchStatus === 'Assigned'
                    ? 'bg-white text-blue-950 shadow-md font-black'
                    : 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/50'
                }`}
              >
                1. Assigned
              </button>

              <button
                id="driver-stage-picked-up-btn"
                onClick={() => handleUpdateDispatchStage('Picked Up')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  dispatchStatus === 'Picked Up'
                    ? 'bg-white text-blue-950 shadow-md font-black'
                    : 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/50'
                }`}
              >
                2. Picked Up
              </button>

              <button
                id="driver-stage-out-delivery-btn"
                onClick={() => handleUpdateDispatchStage('Out for Delivery')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  dispatchStatus === 'Out for Delivery'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-black'
                    : 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/50'
                }`}
              >
                3. Out for Delivery
              </button>

              <button
                id="driver-stage-delivered-btn"
                onClick={() => handleUpdateDispatchStage('Delivered')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  dispatchStatus === 'Delivered'
                    ? 'bg-emerald-400 text-emerald-950 shadow-md font-black'
                    : 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/50'
                }`}
              >
                4. All Delivered ✓
              </button>
            </div>

          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">Total Stops</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{deliveries.length} Stops</div>
            <div className="text-2xs text-stone-500 font-medium mt-0.5">
              {deliveredStops.length} completed • {pendingStops.length} remaining
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">Cargo Payload</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalKg} kg</div>
            <div className="text-2xs text-emerald-700 font-medium mt-0.5">Fresh direct farm harvest</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">Estimated Distance</span>
              <Navigation className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">42.8 km</div>
            <div className="text-2xs text-stone-500 font-medium mt-0.5">Optimized Nearest-Neighbour</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">Green Fleet Offset</span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-800">11.6 kg CO₂</div>
            <div className="text-2xs text-emerald-600 font-medium mt-0.5">Electric zero tailpipe delivery</div>
          </div>
        </div>

        {/* Main Content: Assigned Deliveries List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Assigned Delivery Run Manifest
                </h2>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Dispatch Hub: <strong className="text-stone-800">{DEFAULT_FARMER_HUB.name}</strong> ({DEFAULT_FARMER_HUB.district}, {DEFAULT_FARMER_HUB.state})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="driver-refresh-manifest-btn"
                onClick={syncDeliveries}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Sync Manifest</span>
              </button>
            </div>
          </div>

          {/* Delivery Stops List */}
          <div className="space-y-4">
            {deliveries.map((stop, index) => {
              const isDelivered = stop.status === 'Delivered';
              return (
                <div
                  key={stop.id}
                  id={`driver-stop-card-${stop.orderId}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDelivered
                      ? 'bg-emerald-50/40 border-emerald-200/80 opacity-90'
                      : 'bg-white border-stone-200 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    
                    {/* Stop Info */}
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        isDelivered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {isDelivered ? <Check className="w-5 h-5 stroke-[3]" /> : index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-stone-900">
                            {stop.customerName}
                          </span>
                          <span className="text-2xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            Order #{stop.orderId}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : stop.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {stop.status || 'Pending'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-stone-600">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-stone-900">{stop.deliveryAddress}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500">
                          <span className="font-bold text-stone-800">
                            🌾 {stop.product} • {stop.quantity}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">
                            ₹{stop.orderAmount}
                          </span>
                          {stop.orderTime && (
                            <>
                              <span>•</span>
                              <span className="text-2xs">{stop.orderTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      {/* Call Customer */}
                      {stop.customerPhone && (
                        <a
                          id={`driver-call-btn-${stop.orderId}`}
                          href={`tel:${stop.customerPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{stop.customerPhone}</span>
                        </a>
                      )}

                      {/* Open Maps Directions */}
                      <a
                        id={`driver-nav-btn-${stop.orderId}`}
                        href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude || 17.6868},${stop.longitude || 83.2185}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-700" />
                        <span>Navigate</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>

                      {/* Confirm Delivered Button */}
                      {!isDelivered ? (
                        <button
                          id={`driver-mark-delivered-btn-${stop.orderId}`}
                          onClick={() => handleMarkStopDelivered(stop.orderId)}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Delivered</span>
                        </button>
                      ) : (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Direct Help & Safety Guidance for Drivers */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">Cold Chain & Quality Protocol:</span>
              <span>Ensure produce crates remain shaded and ventilated. Deliver Grade-A produce directly to customer doorstep within 45 minutes of dispatch.</span>
            </div>
          </div>
          <div className="shrink-0 text-stone-500 font-mono text-2xs">
            Driver Support Desk: +91 80000 45678
          </div>
        </div>

      </div>
    </div>
  );
};
