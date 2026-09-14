import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertCircle, 
  Tag, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Sparkles,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FarmerProduct, ProductCategory, QuantityUnit, UserAccount, LanguageCode, AdminProductPriceRange } from '../types';
import { 
  getMarketplaceProducts, 
  saveProduct, 
  updateProduct, 
  deleteProduct,
  getCustomerOrders,
  getFarmerEnquiries,
  validateFarmerPrice,
  getAdminPriceRanges,
  findAdminPriceRange,
  isProductPriceCompliant,
  ProductComplianceResult
} from '../utils/marketplaceStore';

interface FarmerProductManagerProps {
  currentUser: UserAccount | null;
  language?: LanguageCode;
  onStartSpeech?: () => void;
  onEndSpeech?: () => void;
  onProductAdded?: (product: FarmerProduct) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Dairy Products',
  'Other Agricultural Products',
];

const PRESET_IMAGES = [
  { label: 'Tomato', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
  { label: 'Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
  { label: 'Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
  { label: 'Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Mango', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80' },
  { label: 'Banana', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Green Chilli', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pulses / Dal', url: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Spices / Turmeric', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Dairy / Ghee', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80' },
];

export const FarmerProductManager: React.FC<FarmerProductManagerProps> = ({
  currentUser,
  onProductAdded,
}) => {
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [orders, setOrders] = useState(getCustomerOrders());
  const [enquiries, setEnquiries] = useState(getFarmerEnquiries());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FarmerProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Vegetables');
  const [availableQty, setAvailableQty] = useState<number | ''>(100);
  const [unit, setUnit] = useState<QuantityUnit>('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(35);
  const [location, setLocation] = useState(currentUser?.fpoOrOrgName || 'Nashik Farm Cluster, Maharashtra');
  const [harvestDate, setHarvestDate] = useState('Harvested Today at 6:00 AM');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [grade, setGrade] = useState<'Grade A' | 'Organic Certified' | 'Premium Farm Fresh'>('Grade A');

  const [adminPriceRanges, setAdminPriceRanges] = useState<AdminProductPriceRange[]>([]);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    setProducts(getMarketplaceProducts());
    setOrders(getCustomerOrders());
    setEnquiries(getFarmerEnquiries());
    setAdminPriceRanges(getAdminPriceRanges());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('farm2door_products_updated', handleUpdate);
    window.addEventListener('farm2door_orders_updated', handleUpdate);
    window.addEventListener('farm2door_enquiries_updated', handleUpdate);
    window.addEventListener('farm2door_price_ranges_updated', handleUpdate);

    return () => {
      window.removeEventListener('farm2door_products_updated', handleUpdate);
      window.removeEventListener('farm2door_orders_updated', handleUpdate);
      window.removeEventListener('farm2door_enquiries_updated', handleUpdate);
      window.removeEventListener('farm2door_price_ranges_updated', handleUpdate);
    };
  }, []);

  // Find matching Admin Price Range for the crop currently typed or selected
  const matchingPriceRange = name.trim() ? findAdminPriceRange(name) : null;

  // Check validation in real-time
  const currentValidation = name.trim() && pricePerUnit !== ''
    ? validateFarmerPrice(name, Number(pricePerUnit), unit)
    : null;

  // Separate active price-compliant products from hidden products requiring price adjustments
  const { activeValidProducts, hiddenInvalidProducts } = useMemo(() => {
    const valid: FarmerProduct[] = [];
    const hidden: Array<{ product: FarmerProduct; compliance: ProductComplianceResult }> = [];

    products.forEach((product) => {
      const comp = isProductPriceCompliant(product);
      if (comp.valid) {
        valid.push(product);
      } else {
        hidden.push({ product, compliance: comp });
      }
    });

    return { activeValidProducts: valid, hiddenInvalidProducts: hidden };
  }, [products, adminPriceRanges]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Vegetables');
    setAvailableQty(100);
    setUnit('kg');
    setPricePerUnit(35);
    setLocation(currentUser?.fpoOrOrgName || 'Nashik Farm Cluster, Maharashtra');
    setHarvestDate('Harvested Today at 6:00 AM');
    setDescription('Directly plucked from the farm field, pesticide-free, sorted Grade A quality.');
    setImageUrl(PRESET_IMAGES[0].url);
    setGrade('Grade A');
    setPriceValidationError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: FarmerProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category || 'Vegetables');
    setAvailableQty(prod.availableQty);
    setUnit((prod.unit as QuantityUnit) || 'kg');
    setPricePerUnit(prod.pricePerUnit);
    setLocation(prod.location);
    setHarvestDate(prod.harvestDate);
    setDescription(prod.description);
    setImageUrl(prod.image);
    setGrade((prod.grade as any) || 'Grade A');
    setPriceValidationError(null);
    setIsFormOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPriceValidationError(null);

    if (!name.trim() || !availableQty || !pricePerUnit) {
      setPriceValidationError('Please fill in all required fields.');
      return;
    }

    const priceNum = Number(pricePerUnit);
    const validation = validateFarmerPrice(name.trim(), priceNum, unit);
    if (!validation.valid) {
      setPriceValidationError(validation.message);
      return;
    }

    const farmerName = currentUser?.fullName || 'Ramesh Patil';
    const fpoName = currentUser?.fpoOrOrgName || 'Sahyadri Kisan Producer Co.';

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, {
          name: name.trim(),
          category,
          availableQty: Number(availableQty),
          unit,
          pricePerUnit: priceNum,
          location: location.trim(),
          harvestDate: harvestDate.trim(),
          description: description.trim(),
          image: imageUrl,
          grade,
        });
        showToast(`Product "${name}" updated successfully!`);
      } else {
        const saved = saveProduct({
          name: name.trim(),
          category,
          availableQty: Number(availableQty),
          unit,
          pricePerUnit: priceNum,
          location: location.trim(),
          harvestDate: harvestDate.trim(),
          description: description.trim(),
          image: imageUrl,
          grade,
          farmerName,
          fpoName,
          farmerId: currentUser?.id || 'farmer-default',
          availableKg: Number(availableQty),
          pricePerKg: priceNum,
          farmerShare: Math.round(priceNum * 0.8 * 10) / 10,
          logisticsShare: Math.round(priceNum * 0.12 * 10) / 10,
          platformShare: Math.round(priceNum * 0.08 * 10) / 10,
          freshnessIndicator: 'Harvested Today • Direct from Cultivator',
        });
        showToast(`Product "${name}" added! It is now live in the Customer & Bulk Marketplace.`);
        if (onProductAdded) onProductAdded(saved);
      }

      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setPriceValidationError(err.message || 'Failed to save product due to price range validation error.');
    }
  };

  const handleDelete = (id: string, prodName: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast(`Product "${prodName}" deleted.`);
    loadData();
  };

  // Count orders received for a product
  const getProductOrderStats = (prodId: string, prodName: string) => {
    const matchedOrders = orders.filter((o) =>
      o.items.some((i) => i.productId === prodId || i.productName.toLowerCase().includes(prodName.toLowerCase()))
    );
    const totalOrderedQty = matchedOrders.reduce((acc, order) => {
      const matchItem = order.items.find((i) => i.productId === prodId || i.productName.toLowerCase().includes(prodName.toLowerCase()));
      return acc + (matchItem ? matchItem.quantity : 0);
    }, 0);

    const matchedEnquiries = enquiries.filter((e) => e.productId === prodId || e.productName.toLowerCase().includes(prodName.toLowerCase()));

    return {
      orderCount: matchedOrders.length,
      totalQtySold: totalOrderedQty,
      enquiryCount: matchedEnquiries.length,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-600 flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header bar with Add Product Button */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1">
            <Sprout className="w-3.5 h-3.5" />
            <span>Direct Agricultural Marketplace Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            My Farm Products & Inventory
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            List your freshly harvested vegetables, fruits, grains, and dairy. Products listed here appear live in the Customer Marketplace and Bulk Buyer Sourcing Hub.
          </p>
        </div>

        {/* Large Add Product Button */}
        <button
          id="farmer-add-product-btn"
          onClick={handleOpenAddForm}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Admin Price Policy Hidden Products Notification Section */}
      {hiddenInvalidProducts.length > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 font-black shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                  <span>Hidden Products Requiring Price Adjustment</span>
                  <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                    {hiddenInvalidProducts.length} Currently Hidden
                  </span>
                </h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  The following products are currently hidden from consumers and the marketplace because their price is outside the Admin-approved range or missing price policy. Please update the price to make them visible.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hiddenInvalidProducts.map(({ product, compliance }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-stone-900 truncate">
                        {product.name}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        Current: ₹{product.pricePerUnit}/{product.unit}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-rose-700 leading-snug">
                      {compliance.reason}
                    </p>
                    {compliance.range && (
                      <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Admin Approved Range: ₹{compliance.range.minPrice}–₹{compliance.range.maxPrice}/{compliance.range.unit}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditForm(product)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Price</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-stone-900 font-display flex items-center gap-2">
            <span>Currently Listed Products</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {activeValidProducts.length} Active
            </span>
          </h3>
          <span className="text-xs text-stone-500">
            Auto-synced across Customer & Bulk Buyer portals
          </span>
        </div>

        {activeValidProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-stone-200 space-y-4">
            <Sprout className="w-12 h-12 text-stone-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-stone-800">No Active Products Listed</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {hiddenInvalidProducts.length > 0
                  ? 'Your products are currently hidden because their prices need adjustment to match Admin price policies. Please adjust prices above to activate them.'
                  : 'Add your first harvested crop to start receiving orders directly from consumers and institutional buyers.'}
              </p>
            </div>
            <button
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Crop</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeValidProducts.map((product) => {
              const stats = getProductOrderStats(product.id, product.name);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border-2 border-stone-200/80 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-44 bg-stone-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Tag */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-700/90 backdrop-blur-xs text-white text-[11px] font-bold">
                          {product.category}
                        </span>
                        {product.isUserCreated && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                            My Listing
                          </span>
                        )}
                      </div>

                      {/* Stock overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                          Available: <strong className="text-emerald-300">{product.availableQty} {product.unit}</strong>
                        </span>
                        <span className="bg-emerald-800 px-2.5 py-1 rounded-lg text-amber-300 font-extrabold text-sm">
                          ₹{product.pricePerUnit}/{product.unit}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          {product.grade}
                        </div>
                        <h4 className="text-base font-black text-stone-900 leading-snug">
                          {product.name}
                        </h4>
                      </div>

                      <div className="space-y-1 text-xs text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{product.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{product.harvestDate}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Admin Price Control Compliance Status */}
                      {(() => {
                        const r = findAdminPriceRange(product.name);
                        if (!r) return null;
                        return (
                          <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-xl border text-emerald-900 bg-emerald-50/90 border-emerald-300">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Admin Range: ₹{r.minPrice}–₹{r.maxPrice}/{r.unit}</span>
                            </span>
                            <span className="text-emerald-700 font-bold">
                              ✓ Within Limit
                            </span>
                          </div>
                        );
                      })()}

                      {/* Order & Enquiry stats */}
                      <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs font-bold text-stone-700">
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{stats.orderCount} Orders ({stats.totalQtySold} {product.unit})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-600">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                          <span>{stats.enquiryCount} Enquiries</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => handleOpenEditForm(product)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {deleteConfirmId === product.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="py-2.5 px-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="py-2.5 px-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
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
      {/* ADD / EDIT PRODUCT MODAL FORM                                             */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-fade-in my-6">
            
            {/* Close */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 pb-4 border-b border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  {editingProduct ? 'Edit Agricultural Product' : 'Add New Agricultural Product'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Saved produce is immediately available to Customers and Bulk Sourcing Buyers.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              
              {/* Validation error banner */}
              {priceValidationError && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-bold text-rose-900 mb-0.5">Price Range Validation Notice:</strong>
                    <span>{priceValidationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPriceValidationError(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Product Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                    Product Name *
                  </label>
                  {matchingPriceRange && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Admin Range: ₹{matchingPriceRange.minPrice} – ₹{matchingPriceRange.maxPrice}/{matchingPriceRange.unit}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (priceValidationError) setPriceValidationError(null);
                  }}
                  placeholder="e.g. Grade A Desi Tomatoes / Organic Sona Masoori Rice"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-semibold"
                />

                {/* Quick select crops from Admin Price Ranges */}
                {adminPriceRanges.length > 0 && !name && (
                  <div className="mt-2">
                    <span className="text-[11px] text-stone-500 font-semibold block mb-1">
                      Admin-approved crops & price ranges:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {adminPriceRanges.slice(0, 6).map((range) => (
                        <button
                          key={range.id}
                          type="button"
                          onClick={() => {
                            setName(range.productName);
                            setCategory(range.category as ProductCategory);
                            setUnit(range.unit as QuantityUnit);
                            setPricePerUnit(Math.round((range.minPrice + range.maxPrice) / 2));
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>{range.productName}</span>
                          <span className="font-bold text-emerald-700">₹{range.minPrice}–{range.maxPrice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-semibold bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-semibold bg-white"
                  >
                    <option value="Grade A">Grade A (High Quality Standard)</option>
                    <option value="Organic Certified">Organic Certified (Chemical-Free)</option>
                    <option value="Premium Farm Fresh">Premium Farm Fresh (Export Quality)</option>
                  </select>
                </div>
              </div>

              {/* Quantity, Unit, Price per unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={availableQty}
                    onChange={(e) => setAvailableQty(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Quantity Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-bold bg-white"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="ton">Metric Ton (1,000 kg)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Price per {unit} (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pricePerUnit}
                    onChange={(e) => {
                      setPricePerUnit(e.target.value === '' ? '' : Number(e.target.value));
                      if (priceValidationError) setPriceValidationError(null);
                    }}
                    placeholder="e.g. 35"
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-hidden focus:ring-2 ${
                      currentValidation && !currentValidation.valid
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500'
                        : 'border-stone-300 focus:ring-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Admin Price Range Verification Box */}
              <div className="p-3.5 rounded-2xl border text-xs transition-all">
                {matchingPriceRange ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        Admin-Approved Price Range for {matchingPriceRange.productName}:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                        ₹{matchingPriceRange.minPrice} – ₹{matchingPriceRange.maxPrice} / {matchingPriceRange.unit}
                      </span>
                    </div>

                    {pricePerUnit !== '' && currentValidation && (
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 font-medium ${
                        currentValidation.valid 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                      }`}>
                        {currentValidation.valid ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Valid price. Product can be listed.</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{currentValidation.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {name.trim() ? (
                      <div className="flex items-center gap-2 text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>⚠️ Admin price range has not been configured for this product. Please contact Admin.</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-stone-600">
                        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span>Type or select the crop name to see the Admin-approved price range and live validation.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Farm Location & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik, Maharashtra"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                    Harvest Date *
                  </label>
                  <input
                    type="text"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    placeholder="e.g. Harvested Today 5:00 AM"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention ripening state, seed variety, farming technique (jeevamrut/organic), packaging..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                />
              </div>

              {/* Product Image: Presets or Upload */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                  Product Image *
                </label>

                {/* Preview */}
                <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-stone-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1.5 flex-1 text-xs">
                    <span className="font-bold text-stone-800 block">Selected Photo Preview</span>
                    
                    {/* File Upload Input */}
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 1-Click Agri Image Presets */}
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold block mb-1.5">
                    Or select a high-resolution agricultural photo preset:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3">
                {!matchingPriceRange && name.trim() ? (
                  <p className="text-xs text-rose-600 font-bold mr-auto">
                    ⚠️ Admin price range has not been configured for this product. Please contact Admin.
                  </p>
                ) : currentValidation && !currentValidation.valid ? (
                  <p className="text-xs text-rose-600 font-bold mr-auto">
                    ⚠️ {currentValidation.message}
                  </p>
                ) : null}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(!matchingPriceRange || (currentValidation && !currentValidation.valid))}
                    className={`px-7 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
                      !matchingPriceRange || (currentValidation && !currentValidation.valid)
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-75'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 cursor-pointer'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{editingProduct ? 'Save Changes' : 'Publish Product to Marketplace'}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
