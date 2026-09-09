import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Zap, 
  MessageSquare, 
  Building2,
  Check,
  Wheat,
  Share2
} from 'lucide-react';
import { FarmerProduct, UserAccount } from '../types';

interface ProductDetailModalProps {
  product: FarmerProduct;
  currentUser: UserAccount | null;
  onClose: () => void;
  onAddToCart: (product: FarmerProduct, quantity: number) => void;
  onBuyNow: (product: FarmerProduct, quantity: number) => void;
  onOpenEnquiry: (product: FarmerProduct) => void;
  onOpenBulkQuote?: (product: FarmerProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentUser,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenEnquiry,
  onOpenBulkQuote,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const isBulkBuyer = currentUser?.role === 'bulk_buyer';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden relative animate-fade-in my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition-colors cursor-pointer border border-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Large Image & Badges */}
          <div className="relative bg-stone-100 min-h-[280px] md:min-h-full flex flex-col justify-between p-6">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Top Badges */}
            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5" />
                <span>🌾 Direct from Farmer</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 text-xs font-bold shadow-sm">
                {product.category}
              </span>
            </div>

            {/* Bottom Image Overlay Info */}
            <div className="relative z-10 text-white space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.freshnessIndicator || 'Harvest-Fresh Guaranteed'}</span>
              </div>
              <div className="text-xs text-stone-200 flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Harvest Date: {product.harvestDate}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Product Info & Action Buttons */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="space-y-4">
              
              {/* Middlemen Elimination Callout */}
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Direct from Farmer – No Middlemen</span>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  ~80% Farmer Share
                </span>
              </div>

              {/* Title & Grade */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    {product.grade}
                  </span>
                  <button
                    onClick={handleShare}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
                  {product.name}
                </h2>
                {product.hindiName && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    {product.hindiName} {product.teluguName ? `• ${product.teluguName}` : ''}
                  </p>
                )}
              </div>

              {/* Farmer & Location Info */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Cultivator: <strong className="text-stone-900">{product.farmerName}</strong></span>
                </div>
                {product.fpoName && (
                  <div className="text-stone-600 pl-6">
                    FPO / Collective: <span className="font-semibold text-stone-800">{product.fpoName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-stone-700 pt-0.5">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Farm Location: <strong className="text-stone-900">{product.location}</strong></span>
                </div>
              </div>

              {/* Pricing & Stock Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-medium block">Price per {product.unit}</span>
                  <div className="text-2xl font-black text-stone-900 mt-0.5">
                    ₹{product.pricePerUnit}
                    <span className="text-xs font-normal text-stone-500"> / {product.unit}</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-medium block">Available Quantity</span>
                  <div className="text-2xl font-black text-emerald-800 mt-0.5">
                    {product.availableQty}
                    <span className="text-xs font-normal text-stone-500"> {product.unit}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  Product Description
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Direct Communication Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEnquiry(product)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 text-xs font-bold border border-stone-200 hover:border-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask About Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEnquiry(product)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 text-xs font-bold border border-stone-200 hover:border-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Contact Farmer</span>
                </button>
              </div>

            </div>

            {/* Bottom Actions: Quantity Selector, Add to Cart, Buy Now / Bulk Quote */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              
              {/* Quantity Selector & Subtotal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700">Quantity:</span>
                  <div className="flex items-center bg-stone-100 rounded-xl border border-stone-200 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-white text-stone-700 flex items-center justify-center shadow-xs hover:bg-stone-50 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-stone-900">
                      {quantity} {product.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.availableQty || 999, q + 1))}
                      className="w-7 h-7 rounded-lg bg-white text-stone-700 flex items-center justify-center shadow-xs hover:bg-stone-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">Total Price</span>
                  <span className="text-lg font-black text-emerald-900">
                    ₹{(quantity * product.pricePerUnit).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {isBulkBuyer && onOpenBulkQuote ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBulkQuote(product);
                    }}
                    className="py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Request Bulk Quote</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onBuyNow(product, quantity);
                      onClose();
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Buy Now</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
