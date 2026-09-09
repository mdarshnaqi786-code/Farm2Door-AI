import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Info, 
  Sparkles,
  ArrowRight,
  Truck,
  Heart
} from 'lucide-react';
import { FarmerProduct, CartItem } from '../types';
import { FARMER_PRODUCTS } from '../data/mockData';

interface ConsumerMarketplaceProps {
  cart: CartItem[];
  onAddToCart: (product: FarmerProduct, quantityKg: number) => void;
  onOpenCart: () => void;
}

export const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({
  cart,
  onAddToCart,
  onOpenCart,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Tomato' | 'Onion' | 'Potato'>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'prod-tomato-1': 2,
    'prod-onion-1': 3,
    'prod-potato-1': 2,
    'prod-tomato-2': 1,
  });
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const filteredProducts = FARMER_PRODUCTS.filter((product) => {
    if (selectedFilter === 'all') return true;
    return product.name.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [productId]: updated };
    });
  };

  const handleAdd = (product: FarmerProduct) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    setAddedNotice(`Added ${qty} kg ${product.name} to cart!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% Farm Traceable &bull; Fair Price Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Direct Farm-Fresh Marketplace
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Purchase freshly harvested Tomato, Onion, and Potato directly from cultivator collectives. Farmers receive over 75% of retail price vs 30% in traditional middlemen supply chains.
          </p>
        </div>

        {/* Decorative Badge */}
        <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex-col items-center text-center">
          <ShieldCheck className="w-8 h-8 text-emerald-300 mb-1" />
          <span className="font-extrabold text-white text-lg">78%</span>
          <span className="text-xs text-emerald-200">Direct Farmer Share</span>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{addedNotice}</span>
          <button
            onClick={onOpenCart}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline ml-2 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Produce
          </button>
          <button
            onClick={() => setSelectedFilter('Tomato')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedFilter === 'Tomato'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🍅 Tomato
          </button>
          <button
            onClick={() => setSelectedFilter('Onion')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedFilter === 'Onion'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🧅 Onion
          </button>
          <button
            onClick={() => setSelectedFilter('Potato')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedFilter === 'Potato'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🥔 Potato
          </button>
        </div>

        <button
          onClick={onOpenCart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({cart.reduce((s, i) => s + i.quantityKg, 0)} kg)</span>
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const qty = quantities[product.id] || 1;
          const totalForQty = (product.pricePerKg * qty).toFixed(0);

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-stone-900 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                    {product.grade}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{product.harvestDate}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-lg font-black text-stone-900 font-display leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 mb-3">
                    {product.hindiName} &bull; {product.teluguName}
                  </p>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Farmer Information Block */}
                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-800 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{product.farmerName}</span>
                    </div>
                    {product.fpoName && (
                      <div className="text-[11px] text-stone-500">
                        Collective: {product.fpoName}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{product.location}</span>
                    </div>
                  </div>

                  {/* Transparent Price Breakdown */}
                  <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-200/80 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-600">Farmer Receives:</span>
                      <span className="font-extrabold text-emerald-800">
                        ₹{product.farmerShare} / kg ({((product.farmerShare / product.pricePerKg) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-emerald-200/70 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-600 h-full" style={{ width: `${(product.farmerShare / product.pricePerKg) * 100}%` }} title="Farmer share" />
                      <div className="bg-amber-400 h-full" style={{ width: `${(product.logisticsShare / product.pricePerKg) * 100}%` }} title="Clean logistics" />
                      <div className="bg-stone-400 h-full" style={{ width: `${(product.platformShare / product.pricePerKg) * 100}%` }} title="Platform ops" />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                      <span>Logistics: ₹{product.logisticsShare}</span>
                      <span>Platform: ₹{product.platformShare}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Purchase Bar */}
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-black text-stone-900 font-display">₹{product.pricePerKg}</span>
                    <span className="text-xs text-stone-500 font-semibold"> / kg</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold text-stone-900">
                      {qty} kg
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  id={`add-to-cart-${product.id}`}
                  onClick={() => handleAdd(product)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {qty} kg (₹{totalForQty})</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
