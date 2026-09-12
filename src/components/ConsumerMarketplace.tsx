import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  MessageSquare,
  Wheat,
  X,
  Building2,
  Calendar,
  Filter
} from 'lucide-react';
import { FarmerProduct, CartItem, UserAccount, ProductCategory } from '../types';
import { getMarketplaceProducts } from '../utils/marketplaceStore';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductEnquiryModal } from './ProductEnquiryModal';
import { BulkQuoteModal } from './BulkQuoteModal';

interface ConsumerMarketplaceProps {
  cart: CartItem[];
  currentUser?: UserAccount | null;
  onAddToCart: (product: FarmerProduct, quantity: number) => void;
  onOpenCart: () => void;
  bulkMode?: boolean;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Dairy Products',
  'Other Agricultural Products',
];

type SortOption = 'freshest' | 'price_low' | 'price_high' | 'location';
type FreshnessOption = 'all' | 'today' | 'recent' | 'organic';

export const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({
  cart,
  currentUser = null,
  onAddToCart,
  onOpenCart,
  bulkMode = false,
}) => {
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [freshnessFilter, setFreshnessFilter] = useState<FreshnessOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('freshest');
  const [bulkOnly, setBulkOnly] = useState<boolean>(bulkMode);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Modals state
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<FarmerProduct | null>(null);
  const [selectedEnquiryProduct, setSelectedEnquiryProduct] = useState<FarmerProduct | null>(null);
  const [selectedBulkProduct, setSelectedBulkProduct] = useState<FarmerProduct | null>(null);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load products from storage & sync on changes
  const loadProducts = () => {
    const list = getMarketplaceProducts();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();
    window.addEventListener('farm2door_products_updated', handleUpdate);

    return () => {
      window.removeEventListener('farm2door_products_updated', handleUpdate);
    };
  }, []);

  // Distinct locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    products.forEach((p) => {
      if (p.location) {
        const parts = p.location.split(',');
        const main = parts[0].trim();
        if (main) locs.add(main);
      }
    });
    return Array.from(locs);
  }, [products]);

  // Filter & Sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesHindi = product.hindiName?.toLowerCase().includes(query);
        const matchesTelugu = product.teluguName?.toLowerCase().includes(query);
        const matchesFarmer = product.farmerName.toLowerCase().includes(query);
        const matchesLoc = product.location.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesHindi && !matchesTelugu && !matchesFarmer && !matchesLoc && !matchesCat) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // 3. Location
      if (selectedLocation !== 'all' && !product.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // 4. Max Price
      if (product.pricePerUnit > maxPrice) {
        return false;
      }

      // 5. Freshness
      if (freshnessFilter === 'today') {
        const isToday = product.harvestDate.toLowerCase().includes('today') || product.freshnessDays === 0;
        if (!isToday) return false;
      } else if (freshnessFilter === 'recent') {
        const isRecent = product.harvestDate.toLowerCase().includes('today') || product.harvestDate.toLowerCase().includes('yesterday') || (product.freshnessDays ?? 99) <= 2;
        if (!isRecent) return false;
      } else if (freshnessFilter === 'organic') {
        if (product.grade !== 'Organic Certified') return false;
      }

      // 6. Bulk filter
      if (bulkOnly) {
        const isBulkUnit = product.unit === 'quintal' || product.unit === 'ton';
        const hasBulkQty = (product.availableQty || 0) >= 300 || (product.availableKg || 0) >= 300;
        if (!isBulkUnit && !hasBulkQty) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.pricePerUnit - b.pricePerUnit;
      }
      if (sortBy === 'price_high') {
        return b.pricePerUnit - a.pricePerUnit;
      }
      if (sortBy === 'location') {
        return a.location.localeCompare(b.location);
      }
      // 'freshest' by default
      const aFresh = a.freshnessDays ?? (a.harvestDate.toLowerCase().includes('today') ? 0 : 3);
      const bFresh = b.freshnessDays ?? (b.harvestDate.toLowerCase().includes('today') ? 0 : 3);
      return aFresh - bFresh;
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedLocation, maxPrice, freshnessFilter, sortBy, bulkOnly]);

  const handleQuantityChange = (productId: string, delta: number, maxQty: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const updated = Math.max(1, Math.min(maxQty || 999, current + delta));
      return { ...prev, [productId]: updated };
    });
  };

  const handleAdd = (product: FarmerProduct) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    setAddedNotice(`Added ${qty} ${product.unit} ${product.name} to cart!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 2500);
  };

  const handleBuyNow = (product: FarmerProduct, quantity: number) => {
    onAddToCart(product, quantity);
    onOpenCart();
  };

  const isBulkBuyer = currentUser?.role === 'bulk_buyer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ========================================================================= */}
      {/* 1. TOP MARKETPLACE HERO BANNER                                            */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-100 text-xs font-bold">
            <Wheat className="w-3.5 h-3.5 text-amber-300" />
            <span>🌾 Direct Agricultural Marketplace &bull; Zero Intermediaries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-tight">
            Direct Farm-Fresh Marketplace
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Source freshly harvested vegetables, fruits, grains, pulses, and dairy straight from verified Indian farmers and FPOs. Cultivators receive ~80% of retail price directly into their accounts.
          </p>
        </div>

        {/* Decorative stats */}
        <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex-col items-center text-center shadow-lg">
          <ShieldCheck className="w-9 h-9 text-emerald-300 mb-1" />
          <span className="font-black text-white text-2xl">~80%</span>
          <span className="text-xs text-emerald-200 font-bold">Direct Farmer Payout</span>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{addedNotice}</span>
          <button
            onClick={onOpenCart}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline ml-2 cursor-pointer"
          >
            Open Cart
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEARCH, CATEGORIES, AND ADVANCED FILTERS                               */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Search Bar & Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, farmer name, farm location, or category..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none"
              >
                <option value="freshest">Freshest Harvest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="location">Nearest Farm Location</option>
              </select>
            </div>

            {/* Bulk / Wholesale Toggle */}
            <button
              onClick={() => setBulkOnly(!bulkOnly)}
              className={`px-3.5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs ${
                bulkOnly
                  ? 'bg-teal-800 border-teal-900 text-white font-extrabold'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
              title="Toggle wholesale and bulk quantity lots (≥ 300 kg)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bulk Lots</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-2xs ${
                showAdvancedFilters || selectedLocation !== 'all' || maxPrice < 1000 || freshnessFilter !== 'all'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Filters</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Cart ({cart.reduce((s, i) => s + i.quantityKg, 0)})</span>
            </button>
          </div>

        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat === 'All' ? '🌱 All Produce' : cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer / Box */}
        {showAdvancedFilters && (
          <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in text-xs">
            
            {/* Location Filter */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Farm Origin / District
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">All Farm Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Freshness Filter */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Harvest Freshness
              </label>
              <select
                value={freshnessFilter}
                onChange={(e) => setFreshnessFilter(e.target.value as FreshnessOption)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">All Freshness Levels</option>
                <option value="today">Plucked Today (Zero Cold Storage)</option>
                <option value="recent">Within Last 48 Hours</option>
                <option value="organic">Organic Certified Only</option>
              </select>
            </div>

            {/* Price Max Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 font-bold text-stone-700">
                <span>Max Price: ₹{maxPrice}</span>
                {maxPrice < 1000 && (
                  <button
                    onClick={() => setMaxPrice(1000)}
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>₹20</span>
                <span>₹500</span>
                <span>₹1000+</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCT GRID & CARDS                                                   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Results Count & Status */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900">{filteredAndSortedProducts.length}</strong> farm-fresh items directly from cultivators
          </span>
          {(searchQuery || selectedCategory !== 'All' || selectedLocation !== 'all' || maxPrice < 1000 || freshnessFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('all');
                setMaxPrice(1000);
                setFreshnessFilter('all');
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 space-y-3">
            <Wheat className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">No Farm Products Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any produce matching your filters. Try clearing your search query or adjusting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('all');
                setMaxPrice(1000);
                setFreshnessFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => {
              const qty = quantities[product.id] || 1;
              const totalForQty = (product.pricePerUnit * qty).toLocaleString('en-IN');

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-3xl border-2 border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Wheat className="w-3 h-3 text-amber-300" />
                          <span>🌾 Direct from Farmer</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/95 text-stone-800 text-[10px] font-bold shadow-xs">
                          {product.category}
                        </span>
                      </div>

                      {/* Grade Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        {product.grade}
                      </div>

                      {/* Harvest Date / Freshness */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center justify-between truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{product.harvestDate}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-bold shrink-0 ml-1">
                          {product.availableQty} {product.unit} left
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      
                      {/* Name & vernacular */}
                      <div>
                        <h3 className="text-base font-black text-stone-900 font-display leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                        {product.hindiName && (
                          <p className="text-xs text-emerald-800 font-semibold mt-0.5 truncate">
                            {product.hindiName} {product.teluguName ? `• ${product.teluguName}` : ''}
                          </p>
                        )}
                      </div>

                      {/* Farmer & Location Info */}
                      <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{product.farmerName}</span>
                        </div>
                        {product.fpoName && (
                          <div className="text-[11px] text-stone-500 truncate pl-5">
                            FPO: {product.fpoName}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 pt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{product.location}</span>
                        </div>
                      </div>

                      {/* Transparent Farmer Share */}
                      <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-center justify-between font-bold">
                        <span>Farmer Payout:</span>
                        <span className="text-emerald-800">
                          ₹{product.farmerShare} / {product.unit} (~{Math.round((product.farmerShare / product.pricePerUnit) * 100)}%)
                        </span>
                      </div>

                      {/* Quick Details Button & Direct Ask */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailProduct(product)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedEnquiryProduct(product)}
                          className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Ask Farmer Direct Question"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ask</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Card Bottom: Price, Stepper & Purchase Button */}
                  <div className="p-5 pt-0 space-y-2.5">
                    
                    {/* Price & Quantity stepper */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-stone-900 font-display">
                          ₹{product.pricePerUnit}
                        </span>
                        <span className="text-xs text-stone-500 font-semibold"> / {product.unit}</span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1, product.availableQty)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-stone-900">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1, product.availableQty)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart or Bulk Quote */}
                    {isBulkBuyer ? (
                      <button
                        onClick={() => setSelectedBulkProduct(product)}
                        className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Request Bulk Quote</span>
                      </button>
                    ) : (
                      <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => handleAdd(product)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add {qty} {product.unit} (₹{totalForQty})</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS INTEGRATION                                                     */}
      {/* ========================================================================= */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          currentUser={currentUser}
          onClose={() => setSelectedDetailProduct(null)}
          onAddToCart={onAddToCart}
          onBuyNow={handleBuyNow}
          onOpenEnquiry={(prod) => {
            setSelectedDetailProduct(null);
            setSelectedEnquiryProduct(prod);
          }}
          onOpenBulkQuote={(prod) => {
            setSelectedDetailProduct(null);
            setSelectedBulkProduct(prod);
          }}
        />
      )}

      {selectedEnquiryProduct && (
        <ProductEnquiryModal
          product={selectedEnquiryProduct}
          currentUser={currentUser}
          onClose={() => setSelectedEnquiryProduct(null)}
        />
      )}

      {selectedBulkProduct && (
        <BulkQuoteModal
          product={selectedBulkProduct}
          currentUser={currentUser}
          onClose={() => setSelectedBulkProduct(null)}
        />
      )}

    </div>
  );
};
