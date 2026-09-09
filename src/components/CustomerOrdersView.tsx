import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { speakText } from '../utils/speech';
import { LanguageCode } from '../types';

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

  const activeOrders = [
    {
      id: 'F2D-9042',
      date: 'Today, 08:30 AM',
      status: 'Out for Delivery',
      eta: '18 mins away',
      temp: '4.2°C (Electric Cold-Van)',
      otp: '7392',
      driver: 'Santosh Kumar',
      driverPhone: '+91 98765 11223',
      farmerName: 'Ramesh Patil',
      farmerFPO: 'Sahyadri Kisan Producer Co.',
      farmLocation: 'Nashik, Maharashtra',
      items: [
        { name: 'Farm Fresh Desi Tomato (Grade A)', qty: '3 kg', price: 102 },
        { name: 'Nashik Red Onion (Export Quality)', qty: '2 kg', price: 56 },
      ],
      totalAmount: 158,
      farmerPayout: 124, // 78.5%
      logisticsCost: 22,
      platformFee: 12,
      speechSummary:
        'Your order F2D 9042 is out for delivery in an electric cold van at 4 degrees. Estimated arrival in 18 minutes. Delivery OTP is 7 3 9 2.',
    },
  ];

  const completedOrders = [
    {
      id: 'F2D-8821',
      date: 'Yesterday, 11:15 AM',
      status: 'Delivered',
      farmerName: 'Balasaheb Shinde',
      farmerFPO: 'Godavari Agro FPO',
      farmLocation: 'Niphad, Nashik',
      items: [
        { name: 'Premium Farm Potato (Sorted Large)', qty: '5 kg', price: 120 },
      ],
      totalAmount: 120,
      farmerPayout: 94,
      logisticsCost: 16,
      platformFee: 10,
      speechSummary:
        'Order F2D 8821 was delivered yesterday from Godavari Agro FPO with 5 kilograms of farm potato.',
    },
  ];

  const handleSpeakOrder = (text: string) => {
    speakText(text, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>Farm-to-Door Live Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            My Orders
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Real-time cold-chain tracking with direct cultivator transparency.
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
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-stone-900 text-lg">
                      Order #{order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Placed {order.date}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold">{order.eta}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Speaker Button to Hear Order Info */}
                  <button
                    onClick={() => handleSpeakOrder(order.speechSummary)}
                    className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Hear delivery status aloud"
                    aria-label="Hear delivery status aloud"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  {/* Delivery OTP */}
                  <div className="bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl text-center">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                      Delivery OTP
                    </div>
                    <div className="text-base font-black text-stone-900 font-mono tracking-wider">
                      {order.otp}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-stone-900">1. Plucked & Sorted</div>
                      <div className="text-stone-500">05:00 AM at {order.farmLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-emerald-600 shrink-0 animate-pulse" />
                    <div>
                      <div className="font-bold text-emerald-800">2. In Cold Transit ({order.temp})</div>
                      <div className="text-stone-500">Driver {order.driver}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-stone-400 shrink-0" />
                    <div>
                      <div className="font-bold text-stone-700">3. Doorstep Arrival</div>
                      <div className="text-stone-500">Expected by 11:30 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Farmer Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Items */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Purchased Produce
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1 border-b border-stone-100 last:border-none"
                      >
                        <span className="font-medium text-stone-800">
                          {item.name} &times; {item.qty}
                        </span>
                        <span className="font-bold text-stone-900">₹{item.price}</span>
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
                    <span className="text-stone-600">Farmer ({order.farmerName}):</span>
                    <span className="font-bold text-emerald-800">
                      ₹{order.farmerPayout} (78.5%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200/60">
                    <span className="text-stone-600">Refrigerated Logistics:</span>
                    <span className="font-bold text-stone-800">₹{order.logisticsCost}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-600">Platform & AI Match Fee:</span>
                    <span className="font-bold text-stone-800">₹{order.platformFee}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 pt-1">
                    Cultivated by {order.farmerName}, member of {order.farmerFPO}. Zero middleman commission deducted.
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <div className="font-extrabold text-stone-900 text-lg">
                    Order #{order.id}
                  </div>
                  <div className="text-xs text-stone-500">Delivered {order.date}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                  Delivered Successfully
                </span>
              </div>
              <div className="text-sm text-stone-700">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{it.name} ({it.qty})</span>
                    <span className="font-bold">₹{it.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
