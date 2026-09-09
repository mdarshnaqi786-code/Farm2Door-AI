import { 
  FarmerProduct, 
  CustomerOrder, 
  BulkQuoteRequest, 
  FarmerEnquiry, 
  ProductCategory, 
  QuantityUnit, 
  OrderStatus 
} from '../types';

const PRODUCTS_KEY = 'farm2door_marketplace_products';
const ORDERS_KEY = 'farm2door_customer_orders';
const BULK_QUOTES_KEY = 'farm2door_bulk_quotes';
const ENQUIRIES_KEY = 'farm2door_farmer_enquiries';

// High-quality realistic sample agricultural products covering all required categories
export const INITIAL_DEMO_PRODUCTS: FarmerProduct[] = [
  {
    id: 'prod-tomato-1',
    name: 'Farm Fresh Desi Tomato',
    hindiName: 'देसी लाल टमाटर',
    teluguName: 'నాటు తాజా టమోటా',
    category: 'Vegetables',
    farmerName: 'Ramesh Patil',
    fpoName: 'Sahyadri Kisan Producer Co.',
    location: 'Nashik, Maharashtra',
    grade: 'Grade A',
    pricePerUnit: 34,
    pricePerKg: 34,
    unit: 'kg',
    availableQty: 850,
    availableKg: 850,
    minOrderQty: 2,
    farmerShare: 27,
    logisticsShare: 4.5,
    platformShare: 2.5,
    harvestDate: 'Today, 5:00 AM',
    freshnessDays: 0,
    freshnessIndicator: 'Harvested Today • 100% Fresh',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    description: 'Naturally vine-ripened, firm and juicy red tomatoes plucked fresh from the field with zero chemical accelerants.',
    isUserCreated: false,
  },
  {
    id: 'prod-onion-1',
    name: 'Crisp Nashik Pink Onion',
    hindiName: 'ताजा नासिक गुलाबी प्याज',
    teluguName: 'నాసిక్ గులాబీ ఉల్లిపాయ',
    category: 'Vegetables',
    farmerName: 'Dnyaneshwar Shinde',
    fpoName: 'Godavari Valley Farmers FPO',
    location: 'Lasalgaon, Maharashtra',
    grade: 'Grade A',
    pricePerUnit: 28,
    pricePerKg: 28,
    unit: 'kg',
    availableQty: 1200,
    availableKg: 1200,
    minOrderQty: 3,
    farmerShare: 22.5,
    logisticsShare: 3.5,
    platformShare: 2.0,
    harvestDate: 'Yesterday, 4:00 PM',
    freshnessDays: 1,
    freshnessIndicator: 'Sun-Cured 1 Day Ago • 98% Fresh',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    description: 'Thin-skinned, pungent, and long shelf-life red-pink onions directly from India\'s onion capital.',
    isUserCreated: false,
  },
  {
    id: 'prod-potato-1',
    name: 'Golden Mountain Potato',
    hindiName: 'पहाड़ी ताजा आलू',
    teluguName: 'బంగారు బంగాళాదుంప',
    category: 'Vegetables',
    farmerName: 'Sita Ram Verma',
    fpoName: 'Yamuna Green Producer Org',
    location: 'Agra, Uttar Pradesh',
    grade: 'Grade A',
    pricePerUnit: 24,
    pricePerKg: 24,
    unit: 'kg',
    availableQty: 2400,
    availableKg: 2400,
    minOrderQty: 5,
    farmerShare: 19.2,
    logisticsShare: 3.0,
    platformShare: 1.8,
    harvestDate: '2 Days Ago',
    freshnessDays: 2,
    freshnessIndicator: 'Field Dug 2 Days Ago • 96% Fresh',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    description: 'Evenly sized, clean-skinned potatoes with rich starch content, ideal for everyday cooking and culinary curries.',
    isUserCreated: false,
  },
  {
    id: 'prod-rice-1',
    name: 'Organic Sona Masoori Unpolished Rice',
    hindiName: 'सोना मसूरी जैविक चावल',
    teluguName: 'సేంద్రీయ సోనా మసూరి బియ్యం',
    category: 'Grains',
    farmerName: 'Suresh Reddy',
    fpoName: 'Tungabhadra Organic Collective',
    location: 'Kurnool, Andhra Pradesh',
    grade: 'Organic Certified',
    pricePerUnit: 68,
    pricePerKg: 68,
    unit: 'kg',
    availableQty: 3500,
    availableKg: 3500,
    minOrderQty: 10,
    farmerShare: 54,
    logisticsShare: 8,
    platformShare: 6,
    harvestDate: 'Current Season Fresh Harvest',
    freshnessDays: 5,
    freshnessIndicator: 'Pesticide-Free • Single Origin',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    description: 'Aromatic, aged naturally on the field, unpolished Sona Masoori grain with high fiber and low glycemic index.',
    isUserCreated: false,
  },
  {
    id: 'prod-mango-1',
    name: 'Ratnagiri Alphonso Mango (Hapus)',
    hindiName: 'रत्नागिरी अल्फांसो आम',
    teluguName: 'రత్నగిరి అల్ఫోన్సో మామిడి',
    category: 'Fruits',
    farmerName: 'Anand Deshmukh',
    fpoName: 'Konkan Mango Growers Producer Co.',
    location: 'Ratnagiri, Maharashtra',
    grade: 'Premium Farm Fresh',
    pricePerUnit: 140,
    pricePerKg: 140,
    unit: 'kg',
    availableQty: 450,
    availableKg: 450,
    minOrderQty: 2,
    farmerShare: 112,
    logisticsShare: 18,
    platformShare: 10,
    harvestDate: 'Yesterday Morning',
    freshnessDays: 1,
    freshnessIndicator: 'Tree Ripened • GI Tagged Origin',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    description: 'Golden, intensely fragrant, naturally tree-ripened Alphonso mangoes with rich saffron pulp and zero carbide usage.',
    isUserCreated: false,
  },
  {
    id: 'prod-banana-1',
    name: 'Jalgaon Robusta Golden Bananas',
    hindiName: 'जलगांव मीठा केला',
    teluguName: 'జలగావ్ అరటిపండ్లు',
    category: 'Fruits',
    farmerName: 'Sunil Patil',
    fpoName: 'Khandesh Banana Federation',
    location: 'Jalgaon, Maharashtra',
    grade: 'Grade A',
    pricePerUnit: 38,
    pricePerKg: 38,
    unit: 'kg',
    availableQty: 1800,
    availableKg: 1800,
    minOrderQty: 3,
    farmerShare: 30,
    logisticsShare: 5,
    platformShare: 3,
    harvestDate: 'Today, 6:00 AM',
    freshnessDays: 0,
    freshnessIndicator: 'Plucked Today • 100% Chemical-Free',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    description: 'Sweet, potassium-dense Robusta bananas harvested green-turning-yellow from the famous Khandesh banana belt.',
    isUserCreated: false,
  },
  {
    id: 'prod-chilli-1',
    name: 'Guntur Teja Spicy Green Chillies',
    hindiName: 'गुंटूर तेज हरी मिर्च',
    teluguName: 'గుంటూరు తేజ పచ్చి మిరపకాయలు',
    category: 'Vegetables',
    farmerName: 'K. Venkat Rao',
    fpoName: 'Krishna Delta Chilli Growers',
    location: 'Guntur, Andhra Pradesh',
    grade: 'Grade A',
    pricePerUnit: 52,
    pricePerKg: 52,
    unit: 'kg',
    availableQty: 620,
    availableKg: 620,
    minOrderQty: 1,
    farmerShare: 41,
    logisticsShare: 6.5,
    platformShare: 4.5,
    harvestDate: 'Today, 5:30 AM',
    freshnessDays: 0,
    freshnessIndicator: 'Handpicked Today • Crisp & Pungent',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    description: 'High-pungency, bright green, glossy Guntur Teja chillies. Ideal for authentic spice lovers and restaurant bulk prep.',
    isUserCreated: false,
  },
  {
    id: 'prod-turmeric-1',
    name: 'Salem Golden Curcumin Turmeric',
    hindiName: 'सेलम शुद्ध हल्दी',
    teluguName: 'సేలం స్వచ్ఛమైన పసుపు',
    category: 'Spices',
    farmerName: 'Murugan Swamy',
    fpoName: 'Cauvery Basin Spices Collective',
    location: 'Erode, Tamil Nadu',
    grade: 'Organic Certified',
    pricePerUnit: 180,
    pricePerKg: 180,
    unit: 'kg',
    availableQty: 480,
    availableKg: 480,
    minOrderQty: 1,
    farmerShare: 145,
    logisticsShare: 20,
    platformShare: 15,
    harvestDate: 'Sun-Dried This Week',
    freshnessDays: 4,
    freshnessIndicator: '5.2% High Curcumin Content',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    description: 'Pure, aromatic golden turmeric fingers grown without synthetic fertilizers. Lab-tested 5.2% curcumin potency.',
    isUserCreated: false,
  },
  {
    id: 'prod-ghee-1',
    name: 'Vedic A2 Desi Gir Cow Ghee',
    hindiName: 'वैदिक ए2 गिर गाय घी',
    teluguName: 'వేద ఏ2 దేశీ ఆవు నెయ్యి',
    category: 'Dairy Products',
    farmerName: 'Bhavesh Patel',
    fpoName: 'Gir Amrut Gaushala Cooperative',
    location: 'Anand, Gujarat',
    grade: 'Organic Certified',
    pricePerUnit: 850,
    pricePerKg: 850,
    unit: 'kg',
    availableQty: 120,
    availableKg: 120,
    minOrderQty: 1,
    farmerShare: 710,
    logisticsShare: 80,
    platformShare: 60,
    harvestDate: 'Churned Yesterday (Bilona Method)',
    freshnessDays: 1,
    freshnessIndicator: 'Traditional Wood Churned Bilona',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
    description: 'Golden, granular A2 ghee made from curd of free-grazing Gir cows using ancient earthen bilona churning method.',
    isUserCreated: false,
  }
];

// Initial demo customer orders
const INITIAL_DEMO_ORDERS: CustomerOrder[] = [
  {
    id: 'F2D-9042',
    date: 'Today, 08:30 AM',
    timestamp: Date.now() - 3600000 * 2,
    customerName: 'Ananya Sharma',
    customerPhone: '+91 98450 12345',
    deliveryAddress: 'Flat 402, Green Meadows, Indiranagar, Bengaluru, KA',
    items: [
      {
        productId: 'prod-tomato-1',
        productName: 'Farm Fresh Desi Tomato',
        category: 'Vegetables',
        quantity: 3,
        unit: 'kg',
        pricePerUnit: 34,
        farmerName: 'Ramesh Patil',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-onion-1',
        productName: 'Crisp Nashik Pink Onion',
        category: 'Vegetables',
        quantity: 2,
        unit: 'kg',
        pricePerUnit: 28,
        farmerName: 'Dnyaneshwar Shinde',
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&auto=format&fit=crop&q=80',
      }
    ],
    totalAmount: 158,
    farmerPayout: 126,
    status: 'Ready for Delivery',
    speechSummary: 'Order F2D-9042 has 3kg tomatoes and 2kg onions. Status: Ready for Delivery.',
  },
  {
    id: 'F2D-8821',
    date: 'Yesterday, 11:15 AM',
    timestamp: Date.now() - 3600000 * 26,
    customerName: 'Vikram Joshi',
    customerPhone: '+91 97110 54321',
    deliveryAddress: 'House 14, Koramangala 4th Block, Bengaluru, KA',
    items: [
      {
        productId: 'prod-potato-1',
        productName: 'Golden Mountain Potato',
        category: 'Vegetables',
        quantity: 5,
        unit: 'kg',
        pricePerUnit: 24,
        farmerName: 'Sita Ram Verma',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80',
      }
    ],
    totalAmount: 120,
    farmerPayout: 96,
    status: 'Delivered',
    speechSummary: 'Order F2D-8821 was successfully delivered yesterday.',
  }
];

// Initial demo bulk quote requests
const INITIAL_DEMO_BULK_QUOTES: BulkQuoteRequest[] = [
  {
    id: 'BLK-701',
    productId: 'prod-tomato-1',
    productName: 'Farm Fresh Desi Tomato',
    category: 'Vegetables',
    buyerName: 'Amit Mehra',
    buyerCompany: 'FreshBazaar Retail Chain Pvt Ltd',
    buyerContact: '+91 98200 99887',
    farmerName: 'Ramesh Patil',
    requiredQty: 25,
    unit: 'quintal',
    expectedPrice: 3100, // ₹3100 per quintal = ₹31/kg
    deliveryLocation: 'Bengaluru Central Distribution Center, Hosur Road',
    requiredDeliveryDate: '2026-09-14',
    additionalRequirements: 'Grade A firmness, sorting size 55-65mm, ventilated plastic crates packaging.',
    status: 'Pending',
    date: 'Today, 09:15 AM',
    timestamp: Date.now() - 3600000 * 1.5,
  },
  {
    id: 'BLK-702',
    productId: 'prod-onion-1',
    productName: 'Crisp Nashik Pink Onion',
    category: 'Vegetables',
    buyerName: 'Priya Sundaram',
    buyerCompany: 'Southern Spice Foods Co.',
    buyerContact: '+91 94440 33221',
    farmerName: 'Dnyaneshwar Shinde',
    requiredQty: 50,
    unit: 'quintal',
    expectedPrice: 2600, // ₹26/kg
    deliveryLocation: 'Chennai Agro-Logistics Warehouse, Redhills',
    requiredDeliveryDate: '2026-09-16',
    additionalRequirements: 'Well-cured dry outer skin, 45mm+ diameter, double-stitched jute bags.',
    status: 'Accepted',
    date: 'Yesterday, 03:30 PM',
    timestamp: Date.now() - 3600000 * 20,
  }
];

// Initial demo farmer enquiries
const INITIAL_DEMO_ENQUIRIES: FarmerEnquiry[] = [
  {
    id: 'ENQ-301',
    productId: 'prod-tomato-1',
    productName: 'Farm Fresh Desi Tomato',
    farmerName: 'Ramesh Patil',
    buyerName: 'Rahul Verma',
    buyerRole: 'consumer',
    buyerContact: '+91 99881 12233',
    message: 'Namaste Patil ji, is this morning\'s harvest naturally ripened without any chemicals or ethylene spray?',
    date: 'Today, 10:20 AM',
    timestamp: Date.now() - 3600000 * 0.8,
    replied: true,
    replyMessage: 'Namaste! Yes, 100% naturally vine-ripened on our family farm. Plucked directly from the plants at 5 AM.',
  },
  {
    id: 'ENQ-302',
    productId: 'prod-rice-1',
    productName: 'Organic Sona Masoori Unpolished Rice',
    farmerName: 'Suresh Reddy',
    buyerName: 'Sangeetha Nair',
    buyerRole: 'bulk_buyer',
    buyerContact: '+91 98400 55667',
    message: 'Hello Reddy garu, can you supply 15 quintals in 25kg vacuum-sealed organic labeled packaging by next week?',
    date: 'Today, 11:05 AM',
    timestamp: Date.now() - 3600000 * 0.4,
    replied: false,
  }
];

// -------------------------------------------------------------
// PRODUCT STORAGE OPERATIONS
// -------------------------------------------------------------

export function getMarketplaceProducts(): FarmerProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      return INITIAL_DEMO_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      return INITIAL_DEMO_PRODUCTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse marketplace products:', e);
    return INITIAL_DEMO_PRODUCTS;
  }
}

export function saveProduct(productData: Omit<FarmerProduct, 'id'> & { id?: string }): FarmerProduct {
  const products = getMarketplaceProducts();
  const id = productData.id || `prod-user-${Date.now()}`;
  
  const unit = productData.unit || 'kg';
  const pricePerUnit = Number(productData.pricePerUnit) || 0;
  const availableQty = Number(productData.availableQty) || 0;

  // Calculate fair farmer share ~80%
  const farmerShare = productData.farmerShare || Math.round(pricePerUnit * 0.8 * 10) / 10;
  const logisticsShare = productData.logisticsShare || Math.round(pricePerUnit * 0.12 * 10) / 10;
  const platformShare = productData.platformShare || Math.round(pricePerUnit * 0.08 * 10) / 10;

  const newProduct: FarmerProduct = {
    ...productData,
    id,
    unit,
    pricePerUnit,
    pricePerKg: pricePerUnit,
    availableQty,
    availableKg: availableQty,
    farmerShare,
    logisticsShare,
    platformShare,
    isUserCreated: true,
    freshnessIndicator: productData.freshnessIndicator || 'Harvest-Fresh • Cultivator Direct',
  };

  const existingIndex = products.findIndex((p) => p.id === id);
  if (existingIndex >= 0) {
    products[existingIndex] = newProduct;
  } else {
    // New products appear at the front of the marketplace
    products.unshift(newProduct);
  }

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('farm2door_products_updated'));
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<FarmerProduct>): FarmerProduct | null {
  const products = getMarketplaceProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = products[index];
  const updatedProduct: FarmerProduct = {
    ...existing,
    ...updates,
    pricePerKg: updates.pricePerUnit !== undefined ? updates.pricePerUnit : existing.pricePerKg,
    availableKg: updates.availableQty !== undefined ? updates.availableQty : existing.availableKg,
  };

  products[index] = updatedProduct;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('farm2door_products_updated'));
  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const products = getMarketplaceProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('farm2door_products_updated'));
  return true;
}

// -------------------------------------------------------------
// CUSTOMER ORDERS OPERATIONS
// -------------------------------------------------------------

export function getCustomerOrders(): CustomerOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_ORDERS;
  } catch (e) {
    return INITIAL_DEMO_ORDERS;
  }
}

export function createCustomerOrder(orderData: Omit<CustomerOrder, 'id' | 'timestamp' | 'date'>): CustomerOrder {
  const orders = getCustomerOrders();
  const id = `F2D-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newOrder: CustomerOrder = {
    ...orderData,
    id,
    date: dateStr,
    timestamp: Date.now(),
    status: orderData.status || 'Pending',
    speechSummary: `Order ${id} for ${orderData.items.length} farm fresh items has been placed.`,
  };

  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Also reduce available quantities of ordered products in marketplace
  try {
    const products = getMarketplaceProducts();
    orderData.items.forEach((item) => {
      const match = products.find((p) => p.id === item.productId || p.name === item.productName);
      if (match) {
        match.availableQty = Math.max(0, match.availableQty - item.quantity);
        match.availableKg = match.availableQty;
      }
    });
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to deduct product stock on order:', e);
  }

  window.dispatchEvent(new Event('farm2door_orders_updated'));
  window.dispatchEvent(new Event('farm2door_products_updated'));
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): boolean {
  const orders = getCustomerOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return false;

  target.status = status;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('farm2door_orders_updated'));
  return true;
}

// -------------------------------------------------------------
// BULK QUOTE REQUEST OPERATIONS
// -------------------------------------------------------------

export function getBulkQuotes(): BulkQuoteRequest[] {
  try {
    const raw = localStorage.getItem(BULK_QUOTES_KEY);
    if (!raw) {
      localStorage.setItem(BULK_QUOTES_KEY, JSON.stringify(INITIAL_DEMO_BULK_QUOTES));
      return INITIAL_DEMO_BULK_QUOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_BULK_QUOTES;
  } catch (e) {
    return INITIAL_DEMO_BULK_QUOTES;
  }
}

export function createBulkQuote(quoteData: Omit<BulkQuoteRequest, 'id' | 'timestamp' | 'date' | 'status'>): BulkQuoteRequest {
  const quotes = getBulkQuotes();
  const id = `BLK-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newQuote: BulkQuoteRequest = {
    ...quoteData,
    id,
    date: dateStr,
    timestamp: Date.now(),
    status: 'Pending',
  };

  quotes.unshift(newQuote);
  localStorage.setItem(BULK_QUOTES_KEY, JSON.stringify(quotes));
  window.dispatchEvent(new Event('farm2door_bulk_quotes_updated'));
  return newQuote;
}

export function updateBulkQuoteStatus(quoteId: string, status: OrderStatus): boolean {
  const quotes = getBulkQuotes();
  const target = quotes.find((q) => q.id === quoteId);
  if (!target) return false;

  target.status = status;
  localStorage.setItem(BULK_QUOTES_KEY, JSON.stringify(quotes));
  window.dispatchEvent(new Event('farm2door_bulk_quotes_updated'));
  return true;
}

// -------------------------------------------------------------
// FARMER DIRECT ENQUIRIES OPERATIONS
// -------------------------------------------------------------

export function getFarmerEnquiries(): FarmerEnquiry[] {
  try {
    const raw = localStorage.getItem(ENQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(INITIAL_DEMO_ENQUIRIES));
      return INITIAL_DEMO_ENQUIRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_ENQUIRIES;
  } catch (e) {
    return INITIAL_DEMO_ENQUIRIES;
  }
}

export function createFarmerEnquiry(enquiryData: Omit<FarmerEnquiry, 'id' | 'timestamp' | 'date'>): FarmerEnquiry {
  const enquiries = getFarmerEnquiries();
  const id = `ENQ-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newEnquiry: FarmerEnquiry = {
    ...enquiryData,
    id,
    date: dateStr,
    timestamp: Date.now(),
    replied: false,
  };

  enquiries.unshift(newEnquiry);
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
  window.dispatchEvent(new Event('farm2door_enquiries_updated'));
  return newEnquiry;
}

export function replyToEnquiry(enquiryId: string, replyMessage: string): boolean {
  const enquiries = getFarmerEnquiries();
  const target = enquiries.find((e) => e.id === enquiryId);
  if (!target) return false;

  target.replied = true;
  target.replyMessage = replyMessage;
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
  window.dispatchEvent(new Event('farm2door_enquiries_updated'));
  return true;
}
