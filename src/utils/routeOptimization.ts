/**
 * ============================================================================
 * FARM2DOOR AI - SMART LOGISTICS & NEAREST NEIGHBOUR ROUTE OPTIMIZATION ENGINE
 * ============================================================================
 * 
 * Algorithm:
 *   1. Start from the farmer's pickup/source location (Hub Origin).
 *   2. Identify all pending customer delivery locations.
 *   3. Calculate geographic Haversine distance between current location and every
 *      unvisited customer.
 *   4. Select the nearest unvisited customer (greedy Nearest Neighbour heuristic).
 *   5. Move to that customer and mark as visited.
 *   6. Repeat until all pending customers are visited.
 *   7. Return to the farmer/source hub if round-trip mode is enabled.
 *   8. Compute leg distances, cumulative distances, travel times, and total cost.
 * 
 * IMPORTANT:
 *   Nearest Neighbour is a greedy heuristic that finds an efficient, realistic
 *   delivery route. It is labelled as an optimized route generated via the
 *   Nearest Neighbour heuristic.
 * 
 * All geographic calculations are deterministic using the Haversine formula.
 * No random values (Math.random) are used for coordinates, distances, or costs.
 * ============================================================================
 */

import { OrderStatus } from '../types';

export const DEFAULT_COST_PER_KM = 20; // Default ₹20 / km (configurable)
export const DEFAULT_AVERAGE_SPEED_KMH = 35; // Default 35 km/h average rural/peri-urban road speed

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface HubLocation extends GeoCoordinate {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  type: 'hub';
}

export interface DeliveryCustomer extends GeoCoordinate {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  locationName: string;
  product: string;
  quantity: string;
  quantityKg: number;
  orderAmount?: number;
  status: OrderStatus;
  isDemoData: boolean;
  orderTime: string;
}

export interface RouteStopDetail {
  stopNumber: number; // 0 = Start, 1..N = Customer Drops, N+1 = Return
  type: 'origin' | 'customer' | 'return';
  label: string;
  customerName?: string;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  legDistanceKm: number;
  cumulativeDistanceKm: number;
  legMinutes: number;
  cumulativeMinutes: number;
  orderId?: string;
  status?: OrderStatus;
  product?: string;
  quantity?: string;
  customerPhone?: string;
  isDemoData?: boolean;
}

export interface OptimizedRouteResult {
  origin: HubLocation;
  stops: RouteStopDetail[];
  customerCount: number;
  totalDistanceKm: number;
  estimatedTotalCost: number;
  costPerKm: number;
  averageSpeedKmH: number;
  estimatedTotalMinutes: number;
  isRoundTrip: boolean;
  algorithmMethod: string;
  unoptimizedDistanceKm: number;
  unoptimizedCost: number;
  distanceSavedKm: number;
  costSaved: number;
}

// ----------------------------------------------------------------------------
// 1. DEFAULT FARMER HUB LOCATION (SOURCE / PICKUP)
// Gollapudi Agricultural Market Yard, Vijayawada, Andhra Pradesh
// ----------------------------------------------------------------------------
export const DEFAULT_FARMER_HUB: HubLocation = {
  id: 'VIJAYAWADA_FARMER_HUB',
  name: 'Farmer Consolidation Hub',
  address: 'Gollapudi Agri Yard Hub, Vijayawada Rural, AP 521225',
  district: 'NTR / Krishna',
  state: 'Andhra Pradesh',
  latitude: 16.5414,
  longitude: 80.5936,
  type: 'hub',
};

// ----------------------------------------------------------------------------
// 2. DETERMINISTIC GEOGRAPHIC CATALOG FOR PROTOTYPE / DEMO LOCATIONS
// Real, realistic coordinates for the Andhra Pradesh agricultural corridor & metro points.
// ----------------------------------------------------------------------------
export const DETERMINISTIC_LOCATION_CATALOG: Record<string, { name: string; address: string; lat: number; lon: number }> = {
  VIJAYAWADA: {
    name: 'Vijayawada Central',
    address: 'Governorpet / M.G. Road, Vijayawada, AP',
    lat: 16.5150,
    lon: 80.6320,
  },
  MANGALAGIRI: {
    name: 'Mangalagiri Town',
    address: 'Old Highway Market, Mangalagiri, Guntur District, AP',
    lat: 16.4300,
    lon: 80.5600,
  },
  GUNTUR: {
    name: 'Guntur City Centre',
    address: 'Brodipet / Market Yard, Guntur, AP',
    lat: 16.3067,
    lon: 80.4365,
  },
  TENALI: {
    name: 'Tenali Market Area',
    address: 'Station Road, Tenali, Guntur District, AP',
    lat: 16.2430,
    lon: 80.6400,
  },
  GANNAVARAM: {
    name: 'Gannavaram Agro Park',
    address: 'Agro Logistics Hub, NH-16, Gannavaram, AP',
    lat: 16.5400,
    lon: 80.8000,
  },
  AMARAVATI: {
    name: 'Amaravati Capital City',
    address: 'Secretariat Road, Amaravati, AP',
    lat: 16.5131,
    lon: 80.5165,
  },
  ELURU: {
    name: 'Eluru Market Yard',
    address: 'Powerpet, Eluru, West Godavari, AP',
    lat: 16.7107,
    lon: 81.0952,
  },
  INDIRANAGAR: {
    name: 'Indiranagar Consumer Hub',
    address: '100ft Road, Indiranagar, Bengaluru, KA',
    lat: 16.5180, // Projected onto regional prototype coordinate space
    lon: 80.6250,
  },
  KORAMANGALA: {
    name: 'Koramangala Market',
    address: '4th Block, Koramangala, Bengaluru, KA',
    lat: 16.4850,
    lon: 80.5900,
  },
};

/**
 * Deterministically resolves latitude & longitude from customer address or town.
 * Falls back to a deterministic hash offset around the hub if an unrecognized address is passed.
 * Zero random numbers are generated.
 */
export function getResolvedCoordinates(address: string, fallbackId: string): GeoCoordinate {
  const norm = (address || '').toUpperCase();

  if (norm.includes('VIJAYAWADA')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.VIJAYAWADA.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.VIJAYAWADA.lon };
  if (norm.includes('MANGALAGIRI')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.MANGALAGIRI.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.MANGALAGIRI.lon };
  if (norm.includes('GUNTUR')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.GUNTUR.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.GUNTUR.lon };
  if (norm.includes('TENALI')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.TENALI.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.TENALI.lon };
  if (norm.includes('GANNAVARAM')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.GANNAVARAM.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.GANNAVARAM.lon };
  if (norm.includes('AMARAVATI')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.AMARAVATI.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.AMARAVATI.lon };
  if (norm.includes('ELURU')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.ELURU.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.ELURU.lon };
  if (norm.includes('INDIRANAGAR')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.INDIRANAGAR.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.INDIRANAGAR.lon };
  if (norm.includes('KORAMANGALA')) return { latitude: DETERMINISTIC_LOCATION_CATALOG.KORAMANGALA.lat, longitude: DETERMINISTIC_LOCATION_CATALOG.KORAMANGALA.lon };

  // Deterministic fallback based on character hash (never random)
  let hash = 0;
  const str = address + fallbackId;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 200) - 100) / 1000; // -0.1 to +0.1 deg
  const lonOffset = ((Math.abs(hash >> 3) % 200) - 100) / 1000;

  return {
    latitude: Math.round((DEFAULT_FARMER_HUB.latitude + latOffset) * 10000) / 10000,
    longitude: Math.round((DEFAULT_FARMER_HUB.longitude + lonOffset) * 10000) / 10000,
  };
}

// ----------------------------------------------------------------------------
// 3. HAVERSINE DISTANCE CALCULATION
// ----------------------------------------------------------------------------
/**
 * Calculates geographic distance in kilometers between two latitude/longitude
 * coordinates using the Haversine formula:
 *   a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
 *   c = 2·atan2(√a, √(1-a))
 *   d = R · c (where R = 6371 km)
 *
 * Returns distance rounded to 1 decimal place.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // Round to 1 decimal place
  return Math.round(distanceKm * 10) / 10;
}

// ----------------------------------------------------------------------------
// 4. TRAVEL TIME & ESTIMATED COST HELPERS
// ----------------------------------------------------------------------------
export function calculateTravelTimeMinutes(
  distanceKm: number,
  averageSpeedKmH: number = DEFAULT_AVERAGE_SPEED_KMH
): number {
  if (averageSpeedKmH <= 0 || distanceKm <= 0) return 0;
  return Math.round((distanceKm / averageSpeedKmH) * 60);
}

export function calculateEstimatedCost(
  totalDistanceKm: number,
  costPerKm: number = DEFAULT_COST_PER_KM
): number {
  return Math.round(totalDistanceKm * costPerKm);
}

// ----------------------------------------------------------------------------
// 5. FIND NEAREST CUSTOMER (GREEDY STEP FOR NEAREST NEIGHBOUR)
// ----------------------------------------------------------------------------
/**
 * Evaluates distances from the current coordinate to all unvisited customers
 * and selects the customer with the minimum Haversine distance.
 */
export function findNearestCustomer(
  currentLat: number,
  currentLon: number,
  unvisitedCustomers: DeliveryCustomer[]
): { customer: DeliveryCustomer; distanceKm: number; index: number } | null {
  if (unvisitedCustomers.length === 0) return null;

  let nearestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < unvisitedCustomers.length; i++) {
    const cust = unvisitedCustomers[i];
    const dist = calculateDistance(
      currentLat,
      currentLon,
      cust.latitude,
      cust.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestIndex = i;
    }
  }

  return {
    customer: unvisitedCustomers[nearestIndex],
    distanceKm: minDistance,
    index: nearestIndex,
  };
}

// ----------------------------------------------------------------------------
// 6. NEAREST NEIGHBOUR ROUTE OPTIMIZATION ALGORITHM
// ----------------------------------------------------------------------------
/**
 * Builds an efficient delivery sequence using the Nearest Neighbour heuristic.
 * 
 * Logic:
 *   1. Start at Farmer Origin Hub.
 *   2. Identify unvisited pending customer delivery stops.
 *   3. Repeatedly find the unvisited customer nearest to the current stop.
 *   4. Append to route, record leg distance and cumulative stats.
 *   5. Set current location to that customer and mark visited.
 *   6. If roundTrip is true, calculate the return leg back to the Farmer Hub.
 *   7. Calculate total distance, estimated cost, and comparison against
 *      unoptimized individual round trips.
 */
export function optimizeRouteNearestNeighbour(
  origin: HubLocation = DEFAULT_FARMER_HUB,
  pendingCustomers: DeliveryCustomer[] = [],
  options: {
    roundTrip?: boolean;
    costPerKm?: number;
    averageSpeedKmH?: number;
  } = {}
): OptimizedRouteResult {
  const roundTrip = options.roundTrip !== false; // default true
  const costPerKm = options.costPerKm ?? DEFAULT_COST_PER_KM;
  const speed = options.averageSpeedKmH ?? DEFAULT_AVERAGE_SPEED_KMH;

  // Edge case: No pending deliveries
  if (!pendingCustomers || pendingCustomers.length === 0) {
    return {
      origin,
      stops: [],
      customerCount: 0,
      totalDistanceKm: 0,
      estimatedTotalCost: 0,
      costPerKm,
      averageSpeedKmH: speed,
      estimatedTotalMinutes: 0,
      isRoundTrip: roundTrip,
      algorithmMethod: 'Nearest Neighbour Heuristic (0 Pending Deliveries)',
      unoptimizedDistanceKm: 0,
      unoptimizedCost: 0,
      distanceSavedKm: 0,
      costSaved: 0,
    };
  }

  // Calculate unoptimized baseline (individual direct round trips from origin for every order)
  let unoptimizedDistanceKm = 0;
  pendingCustomers.forEach((cust) => {
    const directLeg = calculateDistance(
      origin.latitude,
      origin.longitude,
      cust.latitude,
      cust.longitude
    );
    unoptimizedDistanceKm += directLeg * 2; // back and forth
  });
  unoptimizedDistanceKm = Math.round(unoptimizedDistanceKm * 10) / 10;

  // Nearest Neighbour Sequence Building
  const unvisited = [...pendingCustomers];
  const stops: RouteStopDetail[] = [];

  let currentLat = origin.latitude;
  let currentLon = origin.longitude;
  let cumulativeDist = 0;
  let cumulativeMins = 0;

  // 1. Add Origin Start Stop
  stops.push({
    stopNumber: 0,
    type: 'origin',
    label: 'Start (Farmer Pickup Location)',
    locationName: origin.name,
    address: origin.address,
    latitude: origin.latitude,
    longitude: origin.longitude,
    legDistanceKm: 0,
    cumulativeDistanceKm: 0,
    legMinutes: 0,
    cumulativeMinutes: 0,
  });

  // 2. Nearest Neighbour Loop
  let stopCounter = 1;
  while (unvisited.length > 0) {
    const nearest = findNearestCustomer(currentLat, currentLon, unvisited);
    if (!nearest) break;

    // Remove chosen customer from unvisited list
    const [chosenCustomer] = unvisited.splice(nearest.index, 1);

    const legDist = nearest.distanceKm;
    const legMins = calculateTravelTimeMinutes(legDist, speed);

    cumulativeDist += legDist;
    cumulativeMins += legMins;

    stops.push({
      stopNumber: stopCounter++,
      type: 'customer',
      label: `Stop ${stops.length}`,
      customerName: chosenCustomer.customerName,
      locationName: chosenCustomer.locationName,
      address: chosenCustomer.deliveryAddress,
      latitude: chosenCustomer.latitude,
      longitude: chosenCustomer.longitude,
      legDistanceKm: legDist,
      cumulativeDistanceKm: Math.round(cumulativeDist * 10) / 10,
      legMinutes: legMins,
      cumulativeMinutes: cumulativeMins,
      orderId: chosenCustomer.orderId,
      status: chosenCustomer.status,
      product: chosenCustomer.product,
      quantity: chosenCustomer.quantity,
      customerPhone: chosenCustomer.customerPhone,
      isDemoData: chosenCustomer.isDemoData,
    });

    // Move current location to this visited customer
    currentLat = chosenCustomer.latitude;
    currentLon = chosenCustomer.longitude;
  }

  // 3. Return Leg to Origin (if round-trip mode is enabled and we have at least 1 customer)
  if (roundTrip && stops.length > 1) {
    const returnDist = calculateDistance(
      currentLat,
      currentLon,
      origin.latitude,
      origin.longitude
    );
    const returnMins = calculateTravelTimeMinutes(returnDist, speed);

    cumulativeDist += returnDist;
    cumulativeMins += returnMins;

    stops.push({
      stopNumber: stops.length,
      type: 'return',
      label: 'Return to Farmer Hub',
      locationName: `${origin.name} (Return)`,
      address: origin.address,
      latitude: origin.latitude,
      longitude: origin.longitude,
      legDistanceKm: returnDist,
      cumulativeDistanceKm: Math.round(cumulativeDist * 10) / 10,
      legMinutes: returnMins,
      cumulativeMinutes: cumulativeMins,
    });
  }

  const totalDistanceKm = Math.round(cumulativeDist * 10) / 10;
  const estimatedTotalCost = calculateEstimatedCost(totalDistanceKm, costPerKm);
  const unoptimizedCost = calculateEstimatedCost(unoptimizedDistanceKm, costPerKm);
  const distanceSavedKm = Math.max(0, Math.round((unoptimizedDistanceKm - totalDistanceKm) * 10) / 10);
  const costSaved = Math.max(0, unoptimizedCost - estimatedTotalCost);

  return {
    origin,
    stops,
    customerCount: pendingCustomers.length,
    totalDistanceKm,
    estimatedTotalCost,
    costPerKm,
    averageSpeedKmH: speed,
    estimatedTotalMinutes: cumulativeMins,
    isRoundTrip: roundTrip,
    algorithmMethod: 'Optimized via Nearest Neighbour Heuristic',
    unoptimizedDistanceKm,
    unoptimizedCost,
    distanceSavedKm,
    costSaved,
  };
}

// ----------------------------------------------------------------------------
// 7. TOTAL DISTANCE UTILITY
// ----------------------------------------------------------------------------
export function calculateTotalDistance(stops: RouteStopDetail[]): number {
  if (!stops || stops.length === 0) return 0;
  const lastStop = stops[stops.length - 1];
  return lastStop.cumulativeDistanceKm;
}

// ----------------------------------------------------------------------------
// 8. PROTOTYPE DEMO CUSTOMER DATA
// Fully deterministic realistic customer records as specified by the prompt.
// Clearly labeled as Prototype Demo Data.
// ----------------------------------------------------------------------------
export const PROTOTYPE_DEMO_CUSTOMERS: DeliveryCustomer[] = [
  {
    id: 'DEMO-CUST-1',
    orderId: 'ORD-7001',
    customerName: 'Ravi Kumar',
    customerPhone: '+91 98480 11223',
    deliveryAddress: 'House 14, Main Road, Governorpet, Vijayawada, AP',
    locationName: 'Vijayawada',
    latitude: 16.5150,
    longitude: 80.6320,
    product: 'Farm Fresh Desi Tomato',
    quantity: '150 kg',
    quantityKg: 150,
    orderAmount: 4500,
    status: 'Pending',
    isDemoData: true,
    orderTime: 'Today, 08:30 AM',
  },
  {
    id: 'DEMO-CUST-2',
    orderId: 'ORD-7002',
    customerName: 'Suresh',
    customerPhone: '+91 94401 22334',
    deliveryAddress: 'Plot 28, Brodipet 4th Lane, Guntur, AP',
    locationName: 'Guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    product: 'Crisp Nashik Pink Onion',
    quantity: '200 kg',
    quantityKg: 200,
    orderAmount: 5600,
    status: 'Pending',
    isDemoData: true,
    orderTime: 'Today, 09:15 AM',
  },
  {
    id: 'DEMO-CUST-3',
    orderId: 'ORD-7003',
    customerName: 'Priya',
    customerPhone: '+91 91212 33445',
    deliveryAddress: 'Near Clock Tower, Station Road, Tenali, AP',
    locationName: 'Tenali',
    latitude: 16.2430,
    longitude: 80.6400,
    product: 'Golden Mountain Potato',
    quantity: '100 kg',
    quantityKg: 100,
    orderAmount: 2400,
    status: 'Pending',
    isDemoData: true,
    orderTime: 'Today, 10:00 AM',
  },
  {
    id: 'DEMO-CUST-4',
    orderId: 'ORD-7004',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 98450 12345',
    deliveryAddress: 'Temple Road, Old Bazaar, Mangalagiri, AP',
    locationName: 'Mangalagiri',
    latitude: 16.4300,
    longitude: 80.5600,
    product: 'Guntur Teja Spicy Chillies',
    quantity: '40 kg',
    quantityKg: 40,
    orderAmount: 3200,
    status: 'Pending',
    isDemoData: true,
    orderTime: 'Today, 10:45 AM',
  },
];
