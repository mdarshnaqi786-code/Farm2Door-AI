export type UserRole = 'farmer' | 'consumer' | 'bulk_buyer';

export type AppView = 
  | 'role_selection'
  | 'auth'
  | 'landing' 
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
  role: UserRole;
  language: string;
  fpoOrOrgName?: string;
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

export interface FarmerProduct {
  id: string;
  name: string;
  hindiName: string;
  teluguName: string;
  farmerName: string;
  fpoName?: string;
  location: string;
  grade: 'Grade A' | 'Organic Certified' | 'Premium Farm Fresh';
  pricePerKg: number;
  farmerShare: number; // ₹ that goes straight to farmer
  logisticsShare: number;
  platformShare: number;
  availableKg: number;
  harvestDate: string;
  image: string;
  description: string;
  unit: string;
}

export interface CartItem {
  product: FarmerProduct;
  quantityKg: number;
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
