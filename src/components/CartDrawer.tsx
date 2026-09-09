import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [address, setAddress] = useState('Flat 402, Green Meadows, Indiranagar, Bengaluru');
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const totalKg = cart.reduce((acc, item) => acc + item.quantityKg, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.pricePerKg * item.quantityKg, 0);
  const totalFarmerPayout = cart.reduce(
    (acc, item) => acc + item.product.farmerShare * item.quantityKg,
    0
  );
  const logisticsFee = 35;
  const total = subtotal + (cart.length > 0 ? logisticsFee : 0);

  const handleCheckout = () => {
    setOrderPlaced(true);
  };

  const handleFinish = () => {
    setOrderPlaced(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-stone-900 font-display">Your Fresh Cart</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {totalKg} kg
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {orderPlaced ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-stone-900 font-display">Order Confirmed!</h3>
              <p className="text-sm text-stone-600">
                Order <span className="font-mono font-bold text-emerald-800">#F2D-9812</span> has been placed.
              </p>

              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Farmer Payout Initiated</span>
                </div>
                <div className="text-xl font-black text-emerald-900">
                  ₹{totalFarmerPayout.toFixed(0)} sent directly to farmers
                </div>
                <p className="text-xs text-stone-600">
                  Harvested batches assigned to electric delivery hauler <span className="font-bold">KA-04-EV-2041</span>.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleFinish}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm cursor-pointer shadow-sm"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-stone-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-base font-medium">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer hover:bg-emerald-800"
              >
                Browse Tomatoes, Onions & Potatoes
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-emerald-800 font-semibold">
                          ₹{item.product.pricePerKg}/kg &bull; From {item.product.farmerName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white rounded-lg border border-stone-200 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantityKg - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantityKg}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantityKg + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Doorstep Delivery Address</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                />
              </div>

              {/* Impact Breakdown */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Direct Value Transparency</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Farmer Direct Revenue:</span>
                  <span className="font-bold text-emerald-800">₹{totalFarmerPayout.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Optimized Green Logistics:</span>
                  <span>₹{logisticsFee}</span>
                </div>
                <p className="text-[10px] text-stone-500 pt-1 border-t border-emerald-200">
                  Zero commission brokers. Food travels straight from farm cluster to doorstep in cold-chain electric haulers.
                </p>
              </div>

              {/* Bill Details */}
              <div className="space-y-2 pt-2 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Produce Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco-Delivery:</span>
                  <span className="font-semibold">₹{logisticsFee}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount:</span>
                  <span className="text-emerald-800">₹{total.toFixed(0)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!orderPlaced && cart.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-white space-y-2">
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>Confirm & Pay ₹{total.toFixed(0)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-stone-400">
              UPI &bull; Direct Bank Transfer &bull; Cash on Delivery
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
