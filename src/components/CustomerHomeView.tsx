import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Volume2, 
  Heart, 
  Plus, 
  Check, 
  MapPin, 
  Clock, 
  Leaf,
  ChevronRight
} from 'lucide-react';
import { FarmerProduct, CartItem, LanguageCode } from '../types';
import { FARMER_PRODUCTS } from '../data/mockData';
import { speakText } from '../utils/speech';

interface CustomerHomeViewProps {
  onNavigateToMarketplace: () => void;
  onAddToCart: (product: FarmerProduct, quantityKg: number) => void;
  cart: CartItem[];
  language: LanguageCode;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
  onViewOrders: () => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onNavigateToMarketplace,
  onAddToCart,
  cart,
  language,
  onStartSpeech,
  onEndSpeech,
  onViewOrders,
}) => {
  const featuredProducts = FARMER_PRODUCTS.slice(0, 3);

  const handleSpeakFreshUpdate = () => {
    const announcement =
      'Welcome to Farm2Door Customer Hub. Today fresh harvested crops include Grade A Vine Tomatoes at rupees 34 per kg, Nashik Red Onions at rupees 28 per kg, and Farm Potatoes at rupees 24 per kg. Direct from farmer cooperatives with zero broker fee.';
    speakText(announcement, language, onStartSpeech, onEndSpeech);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Welcome Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/90 text-emerald-300 text-xs font-bold mb-3 border border-emerald-700/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct From Farmers &bull; Plucked This Morning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
            Farm-Fresh Produce Direct to Your Doorstep
          </h1>

          <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
            By eliminating intermediaries, farmers receive <span className="text-emerald-400 font-bold">78%+</span> of your payment while you enjoy chemically untouched, harvest-fresh agricultural produce.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-explore-marketplace-btn"
              onClick={onNavigateToMarketplace}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-view-orders-btn"
              onClick={onViewOrders}
              className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm sm:text-base flex items-center gap-2 border border-stone-700 transition-colors cursor-pointer"
            >
              <span>Track Active Orders</span>
            </button>

            {/* Audio speaker button */}
            <button
              onClick={handleSpeakFreshUpdate}
              className="w-11 h-11 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Hear today's harvest briefing aloud"
              aria-label="Hear today's harvest briefing aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Farm Direct Stat Card */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 bg-stone-800/90 border border-stone-700 p-6 rounded-3xl w-72 backdrop-blur-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xl">
              78%
            </div>
            <div>
              <div className="text-xs font-bold text-stone-400 uppercase">Farmer Share</div>
              <div className="text-sm font-bold text-white">Direct Payout</div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-stone-300">
            <div className="flex justify-between pb-1 border-b border-stone-700">
              <span>Traditional Middlemen:</span>
              <span className="text-stone-400">~28% - 32%</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-400">
              <span>Farm2Door AI Direct:</span>
              <span>78.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base">Morning Plucked</h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Harvested within 24 hours of dispatch. No chemical ripening agents or prolonged cold-storage degradation.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base">Electric Cold-Transit</h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Fleet of temperature-controlled electric vehicles maintains fresh crunch from village farm-gate to your home.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base">Complete Origin Trace</h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Every package identifies the exact cultivator, village cluster, and collective that harvested your food.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Today's Harvest */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-stone-900 font-display">
              Today&apos;s Fresh Harvest
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Available direct from regional FPO clusters with guaranteed cultivator payout.
            </p>
          </div>

          <button
            onClick={onNavigateToMarketplace}
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => {
            const inCart = cart.find((c) => c.product.id === prod.id);
            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {prod.grade}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{prod.harvestDate}</span>
                    </span>
                  </div>

                  <div className="text-4xl mb-3">
                    {prod.name.includes('Tomato') ? '🍅' : prod.name.includes('Onion') ? '🧅' : '🥔'}
                  </div>

                  <h3 className="font-bold text-lg text-stone-900">
                    {prod.name}
                  </h3>

                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{prod.farmerName} &bull; {prod.location}</span>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3 mb-5 border border-stone-200/70 text-xs text-stone-600">
                    <span className="font-semibold text-emerald-800">
                      ₹{prod.farmerShare}/kg goes directly to farmer
                    </span>{' '}
                    ({Math.round((prod.farmerShare / prod.pricePerKg) * 100)}% of price)
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div>
                    <span className="text-xl font-black text-stone-900">₹{prod.pricePerKg}</span>
                    <span className="text-xs text-stone-500"> / kg</span>
                  </div>

                  <button
                    onClick={() => onAddToCart(prod, 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added ({inCart.quantityKg}kg)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add 1 kg</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
