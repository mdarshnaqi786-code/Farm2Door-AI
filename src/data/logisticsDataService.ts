import { CustomerOrder, BulkQuoteRequest, OrderStatus, LanguageCode } from '../types';
import { getCustomerOrders, getBulkQuotes, updateOrderStatus } from '../utils/marketplaceStore';

// ============================================================================
// PHASE 4: SMART LOGISTICS & ROUTE OPTIMIZATION DATA SERVICE
// Prototype Demonstration for Smart India Hackathon (SIH)
// NOTE: All calculations use deterministic Haversine distance and heuristic ordering.
// No real-time GPS or live traffic claims.
// ============================================================================

export interface GeoLocation {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  type: 'hub' | 'customer' | 'bulk_buyer';
}

// Predefined Demonstration Locations (Andhra Pradesh Agricultural Corridor)
export const DEMO_LOCATIONS: Record<string, GeoLocation> = {
  VIJAYAWADA_HUB: {
    id: 'VIJAYAWADA_HUB',
    name: 'Farmer/FPO Hub (Gollapudi Agri Yard)',
    district: 'Vijayawada (NTR)',
    state: 'Andhra Pradesh',
    latitude: 16.5414,
    longitude: 80.5936,
    type: 'hub',
  },
  MANGALAGIRI: {
    id: 'MANGALAGIRI',
    name: 'Customer A — Mangalagiri Town',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    latitude: 16.4300,
    longitude: 80.5600,
    type: 'customer',
  },
  GUNTUR: {
    id: 'GUNTUR',
    name: 'Customer B — Guntur City Centre',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    latitude: 16.3067,
    longitude: 80.4365,
    type: 'customer',
  },
  TENALI: {
    id: 'TENALI',
    name: 'Customer C — Tenali Market Area',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    latitude: 16.2430,
    longitude: 80.6400,
    type: 'customer',
  },
  GANNAVARAM: {
    id: 'GANNAVARAM',
    name: 'Customer D — Gannavaram Agro Park',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    latitude: 16.5400,
    longitude: 80.8000,
    type: 'customer',
  },
};

export interface DeliveryRecord {
  id: string;
  orderId: string;
  buyerName: string;
  buyerType: 'Consumer' | 'Bulk Buyer';
  product: string;
  quantity: string;
  quantityKg: number;
  locationName: string;
  geoLocation: GeoLocation;
  distanceKm: number;
  estimatedMinutes: number;
  transportCost: number;
  status: OrderStatus;
  isDemoData: boolean;
  orderTime: string;
}

export interface RouteStop {
  stopNumber: number;
  locationName: string;
  role: 'Farmer Hub (Origin)' | 'Delivery Stop';
  legDistanceKm: number;
  cumulativeDistanceKm: number;
  legMinutes: number;
  cumulativeMinutes: number;
  buyerName?: string;
  commodity?: string;
  quantity?: string;
}

export interface OptimizedRoutePlan {
  origin: GeoLocation;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalEstimatedMinutes: number;
  totalEstimatedCost: number;
  costPerKm: number;
  averageSpeedKmH: number;
  unoptimizedDistanceKm: number;
  unoptimizedCost: number;
  distanceSavedKm: number;
  costSaved: number;
  method: string;
}

export interface DeliveryCluster {
  clusterName: string;
  deliveries: DeliveryRecord[];
  totalDistanceKm: number;
  savingReason: string;
}

// ----------------------------------------------------------------------------
// 1. HAVERSINE DISTANCE CALCULATION
// Formula: d = 2 * R * asin(sqrt(sin^2(dlat/2) + cos(lat1)*cos(lat2)*sin^2(dlon/2)))
// ----------------------------------------------------------------------------
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place for realistic road estimation factor (~1.2x straight line)
  const roadEstimatedDistance = Math.round(distance * 1.2 * 10) / 10;
  return roadEstimatedDistance;
}

// ----------------------------------------------------------------------------
// 2. TRAVEL TIME & TRANSPORT COST CALCULATIONS
// ----------------------------------------------------------------------------
export function calculateTravelTimeMinutes(distanceKm: number, averageSpeedKmH: number = 35): number {
  if (averageSpeedKmH <= 0) return 0;
  return Math.round((distanceKm / averageSpeedKmH) * 60);
}

export function calculateTransportCost(distanceKm: number, costPerKm: number = 20): number {
  return Math.round(distanceKm * costPerKm);
}

// ----------------------------------------------------------------------------
// 3. INITIAL DEMO DELIVERIES & REAL ORDER SYNCHRONIZATION
// ----------------------------------------------------------------------------
export function getLogisticsDeliveries(
  costPerKm: number = 20,
  averageSpeedKmH: number = 35
): DeliveryRecord[] {
  const origin = DEMO_LOCATIONS.VIJAYAWADA_HUB;
  const deliveries: DeliveryRecord[] = [];

  // Check if real customer orders exist from Phase 2
  const realOrders = getCustomerOrders();
  const realBulkQuotes = getBulkQuotes();

  // If real orders exist, map them with demo coordinates
  if (realOrders && realOrders.length > 0) {
    const locKeys: (keyof typeof DEMO_LOCATIONS)[] = ['MANGALAGIRI', 'GUNTUR', 'TENALI', 'GANNAVARAM'];
    realOrders.slice(0, 4).forEach((order, idx) => {
      const locKey = locKeys[idx % locKeys.length];
      const geo = DEMO_LOCATIONS[locKey];
      const dist = calculateHaversineDistanceKm(origin.latitude, origin.longitude, geo.latitude, geo.longitude);
      const firstItem = order.items[0];
      const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

      deliveries.push({
        id: `DEL-${order.id}`,
        orderId: order.id,
        buyerName: order.customerName || `Customer ${idx + 1}`,
        buyerType: 'Consumer',
        product: firstItem?.productName || 'Farm Produce',
        quantity: `${totalQty} kg`,
        quantityKg: totalQty,
        locationName: geo.name,
        geoLocation: geo,
        distanceKm: dist,
        estimatedMinutes: calculateTravelTimeMinutes(dist, averageSpeedKmH),
        transportCost: calculateTransportCost(dist, costPerKm),
        status: order.status,
        isDemoData: false, // Connected to phase 2 customer order
        orderTime: order.date,
      });
    });
  }

  // Include prototype demo records as explicitly specified by requirements:
  // "Order #FD1001, Tomato, 150 kg, Vijayawada, 18 km, 45 min, Ready for Delivery"
  const defaultDemoList: {
    orderId: string;
    buyer: string;
    product: string;
    qtyKg: number;
    locKey: keyof typeof DEMO_LOCATIONS;
    status: OrderStatus;
    time: string;
  }[] = [
    {
      orderId: 'FD1001',
      buyer: 'Srinivasa Kirana Store (Demo)',
      product: 'Farm Fresh Desi Tomato',
      qtyKg: 150,
      locKey: 'MANGALAGIRI',
      status: 'Ready for Delivery',
      time: 'Today, 08:30 AM',
    },
    {
      orderId: 'FD1002',
      buyer: 'Lakshmi Supermart (Demo)',
      product: 'Crisp Nashik Pink Onion',
      qtyKg: 200,
      locKey: 'GUNTUR',
      status: 'In Transit',
      time: 'Today, 09:15 AM',
    },
    {
      orderId: 'FD1003',
      buyer: 'Krishna Delta FPO Canteen (Demo)',
      product: 'Golden Mountain Potato',
      qtyKg: 100,
      locKey: 'TENALI',
      status: 'Accepted',
      time: 'Today, 10:00 AM',
    },
    {
      orderId: 'FD1004',
      buyer: 'Coastal Fresh Kitchens (Demo)',
      product: 'Guntur Teja Spicy Chillies',
      qtyKg: 40,
      locKey: 'GANNAVARAM',
      status: 'Pending',
      time: 'Today, 10:45 AM',
    },
  ];

  // Add demo records if needed to ensure at least 4 clear demonstration records
  if (deliveries.length < 4) {
    defaultDemoList.slice(deliveries.length).forEach((item) => {
      const geo = DEMO_LOCATIONS[item.locKey];
      const dist = calculateHaversineDistanceKm(origin.latitude, origin.longitude, geo.latitude, geo.longitude);

      deliveries.push({
        id: `DEL-${item.orderId}`,
        orderId: item.orderId,
        buyerName: item.buyer,
        buyerType: 'Consumer',
        product: item.product,
        quantity: `${item.qtyKg} kg`,
        quantityKg: item.qtyKg,
        locationName: geo.name,
        geoLocation: geo,
        distanceKm: dist,
        estimatedMinutes: calculateTravelTimeMinutes(dist, averageSpeedKmH),
        transportCost: calculateTransportCost(dist, costPerKm),
        status: item.status,
        isDemoData: true,
        orderTime: item.time,
      });
    });
  }

  return deliveries;
}

// ----------------------------------------------------------------------------
// 4. NEAREST NEIGHBOR DETERMINISTIC ROUTE OPTIMIZATION
// ----------------------------------------------------------------------------
export function computeOptimizedRoute(
  deliveries: DeliveryRecord[],
  costPerKm: number = 20,
  averageSpeedKmH: number = 35
): OptimizedRoutePlan {
  const origin = DEMO_LOCATIONS.VIJAYAWADA_HUB;

  if (deliveries.length === 0) {
    return {
      origin,
      stops: [],
      totalDistanceKm: 0,
      totalEstimatedMinutes: 0,
      totalEstimatedCost: 0,
      costPerKm,
      averageSpeedKmH,
      unoptimizedDistanceKm: 0,
      unoptimizedCost: 0,
      distanceSavedKm: 0,
      costSaved: 0,
      method: 'Deterministic Nearest-Neighbor Heuristic',
    };
  }

  // Calculate unoptimized distance (separate back-and-forth round trips for each delivery)
  let unoptimizedDistance = 0;
  deliveries.forEach((del) => {
    const directOneWay = calculateHaversineDistanceKm(
      origin.latitude,
      origin.longitude,
      del.geoLocation.latitude,
      del.geoLocation.longitude
    );
    unoptimizedDistance += directOneWay * 2; // round trip
  });
  unoptimizedDistance = Math.round(unoptimizedDistance * 10) / 10;

  // Nearest-Neighbor Route Ordering
  const unvisited = [...deliveries];
  const orderedStops: DeliveryRecord[] = [];

  let currentLat = origin.latitude;
  let currentLon = origin.longitude;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateHaversineDistanceKm(
        currentLat,
        currentLon,
        unvisited[i].geoLocation.latitude,
        unvisited[i].geoLocation.longitude
      );
      if (d < shortestDist) {
        shortestDist = d;
        nearestIndex = i;
      }
    }

    const nextDelivery = unvisited.splice(nearestIndex, 1)[0];
    orderedStops.push(nextDelivery);
    currentLat = nextDelivery.geoLocation.latitude;
    currentLon = nextDelivery.geoLocation.longitude;
  }

  // Build route stops timeline
  const routeStops: RouteStop[] = [];
  let cumulativeDist = 0;
  let cumulativeMins = 0;

  // Origin
  routeStops.push({
    stopNumber: 0,
    locationName: origin.name,
    role: 'Farmer Hub (Origin)',
    legDistanceKm: 0,
    cumulativeDistanceKm: 0,
    legMinutes: 0,
    cumulativeMinutes: 0,
  });

  let prevLat = origin.latitude;
  let prevLon = origin.longitude;

  orderedStops.forEach((del, idx) => {
    const legDist = calculateHaversineDistanceKm(
      prevLat,
      prevLon,
      del.geoLocation.latitude,
      del.geoLocation.longitude
    );
    const legMins = calculateTravelTimeMinutes(legDist, averageSpeedKmH);

    cumulativeDist += legDist;
    cumulativeMins += legMins;

    routeStops.push({
      stopNumber: idx + 1,
      locationName: del.locationName,
      role: 'Delivery Stop',
      legDistanceKm: legDist,
      cumulativeDistanceKm: Math.round(cumulativeDist * 10) / 10,
      legMinutes: legMins,
      cumulativeMinutes: cumulativeMins,
      buyerName: del.buyerName,
      commodity: del.product,
      quantity: del.quantity,
    });

    prevLat = del.geoLocation.latitude;
    prevLon = del.geoLocation.longitude;
  });

  const totalDist = Math.round(cumulativeDist * 10) / 10;
  const totalCost = calculateTransportCost(totalDist, costPerKm);
  const unoptimizedCost = calculateTransportCost(unoptimizedDistance, costPerKm);
  const distanceSaved = Math.max(0, Math.round((unoptimizedDistance - totalDist) * 10) / 10);
  const costSaved = Math.max(0, unoptimizedCost - totalCost);

  return {
    origin,
    stops: routeStops,
    totalDistanceKm: totalDist,
    totalEstimatedMinutes: cumulativeMins,
    totalEstimatedCost: totalCost,
    costPerKm,
    averageSpeedKmH,
    unoptimizedDistanceKm: unoptimizedDistance,
    unoptimizedCost,
    distanceSavedKm: distanceSaved,
    costSaved,
    method: 'Deterministic Nearest-Neighbor Heuristic (Prototype)',
  };
}

// ----------------------------------------------------------------------------
// 5. GROUP NEARBY DELIVERIES (CLUSTERING RECOMMENDATION)
// ----------------------------------------------------------------------------
export function groupNearbyDeliveries(
  deliveries: DeliveryRecord[]
): DeliveryCluster[] {
  // Simple geographic corridor grouping for AP demonstration
  const northEastCluster: DeliveryRecord[] = [];
  const southWestCluster: DeliveryRecord[] = [];

  deliveries.forEach((del) => {
    // Deliveries along the Vijayawada-Mangalagiri-Guntur corridor vs Tenali/Gannavaram
    if (del.geoLocation.id === 'MANGALAGIRI' || del.geoLocation.id === 'GUNTUR') {
      southWestCluster.push(del);
    } else {
      northEastCluster.push(del);
    }
  });

  const clusters: DeliveryCluster[] = [];

  if (southWestCluster.length > 0) {
    const dist = southWestCluster.reduce((s, d) => s + d.distanceKm, 0);
    clusters.push({
      clusterName: 'Corridor 1: Mangalagiri & Guntur Belt (NH-16 Corridor)',
      deliveries: southWestCluster,
      totalDistanceKm: Math.round(dist * 0.7 * 10) / 10, // batched distance
      savingReason: 'Both drop locations share the NH-16 highway trunk route within 18 km radius.',
    });
  }

  if (northEastCluster.length > 0) {
    const dist = northEastCluster.reduce((s, d) => s + d.distanceKm, 0);
    clusters.push({
      clusterName: 'Corridor 2: Tenali & Delta Eastern Sector',
      deliveries: northEastCluster,
      totalDistanceKm: Math.round(dist * 0.75 * 10) / 10,
      savingReason: 'Both locations are accessible via the Krishna Canal Eastern bypass road.',
    });
  }

  return clusters;
}

// ----------------------------------------------------------------------------
// 6. UPDATE DELIVERY STATUS (SYNCS WITH MARKETPLACE STORE)
// ----------------------------------------------------------------------------
export function updateDeliveryStatusInStore(orderId: string, newStatus: OrderStatus): void {
  // Update in localStorage customer orders if real
  updateOrderStatus(orderId, newStatus);
}

// ----------------------------------------------------------------------------
// 7. VOICE ASSISTANT GROUNDED LOGISTICS RESPONSES
// ----------------------------------------------------------------------------
export function answerLogisticsQueryFromData(
  query: string,
  language: LanguageCode,
  deliveries?: DeliveryRecord[],
  routePlan?: OptimizedRoutePlan
): string | null {
  const currentDeliveries = deliveries && deliveries.length > 0 ? deliveries : getLogisticsDeliveries();
  const currentPlan = routePlan || computeOptimizedRoute(currentDeliveries);

  const q = query.toLowerCase();

  const isLogisticsQuery =
    q.includes('delivery') ||
    q.includes('deliveries') ||
    q.includes('route') ||
    q.includes('transport') ||
    q.includes('distance') ||
    q.includes('km') ||
    q.includes('डिलीवरी') ||
    q.includes('रूट') ||
    q.includes('रास्ता') ||
    q.includes('किराया') ||
    q.includes('ఖర్చు') ||
    q.includes('డెలివరీ') ||
    q.includes('రవాణా') ||
    q.includes('రూట్');

  if (!isLogisticsQuery) return null;

  const totalDeliveries = currentDeliveries.length;
  const pendingDeliveries = currentDeliveries.filter((d) => d.status !== 'Delivered').length;

  // 1. "Where is my delivery?" / "मेरी डिलीवरी कहाँ है?" / "నా డెలివరీ ఎక్కడ ఉంది?"
  if (
    q.includes('where') ||
    q.includes('status') ||
    q.includes('कहाँ') ||
    q.includes('कहा') ||
    q.includes('स्थिति') ||
    q.includes('ఎక్కడ') ||
    q.includes('స్థితి')
  ) {
    const active = currentDeliveries.find((d) => d.status !== 'Delivered') || currentDeliveries[0];
    if (!active) {
      return language === 'hi' 
        ? 'फिलहाल कोई सक्रिय डिलीवरी नहीं है। सभी ऑर्डर डिलीवर हो चुके हैं।' 
        : language === 'te' 
        ? 'ప్రస్తుతం సక్రియ డెలివరీలు ఏవీ లేవు. అన్ని ఆర్డర్లు పూర్తయ్యాయి.' 
        : 'There are no pending deliveries at this moment. All dispatches are completed.';
    }
    if (language === 'hi') {
      return `आपकी डिलीवरी #${active.orderId} (${active.product}) वर्तमान में "${active.status}" स्थिति में है। गंतव्य: ${active.locationName}। अनुमानित दूरी ${active.distanceKm} किमी है।`;
    }
    if (language === 'te') {
      return `మీ డెలివరీ #${active.orderId} (${active.product}) ప్రస్తుతం "${active.status}" స్థితిలో ఉంది. చేరవలసిన స్థలం: ${active.locationName}. అంచనా దూరం ${active.distanceKm} కిమీ.`;
    }
    return `Your delivery #${active.orderId} for ${active.product} is currently "${active.status}" heading towards ${active.locationName}. Estimated distance is ${active.distanceKm} km.`;
  }

  // 2. "How much distance can I save?" / "मैं कितनी दूरी बचा सकता हूँ?" / "నేను ఎంత దూరం ఆదా చేయగలను?"
  if (
    q.includes('save') ||
    q.includes('saving') ||
    q.includes('बचा') ||
    q.includes('बचत') ||
    q.includes('ఆదా') ||
    q.includes('మిగులు')
  ) {
    if (language === 'hi') {
      return `स्मार्ट रूट अनुकूलन से आप लगभग ${currentPlan.distanceSavedKm} किलोमीटर की दूरी बचा सकते हैं, जिससे लगभग ₹${currentPlan.costSaved} की परिवहन बचत का अनुमान है। (प्रोटोटाइप अनुमान मॉडल)।`;
    }
    if (language === 'te') {
      return `స్మార్ట్ రూట్ ఆప్టిమైజేషన్ ద్వారా మీరు సుమారు ${currentPlan.distanceSavedKm} కిలోమీటర్ల దూరం ఆదా చేయవచ్చు మరియు సుమారు ₹${currentPlan.costSaved} రవాణా ఖర్చు ఆదా అవుతుంది.`;
    }
    return `By using consolidated smart routing, you save approximately ${currentPlan.distanceSavedKm} km of travel distance, reducing estimated transport costs by ₹${currentPlan.costSaved}. (Prototype estimate model).`;
  }

  // 3. "What is my delivery route?" / "Show my delivery route"
  if (
    q.includes('route') ||
    q.includes('path') ||
    q.includes('रूट') ||
    q.includes('रास्ता') ||
    q.includes('రూట్') ||
    q.includes('మార్గం')
  ) {
    const stopsList = currentPlan.stops
      .filter((s) => s.stopNumber > 0)
      .map((s) => s.locationName)
      .join(' → ');

    if (language === 'hi') {
      return `एआई सुझाया गया रूट है: विजयवाड़ा हब से ${stopsList}। कुल अनुमानित समय लगभग ${currentPlan.totalEstimatedMinutes} मिनट है।`;
    }
    if (language === 'te') {
      return `సిఫార్సు చేయబడిన రూట్: విజయవాడ హబ్ నుండి ${stopsList}. మొత్తం అంచనా సమయం సుమారు ${currentPlan.totalEstimatedMinutes} నిమిషాలు.`;
    }
    return `The recommended delivery route starts at Vijayawada Hub and visits: ${stopsList}. Estimated travel time is ${currentPlan.totalEstimatedMinutes} minutes.`;
  }

  // 4. "How many deliveries do I have?" / "Show my deliveries"
  if (
    q.includes('how many') ||
    q.includes('show') ||
    q.includes('count') ||
    q.includes('कितनी') ||
    q.includes('दिखाओ') ||
    q.includes('ఎన్ని') ||
    q.includes('చూపించు')
  ) {
    if (language === 'hi') {
      return `आपके पास कुल ${totalDeliveries} डिलीवरी रिकॉर्ड हैं, जिनमें से ${pendingDeliveries} सक्रिय हैं। कुल यात्रा दूरी लगभग ${currentPlan.totalDistanceKm} किमी है।`;
    }
    if (language === 'te') {
      return `మీ వద్ద మొత్తం ${totalDeliveries} డెలివరీలు ఉన్నాయి, అందులో ${pendingDeliveries} డెలివరీలు ఇంకా పెండింగ్‌లో ఉన్నాయి. మొత్తం ప్రయాణ దూరం సుమారు ${currentPlan.totalDistanceKm} కిమీ.`;
    }
    return `You have ${totalDeliveries} delivery records in your schedule (${pendingDeliveries} pending). Total route distance is approximately ${currentPlan.totalDistanceKm} km.`;
  }

  // 5. "What is the estimated transport cost?"
  if (
    q.includes('cost') ||
    q.includes('fare') ||
    q.includes('खर्च') ||
    q.includes('किराया') ||
    q.includes('ఖర్చు') ||
    q.includes('ధర')
  ) {
    if (language === 'hi') {
      return `अनुमानित कुल परिवहन खर्च ₹${currentPlan.totalEstimatedCost} है (${currentPlan.totalDistanceKm} किमी × ₹${currentPlan.costPerKm}/किमी)। समूहीकृत रूट से लगभग ₹${currentPlan.costSaved} की बचत का अनुमान है।`;
    }
    if (language === 'te') {
      return `అంచనా రవాణా ఖర్చు ₹${currentPlan.totalEstimatedCost} (${currentPlan.totalDistanceKm} కిమీ × ₹${currentPlan.costPerKm}/కిమీ). సమిష్టి రూట్ ద్వారా సుమారు ₹${currentPlan.costSaved} ఆదా అవుతుంది.`;
    }
    return `The estimated transport cost is ₹${currentPlan.totalEstimatedCost} (${currentPlan.totalDistanceKm} km at ₹${currentPlan.costPerKm}/km). Consolidated routing saves an estimated ₹${currentPlan.costSaved}.`;
  }

  return null;
}
