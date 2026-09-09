import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Volume2, 
  ArrowRight,
  Phone,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Info,
  AlertCircle
} from 'lucide-react';
import { speakText } from '../utils/speech';
import { LanguageCode, CustomerOrder } from '../types';
import { getCustomerOrders } from '../utils/marketplaceStore';

interface CustomerOrdersViewProps {
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  onContinueShopping: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  language,
  onStartSpeech,
  onEndSpeech,
  onContinueShopping,
}) => {
  const [selectedOrderTab, setSelectedOrderTab] = useState<'active' | 'completed'>('active');
  const [allOrders, setAllOrders] = useState<CustomerOrder[]>([]);

  const loadOrders = () => {
    setAllOrders(getCustomerOrders());
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('farm2door_orders_updated', handleUpdate);
    return () => window.removeEventListener('farm2door_orders_updated', handleUpdate);
  }, []);

  const activeOrders = allOrders.filter((o) => o.status !== 'Delivered');
  const completedOrders = allOrders.filter((o) => o.status === 'Delivered');

  const handleSpeakOrder = (text: string) => {
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  // Helper to map order status to human delivery milestone
  const getDeliveryMilestoneText = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          headline: 'Order Confirmed with Farm Hub',
          subtext: 'Plucking & sorting at harvest site',
          eta: 'Est. 90 mins',
          step: 1,
        };
      case 'Accepted':
        return {
          headline: 'Harvest Accepted by FPO',
          subtext: 'Packaging into eco-crates',
          eta: 'Est. 60 mins',
          step: 1,
        };
      case 'Ready for Delivery':
        return {
          headline: 'Ready at Regional Agri Hub',
          subtext: 'Cold-chain EV vehicle assigned',
          eta: 'Est. 45 mins',
          step: 2,
        };
      case 'In Transit':
        return {
          headline: '🚚 Your order is on the way',
          subtext: 'In transit via nearest-neighbor optimized route',
          eta: 'Est. 25 mins',
          step: 3,
        };
      case 'Delivered':
        return {
          headline: '✅ Successfully Delivered',
          subtext: 'Handed over directly to customer',
          eta: 'Delivered',
          step: 4,
        };
      default:
        return {
          headline: 'Order Processing',
          subtext: 'Coordinating with farmer cluster',
          eta: 'Est. 45 mins',
          step: 2,
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Farm-to-Door Live Tracking</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-200">
              Prototype Demo Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            My Orders & Delivery Tracking
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Real-time status tracking with direct cultivator price transparency. (Estimated logistics model — no real-time GPS claimed).
          </p>
        </div>

        {/* Action Button */}
        <button
          id="shop-more-btn"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop Fresh Produce</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          id="tab-active-orders"
          onClick={() => setSelectedOrderTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            selectedOrderTab === 'active'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Active Deliveries ({activeOrders.length})
        </button>
        <button
          id="tab-completed-orders"
          onClick={() => setSelectedOrderTab('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            selectedOrderTab === 'completed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Past Orders ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {selectedOrderTab === 'active' ? (
        <div className="space-y-6">
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800 font-display">No Active Deliveries Right Now</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Place an order from the Consumer Marketplace to see live route calculation, direct farmer payment split, and step-by-step dispatch tracking.
              </p>
              <button
                onClick={onContinueShopping}
                className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Farm Produce</span>
              </button>
            </div>
          ) : (
            activeOrders.map((order) => {
              const milestone = getDeliveryMilestoneText(order.status);
              const firstItem = order.items[0];
              const farmerPayout = order.farmerPayout || Math.round(order.totalAmount * 0.8);
              const logisticsCost = Math.round(order.totalAmount * 0.12);
              const platformFee = order.totalAmount - farmerPayout - logisticsCost;

              const speechSummary = `Order ${order.id} is currently ${order.status}. ${milestone.headline}. Total amount is ₹${order.totalAmount} with direct farmer share of ₹${farmerPayout}.`;

              return (
                <div
                  key={order.id}
                  id={`customer-order-${order.id}`}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-stone-900 text-lg">
                          Order #{order.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          order.status === 'In Transit'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Placed {order.date}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-bold">{milestone.eta}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Speaker Button to Hear Order Info */}
                      <button
                        onClick={() => handleSpeakOrder(speechSummary)}
                        className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        title="Hear delivery status aloud"
                        aria-label="Hear delivery status aloud"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      {/* Delivery Verification Pin */}
                      <div className="bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl text-center">
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                          Delivery PIN
                        </div>
                        <div className="text-base font-black text-stone-900 font-mono tracking-wider">
                          {order.id.replace(/\D/g, '').slice(-4) || '7392'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information Banner */}
                  <div className="bg-emerald-50/80 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span className="font-extrabold text-stone-900 text-sm">
                          {milestone.headline}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                        Estimated Arrival: {milestone.eta}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                      <span><strong>Delivery Location:</strong> {order.deliveryAddress || 'Customer Residence, Sector 4'}</span>
                    </div>

                    {/* Progress Milestones: Order Confirmed -> Preparing -> In Transit -> Delivered */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                      <div className={`p-2 rounded-xl flex items-center gap-2 ${milestone.step >= 1 ? 'bg-emerald-100/70 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>1. Confirmed</span>
                      </div>
                      <div className={`p-2 rounded-xl flex items-center gap-2 ${milestone.step >= 2 ? 'bg-emerald-100/70 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>2. Plucked & Sorted</span>
                      </div>
                      <div className={`p-2 rounded-xl flex items-center gap-2 ${milestone.step >= 3 ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-400'}`}>
                        <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>3. In Transit</span>
                      </div>
                      <div className={`p-2 rounded-xl flex items-center gap-2 ${milestone.step >= 4 ? 'bg-emerald-100/70 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                        <CheckCircle2 className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>4. Delivered</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 italic pt-1">
                      Note: Estimated logistics schedule • Prototype demonstration (No real-time GPS claimed).
                    </div>
                  </div>

                  {/* Items & Farmer Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Items */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Purchased Fresh Produce
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm py-1 border-b border-stone-100 last:border-none"
                          >
                            <span className="font-medium text-stone-800">
                              {item.productName} &times; {item.quantity} {item.unit}
                            </span>
                            <span className="font-bold text-stone-900">₹{item.pricePerUnit * item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-base font-black pt-2 border-t border-stone-200">
                          <span>Total Paid</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Farmer Rupee Split */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Direct Price Split Breakdown</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-200/60">
                        <span className="text-stone-600">Cultivator Farm Share:</span>
                        <span className="font-bold text-emerald-800">₹{farmerPayout} (~80%)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-200/60">
                        <span className="text-stone-600">Electric Cold-Chain Logistics:</span>
                        <span className="font-semibold text-stone-700">₹{logisticsCost}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-600">Platform & AI Matching Fee:</span>
                        <span className="font-semibold text-stone-700">₹{platformFee}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold pt-1">
                        Zero Middlemen: 80% goes straight to the farmer's verified bank account!
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Completed Orders Tab */
        <div className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No Past Delivered Orders Yet</h3>
              <p className="text-xs text-stone-500">When your orders are marked Delivered, they will appear in this history archive.</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-900">Order #{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Delivered
                    </span>
                  </div>
                  <div className="text-xs text-stone-500">
                    {order.date} • {order.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-stone-500">Total Paid</div>
                    <div className="text-base font-black text-stone-900">₹{order.totalAmount}</div>
                  </div>
                  <button
                    onClick={() => handleSpeakOrder(`Past order ${order.id} was delivered on ${order.date} for ₹${order.totalAmount}.`)}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
                    title="Hear past order details"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
