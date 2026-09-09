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
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  User,
  Wheat,
  Calendar
} from 'lucide-react';
import { CartItem, UserAccount } from '../types';
import { createCustomerOrder } from '../utils/marketplaceStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: UserAccount | null;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.fullName || 'Pooja Hegde');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.contact || '+91 98450 11223');
  const [address, setAddress] = useState('Flat 402, Green Meadows, Indiranagar 100ft Road, Bengaluru, KA');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalUnits = cart.reduce((acc, item) => acc + item.quantityKg, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.product.pricePerUnit || item.product.pricePerKg) * item.quantityKg, 0);
  const totalFarmerPayout = cart.reduce(
    (acc, item) => acc + item.product.farmerShare * item.quantityKg,
    0
  );
  const logisticsFee = 35;
  const total = subtotal + (cart.length > 0 ? logisticsFee : 0);

  const handleCheckout = () => {
    if (!address.trim()) {
      alert('Please provide a delivery address.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please provide your name.');
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantityKg,
      unit: item.product.unit || 'kg',
      pricePerUnit: item.product.pricePerUnit || item.product.pricePerKg,
      farmerName: item.product.farmerName,
      farmerId: item.product.farmerId,
      image: item.product.image,
    }));

    const created = createCustomerOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: address.trim(),
      items: orderItems,
      totalAmount: total,
      farmerPayout: totalFarmerPayout,
      status: 'Pending',
    });

    setConfirmedOrderId(created.id);
    setOrderPlaced(true);
  };

  const handleFinish = () => {
    setOrderPlaced(false);
    setConfirmedOrderId(null);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-stone-900 font-display">Your Fresh Cart</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {cart.length} items
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
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {orderPlaced ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-900 font-display">Order Confirmed!</h3>
                <p className="text-xs text-stone-600 mt-1">
                  Order ID: <span className="font-mono font-extrabold text-emerald-900 text-sm">#{confirmedOrderId}</span>
                </p>
              </div>

              {/* Farmer Payout Card */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Direct Farmer Settlement</span>
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  ₹{totalFarmerPayout.toFixed(0)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sent directly to the cultivators' bank accounts upon dispatch. No broker commissions deducted.
                </p>
              </div>

              {/* Delivery Details */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2 text-stone-700">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Scheduled Farm Dispatch</span>
                </div>
                <p>Deliver to: <strong className="text-stone-900">{address}</strong></p>
                <p>Payment: <strong className="text-stone-900 uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'Direct UPI Verified' : 'Card Payment'}</strong></p>
                <p className="text-[11px] text-stone-500">Order saved locally and immediately visible to cultivators.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleFinish}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm cursor-pointer shadow-md shadow-emerald-700/20"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-stone-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-base font-medium">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer hover:bg-emerald-800"
              >
                Browse Farm Produce
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>Selected Produce</span>
                  <button
                    onClick={onClearCart}
                    className="text-stone-400 hover:text-red-500 cursor-pointer text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

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
                        <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                          ₹{item.product.pricePerUnit || item.product.pricePerKg} / {item.product.unit || 'kg'} &bull; {item.product.farmerName}
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
                        <span className="w-7 text-center text-xs font-bold">{item.quantityKg}</span>
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

              {/* Customer details for delivery */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Customer Details</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Doorstep Delivery Address *</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Flat / House No., Street, City, State, PIN"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Select Payment Method</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span className="text-[11px]">Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'cod'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span className="text-[11px]">Cash on Del.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span className="text-[11px]">Card / Net</span>
                  </button>
                </div>
              </div>

              {/* Impact Breakdown */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Direct Value Transparency</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Direct to Cultivators:</span>
                  <span className="font-extrabold text-emerald-900">₹{totalFarmerPayout.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Clean Electric Transit:</span>
                  <span>₹{logisticsFee}</span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-1.5 pt-2 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Produce Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco-Delivery Logistics:</span>
                  <span className="font-semibold">₹{logisticsFee}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Payable:</span>
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
              <span>Confirm & Place Order (₹{total.toFixed(0)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-stone-400">
              Direct Farmer Dispatch &bull; Safe Packaging Guaranteed
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
