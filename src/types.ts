export type UserRole = 'farmer' | 'consumer' | 'admin' | 'bulk_buyer';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AppView = 
  | 'role_selection'
  | 'auth'
  | 'admin_dashboard'
  // Farmer views
  | 'farmer_home'
  | 'farmer_products'
  | 'farmer_orders'
  | 'farmer_voice_hub'
  | 'farmer_market_intel'
  | 'farmer_logistics'
  // Customer views
  | 'customer_home'
  | 'customer_marketplace'
  | 'customer_orders'
  // Bulk Buyer views
  | 'bulk_home'
  | 'bulk_marketplace'
  | 'bulk_orders'
  | 'bulk_market_intel'
  | 'bulk_logistics'
  // Legacy aliases for compatibility
  | 'farmer' 
  | 'consumer' 
  | 'bulk_buyer' 
  | 'market_intel' 
  | 'logistics';

export type LanguageCode = string;

export interface SupportedLanguage {
  code: string;
  nameEn: string;
  nameNative: string;
  scriptLabel: string;
  bcp47: string;
  speechAudioText: string;
  region: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  contact: string;
  email?: string;
  password?: string;
  role: UserRole;
  language: string;
  fpoOrOrgName?: string;
  location?: string;
  approvalStatus?: ApprovalStatus;
  createdAt: string;
}

export interface CommodityPrice {
  commodity: string;
  hindiName: string;
  teluguName: string;
  market: string;
  state: string;
  minPrice: number; // in ₹/kg
  maxPrice: number;
  modalPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  aiInsight: {
    en: string;
    hi: string;
    te: string;
  };
  recommendation: {
    en: string;
    hi: string;
    te: string;
    action: 'SELL NOW' | 'HOLD 2-3 DAYS' | 'PARTIAL DISPATCH';
  };
  history7Days: { date: string; price: number }[];
}

export type ProductCategory = 
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Dairy Products'
  | 'Other Agricultural Products';

export type QuantityUnit = 'kg' | 'quintal' | 'ton';

export type OrderStatus = 'Pending' | 'Accepted' | 'Ready for Delivery' | 'In Transit' | 'Delivered' | 'Rejected';

export interface FarmerProduct {
  id: string;
  name: string;
  hindiName?: string;
  teluguName?: string;
  farmerName: string;
  fpoName?: string;
  farmerId?: string;
  location: string;
  grade: 'Grade A' | 'Organic Certified' | 'Premium Farm Fresh' | string;
  category: ProductCategory;
  pricePerUnit: number;
  pricePerKg: number; // for compatibility with legacy cart
  unit: QuantityUnit | string;
  availableQty: number;
  availableKg: number; // for compatibility with legacy cart
  minOrderQty?: number;
  farmerShare: number; // ₹ that goes straight to farmer
  logisticsShare: number;
  platformShare: number;
  harvestDate: string;
  freshnessDays?: number;
  freshnessIndicator?: string;
  image: string;
  description: string;
  isUserCreated?: boolean;
}

export interface CartItem {
  product: FarmerProduct;
  quantityKg: number;
}

export interface CustomerOrder {
  id: string;
  date: string;
  timestamp: number;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  items: {
    productId: string;
    productName: string;
    category: ProductCategory;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    farmerName: string;
    farmerId?: string;
    image?: string;
  }[];
  totalAmount: number;
  farmerPayout: number;
  status: OrderStatus;
  speechSummary?: string;
}

export interface BulkQuoteRequest {
  id: string;
  productId?: string;
  productName: string;
  category?: ProductCategory;
  buyerName: string;
  buyerCompany?: string;
  buyerContact?: string;
  farmerName: string;
  farmerId?: string;
  requiredQty: number;
  unit: QuantityUnit | string;
  expectedPrice: number; // Expected price per unit
  deliveryLocation: string;
  requiredDeliveryDate: string;
  additionalRequirements: string;
  status: OrderStatus;
  date: string;
  timestamp: number;
}

export interface FarmerEnquiry {
  id: string;
  productId: string;
  productName: string;
  farmerName: string;
  farmerId?: string;
  buyerName: string;
  buyerRole: 'consumer' | 'bulk_buyer';
  buyerContact?: string;
  message: string;
  date: string;
  timestamp: number;
  replied?: boolean;
  replyMessage?: string;
}

export interface BulkRequirement {
  id: string;
  commodity: string;
  quantityQuintals: number;
  targetDate: string;
  qualityGrade: string;
  buyerName: string;
  deliveryLocation: string;
  status: 'Open' | 'Matched' | 'Dispatched';
}

export interface FPOMatch {
  id: string;
  name: string;
  location: string;
  state: string;
  distanceKm: number;
  memberFarmers: number;
  availableVolumeQuintals: number;
  quotedPricePerQuintal: number;
  matchScore: number;
  qualityRating: number;
  verified: boolean;
  contactPerson: string;
}

export interface LogisticsDelivery {
  id: string;
  orderId: string;
  commodity: string;
  quantity: string;
  origin: string;
  destination: string;
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  status: 'Dispatched' | 'En Route' | 'Sorting Hub' | 'Delivered';
  etaMinutes: number;
  temperature?: string;
  progressPercent: number;
}

export interface LogisticsVehicle {
  id: string;
  type: string;
  numberPlate: string;
  driver: string;
  capacityKg: number;
  currentLoadKg: number;
  batteryOrFuel: string;
  status: 'Active En Route' | 'Available at Hub' | 'Loading';
  isElectric: boolean;
}
