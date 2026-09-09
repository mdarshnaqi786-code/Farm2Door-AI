// Farm2Door AI - Market Intelligence & Mandi Reference Price Service
// Source of truth: Andhra Pradesh Mandi Historical Dataset (public/farm2door_ap_market_data.csv)

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  modalPricePerQuintal: number;
  priceDate: string; // YYYY-MM-DD
  minPricePerKg: number;
  maxPricePerKg: number;
  modalPricePerKg: number;
}

export type DateRangeFilter = 'latest' | '7d' | '30d' | '90d' | 'all';

export interface MarketOverviewStats {
  commodity: string;
  district: string;
  market: string;
  latestDate: string;
  latestModalPriceKg: number;
  minPriceKg: number;
  maxPriceKg: number;
  modalPriceKg: number;
  prevModalPriceKg: number | null;
  priceChangeKg: number;
  priceChangePercent: number;
  trendStatus: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  availableMarketsCount: number;
  availableDistrictsCount: number;
  totalRecordsCount: number;
}

export interface MarketComparisonItem {
  market: string;
  district: string;
  latestModalPriceKg: number;
  minPriceKg: number;
  maxPriceKg: number;
  priceDate: string;
  isHighest: boolean;
  isLowest: boolean;
}

export interface TrendDataPoint {
  date: string;
  minPriceKg: number;
  maxPriceKg: number;
  modalPriceKg: number;
  marketCount: number;
}

export interface ForecastDay {
  date: string;
  dayLabel: string;
  estimatedPriceKg: number;
  lowerBoundKg: number;
  upperBoundKg: number;
  trendSignal: 'up' | 'down' | 'neutral';
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'arbitrage' | 'stability' | 'forecast';
  title: {
    en: string;
    hi: string;
    te: string;
  };
  description: {
    en: string;
    hi: string;
    te: string;
  };
  speechText: {
    en: string;
    hi: string;
    te: string;
  };
}

// Built-in verified records from farm2door_ap_market_data.csv
export const EMBEDDED_MANDI_RECORDS: MandiRecord[] = [
  // Onion records - Kurnool
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1500, modalPricePerQuintal: 1200, priceDate: '2023-06-06', minPricePerKg: 10.0, maxPricePerKg: 15.0, modalPricePerKg: 12.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1500, modalPricePerQuintal: 1300, priceDate: '2023-06-07', minPricePerKg: 10.0, maxPricePerKg: 15.0, modalPricePerKg: 13.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1500, modalPricePerQuintal: 1300, priceDate: '2023-06-08', minPricePerKg: 10.0, maxPricePerKg: 15.0, modalPricePerKg: 13.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1500, modalPricePerQuintal: 1250, priceDate: '2023-06-09', minPricePerKg: 10.0, maxPricePerKg: 15.0, modalPricePerKg: 12.5 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1600, modalPricePerQuintal: 1300, priceDate: '2023-06-12', minPricePerKg: 10.0, maxPricePerKg: 16.0, modalPricePerKg: 13.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1700, modalPricePerQuintal: 1350, priceDate: '2023-06-15', minPricePerKg: 10.0, maxPricePerKg: 17.0, modalPricePerKg: 13.5 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1700, modalPricePerQuintal: 1350, priceDate: '2023-06-20', minPricePerKg: 10.0, maxPricePerKg: 17.0, modalPricePerKg: 13.5 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1700, modalPricePerQuintal: 1350, priceDate: '2023-06-25', minPricePerKg: 10.0, maxPricePerKg: 17.0, modalPricePerKg: 13.5 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1000, maxPricePerQuintal: 1700, modalPricePerQuintal: 1350, priceDate: '2023-06-30', minPricePerKg: 10.0, maxPricePerKg: 17.0, modalPricePerKg: 13.5 },

  // Onion records - Hyderabad Bowenpally
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1100, maxPricePerQuintal: 1600, modalPricePerQuintal: 1350, priceDate: '2023-06-06', minPricePerKg: 11.0, maxPricePerKg: 16.0, modalPricePerKg: 13.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1200, maxPricePerQuintal: 1700, modalPricePerQuintal: 1450, priceDate: '2023-06-09', minPricePerKg: 12.0, maxPricePerKg: 17.0, modalPricePerKg: 14.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1250, maxPricePerQuintal: 1800, modalPricePerQuintal: 1550, priceDate: '2023-06-15', minPricePerKg: 12.5, maxPricePerKg: 18.0, modalPricePerKg: 15.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1350, maxPricePerQuintal: 1900, modalPricePerQuintal: 1650, priceDate: '2023-06-20', minPricePerKg: 13.5, maxPricePerKg: 19.0, modalPricePerKg: 16.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1400, maxPricePerQuintal: 2000, modalPricePerQuintal: 1750, priceDate: '2023-06-25', minPricePerKg: 14.0, maxPricePerKg: 20.0, modalPricePerKg: 17.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1500, maxPricePerQuintal: 2100, modalPricePerQuintal: 1850, priceDate: '2023-06-30', minPricePerKg: 15.0, maxPricePerKg: 21.0, modalPricePerKg: 18.5 },

  // Onion records - Hyderabad Gudimalkapur
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Onion', variety: 'Bellary', grade: 'FAQ', minPricePerQuintal: 1200, maxPricePerQuintal: 1700, modalPricePerQuintal: 1450, priceDate: '2023-06-06', minPricePerKg: 12.0, maxPricePerKg: 17.0, modalPricePerKg: 14.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Onion', variety: 'Bellary', grade: 'FAQ', minPricePerQuintal: 1300, maxPricePerQuintal: 1800, modalPricePerQuintal: 1550, priceDate: '2023-06-15', minPricePerKg: 13.0, maxPricePerKg: 18.0, modalPricePerKg: 15.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Onion', variety: 'Bellary', grade: 'FAQ', minPricePerQuintal: 1450, maxPricePerQuintal: 2050, modalPricePerQuintal: 1800, priceDate: '2023-06-30', minPricePerKg: 14.5, maxPricePerKg: 20.5, modalPricePerKg: 18.0 },

  // Onion records - Other districts
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1050, maxPricePerQuintal: 1550, modalPricePerQuintal: 1300, priceDate: '2023-06-06', minPricePerKg: 10.5, maxPricePerKg: 15.5, modalPricePerKg: 13.0 },
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Onion', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1400, maxPricePerQuintal: 1950, modalPricePerQuintal: 1700, priceDate: '2023-06-30', minPricePerKg: 14.0, maxPricePerKg: 19.5, modalPricePerKg: 17.0 },
  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1200, maxPricePerQuintal: 1600, modalPricePerQuintal: 1400, priceDate: '2023-06-06', minPricePerKg: 12.0, maxPricePerKg: 16.0, modalPricePerKg: 14.0 },
  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1500, maxPricePerQuintal: 2000, modalPricePerQuintal: 1750, priceDate: '2023-06-30', minPricePerKg: 15.0, maxPricePerKg: 20.0, modalPricePerKg: 17.5 },
  { state: 'Andhra Pradesh', district: 'adilabad', market: 'Adilabad(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1100, maxPricePerQuintal: 1500, modalPricePerQuintal: 1300, priceDate: '2023-06-06', minPricePerKg: 11.0, maxPricePerKg: 15.0, modalPricePerKg: 13.0 },
  { state: 'Andhra Pradesh', district: 'adilabad', market: 'Adilabad(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1400, maxPricePerQuintal: 1900, modalPricePerQuintal: 1650, priceDate: '2023-06-30', minPricePerKg: 14.0, maxPricePerKg: 19.0, modalPricePerKg: 16.5 },
  { state: 'Andhra Pradesh', district: 'medak', market: 'Siddipet(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1150, maxPricePerQuintal: 1600, modalPricePerQuintal: 1380, priceDate: '2023-06-06', minPricePerKg: 11.5, maxPricePerKg: 16.0, modalPricePerKg: 13.8 },
  { state: 'Andhra Pradesh', district: 'medak', market: 'Siddipet(Rythu Bazar)', commodity: 'Onion', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1450, maxPricePerQuintal: 2000, modalPricePerQuintal: 1720, priceDate: '2023-06-30', minPricePerKg: 14.5, maxPricePerKg: 20.0, modalPricePerKg: 17.2 },

  // Potato records
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1600, maxPricePerQuintal: 2000, modalPricePerQuintal: 1800, priceDate: '2023-06-06', minPricePerKg: 16.0, maxPricePerKg: 20.0, modalPricePerKg: 18.0 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1700, maxPricePerQuintal: 2200, modalPricePerQuintal: 1950, priceDate: '2023-06-15', minPricePerKg: 17.0, maxPricePerKg: 22.0, modalPricePerKg: 19.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1800, maxPricePerQuintal: 2300, modalPricePerQuintal: 2050, priceDate: '2023-06-30', minPricePerKg: 18.0, maxPricePerKg: 23.0, modalPricePerKg: 20.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1650, maxPricePerQuintal: 2050, modalPricePerQuintal: 1850, priceDate: '2023-06-06', minPricePerKg: 16.5, maxPricePerKg: 20.5, modalPricePerKg: 18.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1800, maxPricePerQuintal: 2300, modalPricePerQuintal: 2050, priceDate: '2023-06-30', minPricePerKg: 18.0, maxPricePerKg: 23.0, modalPricePerKg: 20.5 },
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1550, maxPricePerQuintal: 1950, modalPricePerQuintal: 1750, priceDate: '2023-06-06', minPricePerKg: 15.5, maxPricePerKg: 19.5, modalPricePerKg: 17.5 },
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Potato', variety: 'Other', grade: 'FAQ', minPricePerQuintal: 1750, maxPricePerQuintal: 2200, modalPricePerQuintal: 1980, priceDate: '2023-06-30', minPricePerKg: 17.5, maxPricePerKg: 22.0, modalPricePerKg: 19.8 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Potato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1500, maxPricePerQuintal: 1900, modalPricePerQuintal: 1700, priceDate: '2023-06-06', minPricePerKg: 15.0, maxPricePerKg: 19.0, modalPricePerKg: 17.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Potato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1700, maxPricePerQuintal: 2150, modalPricePerQuintal: 1920, priceDate: '2023-06-30', minPricePerKg: 17.0, maxPricePerKg: 21.5, modalPricePerKg: 19.2 },
  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Potato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1600, maxPricePerQuintal: 2000, modalPricePerQuintal: 1800, priceDate: '2023-06-06', minPricePerKg: 16.0, maxPricePerKg: 20.0, modalPricePerKg: 18.0 },
  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Potato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1800, maxPricePerQuintal: 2250, modalPricePerQuintal: 2020, priceDate: '2023-06-30', minPricePerKg: 18.0, maxPricePerKg: 22.5, modalPricePerKg: 20.2 },

  // Tomato records
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2000, maxPricePerQuintal: 2500, modalPricePerQuintal: 2250, priceDate: '2023-06-06', minPricePerKg: 20.0, maxPricePerKg: 25.0, modalPricePerKg: 22.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2500, maxPricePerQuintal: 3200, modalPricePerQuintal: 2850, priceDate: '2023-06-12', minPricePerKg: 25.0, maxPricePerKg: 32.0, modalPricePerKg: 28.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 3500, maxPricePerQuintal: 4500, modalPricePerQuintal: 4000, priceDate: '2023-06-19', minPricePerKg: 35.0, maxPricePerKg: 45.0, modalPricePerKg: 40.0 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 5000, maxPricePerQuintal: 6200, modalPricePerQuintal: 5600, priceDate: '2023-06-26', minPricePerKg: 50.0, maxPricePerKg: 62.0, modalPricePerKg: 56.0 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Bowenpally', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 6200, maxPricePerQuintal: 7600, modalPricePerQuintal: 6900, priceDate: '2023-06-30', minPricePerKg: 62.0, maxPricePerKg: 76.0, modalPricePerKg: 69.0 },

  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2100, maxPricePerQuintal: 2600, modalPricePerQuintal: 2350, priceDate: '2023-06-06', minPricePerKg: 21.0, maxPricePerKg: 26.0, modalPricePerKg: 23.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 3400, maxPricePerQuintal: 4300, modalPricePerQuintal: 3850, priceDate: '2023-06-18', minPricePerKg: 34.0, maxPricePerKg: 43.0, modalPricePerKg: 38.5 },
  { state: 'Andhra Pradesh', district: 'hyderabad', market: 'Gudimalkapur', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 6000, maxPricePerQuintal: 7500, modalPricePerQuintal: 6750, priceDate: '2023-06-30', minPricePerKg: 60.0, maxPricePerKg: 75.0, modalPricePerKg: 67.5 },

  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Tomato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 1800, maxPricePerQuintal: 2300, modalPricePerQuintal: 2050, priceDate: '2023-06-06', minPricePerKg: 18.0, maxPricePerKg: 23.0, modalPricePerKg: 20.5 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Tomato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 3200, maxPricePerQuintal: 4000, modalPricePerQuintal: 3600, priceDate: '2023-06-18', minPricePerKg: 32.0, maxPricePerKg: 40.0, modalPricePerKg: 36.0 },
  { state: 'Andhra Pradesh', district: 'kurnool', market: 'Kurnool', commodity: 'Tomato', variety: 'Local', grade: 'FAQ', minPricePerQuintal: 5600, maxPricePerQuintal: 6800, modalPricePerQuintal: 6200, priceDate: '2023-06-30', minPricePerKg: 56.0, maxPricePerKg: 68.0, modalPricePerKg: 62.0 },

  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 1900, maxPricePerQuintal: 2400, modalPricePerQuintal: 2150, priceDate: '2023-06-06', minPricePerKg: 19.0, maxPricePerKg: 24.0, modalPricePerKg: 21.5 },
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 4200, maxPricePerQuintal: 5300, modalPricePerQuintal: 4750, priceDate: '2023-06-22', minPricePerKg: 42.0, maxPricePerKg: 53.0, modalPricePerKg: 47.5 },
  { state: 'Andhra Pradesh', district: 'warangal', market: 'Warangal', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 6500, maxPricePerQuintal: 7000, modalPricePerQuintal: 6750, priceDate: '2023-06-30', minPricePerKg: 65.0, maxPricePerKg: 70.0, modalPricePerKg: 67.5 },

  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2100, maxPricePerQuintal: 2600, modalPricePerQuintal: 2350, priceDate: '2023-06-06', minPricePerKg: 21.0, maxPricePerKg: 26.0, modalPricePerKg: 23.5 },
  { state: 'Andhra Pradesh', district: 'karimnagar', market: 'Karimnagar(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 6100, maxPricePerQuintal: 7400, modalPricePerQuintal: 6750, priceDate: '2023-06-30', minPricePerKg: 61.0, maxPricePerKg: 74.0, modalPricePerKg: 67.5 },

  { state: 'Andhra Pradesh', district: 'adilabad', market: 'Adilabad(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 1950, maxPricePerQuintal: 2450, modalPricePerQuintal: 2200, priceDate: '2023-06-06', minPricePerKg: 19.5, maxPricePerKg: 24.5, modalPricePerKg: 22.0 },
  { state: 'Andhra Pradesh', district: 'adilabad', market: 'Adilabad(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 5700, maxPricePerQuintal: 7000, modalPricePerQuintal: 6350, priceDate: '2023-06-30', minPricePerKg: 57.0, maxPricePerKg: 70.0, modalPricePerKg: 63.5 },

  { state: 'Andhra Pradesh', district: 'mahbubnagar', market: 'Mahabubnagar(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2050, maxPricePerQuintal: 2550, modalPricePerQuintal: 2300, priceDate: '2023-06-06', minPricePerKg: 20.5, maxPricePerKg: 25.5, modalPricePerKg: 23.0 },
  { state: 'Andhra Pradesh', district: 'mahbubnagar', market: 'Mahabubnagar(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 5800, maxPricePerQuintal: 7100, modalPricePerQuintal: 6450, priceDate: '2023-06-30', minPricePerKg: 58.0, maxPricePerKg: 71.0, modalPricePerKg: 64.5 },

  { state: 'Andhra Pradesh', district: 'medak', market: 'Siddipet(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2100, maxPricePerQuintal: 2600, modalPricePerQuintal: 2350, priceDate: '2023-06-06', minPricePerKg: 21.0, maxPricePerKg: 26.0, modalPricePerKg: 23.5 },
  { state: 'Andhra Pradesh', district: 'medak', market: 'Siddipet(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 5900, maxPricePerQuintal: 7200, modalPricePerQuintal: 6550, priceDate: '2023-06-30', minPricePerKg: 59.0, maxPricePerKg: 72.0, modalPricePerKg: 65.5 },

  { state: 'Andhra Pradesh', district: 'nalgonda', market: 'Miryalguda(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 2000, maxPricePerQuintal: 2500, modalPricePerQuintal: 2250, priceDate: '2023-06-06', minPricePerKg: 20.0, maxPricePerKg: 25.0, modalPricePerKg: 22.5 },
  { state: 'Andhra Pradesh', district: 'nalgonda', market: 'Miryalguda(Rythu Bazar)', commodity: 'Tomato', variety: 'Tomato', grade: 'FAQ', minPricePerQuintal: 5750, maxPricePerQuintal: 7050, modalPricePerQuintal: 6400, priceDate: '2023-06-30', minPricePerKg: 57.5, maxPricePerKg: 70.5, modalPricePerKg: 64.0 }
];

// In-memory cache
let loadedRecords: MandiRecord[] = EMBEDDED_MANDI_RECORDS;

export function getAllMandiRecords(): MandiRecord[] {
  return loadedRecords;
}

// Fetch and parse external CSV if available in browser
export async function syncCsvDataset(): Promise<MandiRecord[]> {
  try {
    const res = await fetch('/farm2door_ap_market_data.csv');
    if (!res.ok) return loadedRecords;
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return loadedRecords;

    const parsed: MandiRecord[] = [];
    // skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length >= 13) {
        parsed.push({
          state: parts[0]?.trim() || 'Andhra Pradesh',
          district: parts[1]?.trim() || '',
          market: parts[2]?.trim() || '',
          commodity: parts[3]?.trim() || '',
          variety: parts[4]?.trim() || '',
          grade: parts[5]?.trim() || '',
          minPricePerQuintal: parseFloat(parts[6]) || 0,
          maxPricePerQuintal: parseFloat(parts[7]) || 0,
          modalPricePerQuintal: parseFloat(parts[8]) || 0,
          priceDate: parts[9]?.trim() || '',
          minPricePerKg: parseFloat(parts[10]) || 0,
          maxPricePerKg: parseFloat(parts[11]) || 0,
          modalPricePerKg: parseFloat(parts[12]) || 0,
        });
      }
    }

    if (parsed.length > 0) {
      loadedRecords = parsed;
    }
  } catch (err) {
    console.warn('Using embedded mandi dataset:', err);
  }
  return loadedRecords;
}

export function getAvailableCommodities(): string[] {
  const set = new Set<string>();
  loadedRecords.forEach((r) => set.add(r.commodity));
  // Standard list requested by user
  const standard = ['Tomato', 'Onion', 'Potato', 'Rice', 'Wheat'];
  standard.forEach((c) => set.add(c));
  return Array.from(set);
}

export function getAvailableDistricts(commodity?: string): string[] {
  const set = new Set<string>();
  loadedRecords.forEach((r) => {
    if (!commodity || commodity === 'All' || r.commodity.toLowerCase() === commodity.toLowerCase()) {
      if (r.district) set.add(r.district);
    }
  });
  return Array.from(set).sort();
}

export function getAvailableMarkets(commodity?: string, district?: string): string[] {
  const set = new Set<string>();
  loadedRecords.forEach((r) => {
    const matchComm = !commodity || commodity === 'All' || r.commodity.toLowerCase() === commodity.toLowerCase();
    const matchDist = !district || district === 'All' || r.district.toLowerCase() === district.toLowerCase();
    if (matchComm && matchDist && r.market) {
      set.add(r.market);
    }
  });
  return Array.from(set).sort();
}

// Filter dataset records
export function filterMandiRecords(
  commodity: string,
  district: string = 'All',
  market: string = 'All',
  dateRange: DateRangeFilter = 'latest',
  customStartDate?: string,
  customEndDate?: string
): MandiRecord[] {
  let records = loadedRecords.filter((r) => {
    if (commodity && commodity !== 'All' && r.commodity.toLowerCase() !== commodity.toLowerCase()) {
      return false;
    }
    if (district && district !== 'All' && r.district.toLowerCase() !== district.toLowerCase()) {
      return false;
    }
    if (market && market !== 'All' && r.market.toLowerCase() !== market.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Sort ascending by date
  records.sort((a, b) => a.priceDate.localeCompare(b.priceDate));

  if (records.length === 0) return [];

  if (dateRange === 'all') {
    return records;
  }

  const latestDateStr = records[records.length - 1].priceDate;
  const latestDate = new Date(latestDateStr);

  if (dateRange === 'latest') {
    return records.filter((r) => r.priceDate === latestDateStr);
  }

  let days = 30;
  if (dateRange === '7d') days = 7;
  if (dateRange === '30d') days = 30;
  if (dateRange === '90d') days = 90;

  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return records.filter((r) => {
    if (customStartDate && r.priceDate < customStartDate) return false;
    if (customEndDate && r.priceDate > customEndDate) return false;
    if (!customStartDate && !customEndDate) {
      return r.priceDate >= cutoffStr;
    }
    return true;
  });
}

// Compute market overview stats
export function calculateOverviewStats(
  commodity: string,
  district: string = 'All',
  market: string = 'All'
): MarketOverviewStats {
  const filtered = filterMandiRecords(commodity, district, market, 'all');

  if (filtered.length === 0) {
    return {
      commodity,
      district,
      market,
      latestDate: 'N/A',
      latestModalPriceKg: 0,
      minPriceKg: 0,
      maxPriceKg: 0,
      modalPriceKg: 0,
      prevModalPriceKg: null,
      priceChangeKg: 0,
      priceChangePercent: 0,
      trendStatus: 'stable',
      availableMarketsCount: 0,
      availableDistrictsCount: 0,
      totalRecordsCount: 0,
    };
  }

  // Find unique dates
  const dates = Array.from(new Set(filtered.map((r) => r.priceDate))).sort();
  const latestDate = dates[dates.length - 1];
  const prevDate = dates.length > 1 ? dates[dates.length - 2] : null;

  const latestRecords = filtered.filter((r) => r.priceDate === latestDate);
  const prevRecords = prevDate ? filtered.filter((r) => r.priceDate === prevDate) : [];

  const avgLatestModal =
    latestRecords.reduce((acc, r) => acc + r.modalPricePerKg, 0) / latestRecords.length;
  const minPrice = Math.min(...latestRecords.map((r) => r.minPricePerKg));
  const maxPrice = Math.max(...latestRecords.map((r) => r.maxPricePerKg));

  let prevAvgModal: number | null = null;
  let priceChange = 0;
  let priceChangePct = 0;

  if (prevRecords.length > 0) {
    prevAvgModal =
      prevRecords.reduce((acc, r) => acc + r.modalPricePerKg, 0) / prevRecords.length;
    priceChange = avgLatestModal - prevAvgModal;
    priceChangePct = (priceChange / prevAvgModal) * 100;
  } else if (dates.length > 1) {
    const firstDate = dates[0];
    const firstRecords = filtered.filter((r) => r.priceDate === firstDate);
    const firstAvg =
      firstRecords.reduce((acc, r) => acc + r.modalPricePerKg, 0) / firstRecords.length;
    priceChange = avgLatestModal - firstAvg;
    priceChangePct = (priceChange / firstAvg) * 100;
  }

  let trendStatus: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
  if (priceChangePct > 3) trendStatus = 'increasing';
  else if (priceChangePct < -3) trendStatus = 'decreasing';
  else trendStatus = 'stable';

  const marketSet = new Set(filtered.map((r) => r.market));
  const districtSet = new Set(filtered.map((r) => r.district));

  return {
    commodity,
    district,
    market,
    latestDate,
    latestModalPriceKg: Math.round(avgLatestModal * 10) / 10,
    minPriceKg: Math.round(minPrice * 10) / 10,
    maxPriceKg: Math.round(maxPrice * 10) / 10,
    modalPriceKg: Math.round(avgLatestModal * 10) / 10,
    prevModalPriceKg: prevAvgModal !== null ? Math.round(prevAvgModal * 10) / 10 : null,
    priceChangeKg: Math.round(priceChange * 10) / 10,
    priceChangePercent: Math.round(priceChangePct * 10) / 10,
    trendStatus,
    availableMarketsCount: marketSet.size,
    availableDistrictsCount: districtSet.size,
    totalRecordsCount: filtered.length,
  };
}

// Compute market-wise price comparison
export function calculateMarketComparison(
  commodity: string,
  district: string = 'All'
): MarketComparisonItem[] {
  const records = filterMandiRecords(commodity, district, 'All', 'all');
  if (records.length === 0) return [];

  // Group by market to get latest record per market
  const marketMap = new Map<string, MandiRecord>();
  records.forEach((r) => {
    const existing = marketMap.get(r.market);
    if (!existing || r.priceDate > existing.priceDate) {
      marketMap.set(r.market, r);
    }
  });

  const items = Array.from(marketMap.values()).map((r) => ({
    market: r.market,
    district: r.district.charAt(0).toUpperCase() + r.district.slice(1),
    latestModalPriceKg: r.modalPricePerKg,
    minPriceKg: r.minPricePerKg,
    maxPriceKg: r.maxPricePerKg,
    priceDate: r.priceDate,
    isHighest: false,
    isLowest: false,
  }));

  // Sort by latestModalPriceKg descending
  items.sort((a, b) => b.latestModalPriceKg - a.latestModalPriceKg);

  if (items.length > 0) {
    items[0].isHighest = true;
    items[items.length - 1].isLowest = true;
  }

  return items;
}

// Compute historical price trend points for charting
export function calculatePriceTrend(
  commodity: string,
  district: string = 'All',
  market: string = 'All',
  dateRange: DateRangeFilter = '30d'
): TrendDataPoint[] {
  const records = filterMandiRecords(commodity, district, market, dateRange);
  if (records.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, MandiRecord[]>();
  records.forEach((r) => {
    const list = dateMap.get(r.priceDate) || [];
    list.push(r);
    dateMap.set(r.priceDate, list);
  });

  const sortedDates = Array.from(dateMap.keys()).sort();

  return sortedDates.map((date) => {
    const group = dateMap.get(date)!;
    const avgMin = group.reduce((acc, r) => acc + r.minPricePerKg, 0) / group.length;
    const avgMax = group.reduce((acc, r) => acc + r.maxPricePerKg, 0) / group.length;
    const avgModal = group.reduce((acc, r) => acc + r.modalPricePerKg, 0) / group.length;

    return {
      date,
      minPriceKg: Math.round(avgMin * 10) / 10,
      maxPriceKg: Math.round(avgMax * 10) / 10,
      modalPriceKg: Math.round(avgModal * 10) / 10,
      marketCount: group.length,
    };
  });
}

// Generate AI Market Insights based on historical data
export function generateAIInsights(
  commodity: string,
  district: string = 'All',
  market: string = 'All'
): AIInsight[] {
  const stats = calculateOverviewStats(commodity, district, market);
  const comparisons = calculateMarketComparison(commodity, district);
  const trend = calculatePriceTrend(commodity, district, market, '30d');

  if (stats.totalRecordsCount === 0) {
    return [
      {
        id: 'no-data',
        type: 'stability',
        title: {
          en: `Limited mandi records for ${commodity}`,
          hi: `${commodity} के लिए सीमित मंडी रिकॉर्ड उपलब्ध`,
          te: `${commodity} కోసం పరిమిత మార్కెట్ రికార్డులు అందుబాటులో ఉన్నాయి`,
        },
        description: {
          en: `Historical mandi records for ${commodity} in this region are currently limited. Check back as new arrivals are logged.`,
          hi: `इस क्षेत्र में ${commodity} के ऐतिहासिक मंडी आंकड़े सीमित हैं। नई आवक दर्ज होते ही डेटा अपडेट होगा।`,
          te: `ఈ ప్రాంతంలో ${commodity} కొరకు చారిత్రక మార్కెట్ రికార్డులు పరిమితంగా ఉన్నాయి. కొత్త సమాచారం వచ్చినప్పుడు అప్‌డేట్ చేయబడుతుంది.`,
        },
        speechText: {
          en: `Mandi data for ${commodity} is currently limited in the selected region.`,
          hi: `${commodity} के लिए वर्तमान में मंडी रिकॉर्ड सीमित हैं।`,
          te: `${commodity} కొరకు ప్రస్తుతానికి సమాచారం పరిమితంగా ఉంది.`,
        },
      },
    ];
  }

  const highestMarket = comparisons.find((c) => c.isHighest);
  const lowestMarket = comparisons.find((c) => c.isLowest);

  const insights: AIInsight[] = [];

  // 1. Trend Insight
  const trendWordEn =
    stats.trendStatus === 'increasing'
      ? 'strong upward movement'
      : stats.trendStatus === 'decreasing'
      ? 'downward correction'
      : 'stable trading pattern';

  const trendWordHi =
    stats.trendStatus === 'increasing'
      ? 'तेजी की दिशा'
      : stats.trendStatus === 'decreasing'
      ? 'मंदी की दिशा'
      : 'स्थिरता';

  const trendWordTe =
    stats.trendStatus === 'increasing'
      ? 'ధరల పెరుగుదల'
      : stats.trendStatus === 'decreasing'
      ? 'ధరల తగ్గుదల'
      : 'స్థిరమైన వ్యాపారం';

  insights.push({
    id: 'trend-analysis',
    type: 'trend',
    title: {
      en: `Price Movement: ${stats.commodity} Showing ${stats.trendStatus.toUpperCase()}`,
      hi: `भाव की चाल: ${stats.commodity} में ${trendWordHi}`,
      te: `ధరల సరళి: ${stats.commodity} లో ${trendWordTe}`,
    },
    description: {
      en: `Historical mandi trend suggests ${stats.commodity} modal reference price shifted by ${
        stats.priceChangeKg >= 0 ? '+' : ''
      }₹${stats.priceChangeKg}/kg (${stats.priceChangePercent.toFixed(1)}%) to ₹${
        stats.latestModalPriceKg
      }/kg.`,
      hi: `ऐतिहासिक मंडी आंकड़ों के अनुसार ${stats.commodity} का मॉडल भाव ${
        stats.priceChangeKg >= 0 ? '+' : ''
      }₹${stats.priceChangeKg}/किलो (${stats.priceChangePercent.toFixed(1)}%) बदलकर ₹${
        stats.latestModalPriceKg
      }/किलो पर है।`,
      te: `చారిత్రక మార్కెట్ సమాచారం ప్రకారం ${stats.commodity} మోడల్ రిఫరెన్స్ ధర ${
        stats.priceChangeKg >= 0 ? '+' : ''
      }₹${stats.priceChangeKg}/కేజీ మారి ప్రస్తుతం ₹${stats.latestModalPriceKg}/కేజీగా ఉంది.`,
    },
    speechText: {
      en: `Historical trend suggests ${stats.commodity} reference price is currently ₹${
        stats.latestModalPriceKg
      } per kg with ${stats.priceChangeKg >= 0 ? 'an increase' : 'a decrease'} of ₹${Math.abs(
        stats.priceChangeKg
      )} per kg.`,
      hi: `ऐतिहासिक आंकड़ों के अनुसार ${stats.commodity} का वर्तमान मंडी संदर्भ भाव ₹${
        stats.latestModalPriceKg
      } प्रति किलो है, जिसमें ₹${Math.abs(stats.priceChangeKg)} का बदलाव देखा गया है।`,
      te: `చారిత్రక సమాచారం ప్రకారం ${stats.commodity} రిఫరెన్స్ ధర కేజీకి ₹${
        stats.latestModalPriceKg
      } గా ఉంది.`,
    },
  });

  // 2. Arbitrage / Market Comparison Insight
  if (highestMarket && lowestMarket && highestMarket.market !== lowestMarket.market) {
    const diff = highestMarket.latestModalPriceKg - lowestMarket.latestModalPriceKg;
    insights.push({
      id: 'market-comparison',
      type: 'arbitrage',
      title: {
        en: `Market Comparison: ${highestMarket.market} Highest at ₹${highestMarket.latestModalPriceKg}/kg`,
        hi: `मंडी तुलना: ${highestMarket.market} में सबसे ऊँचा भाव ₹${highestMarket.latestModalPriceKg}/किलो`,
        te: `మార్కెట్ల పోలిక: ${highestMarket.market} లో గరిష్ట ధర ₹${highestMarket.latestModalPriceKg}/కేజీ`,
      },
      description: {
        en: `Reference prices vary across mandis: ${highestMarket.market} (${highestMarket.district}) recorded highest modal rate of ₹${highestMarket.latestModalPriceKg}/kg, while ${lowestMarket.market} (${lowestMarket.district}) stood at ₹${lowestMarket.latestModalPriceKg}/kg (spread of ₹${diff.toFixed(1)}/kg).`,
        hi: `मंडियों के बीच भाव में अंतर है: ${highestMarket.market} में अधिकतम ₹${highestMarket.latestModalPriceKg}/किलो दर्ज हुआ, जबकि ${lowestMarket.market} में ₹${lowestMarket.latestModalPriceKg}/किलो रहा (₹${diff.toFixed(1)}/किलो का अंतर)।`,
        te: `మార్కెట్ల మధ్య తేడాలు: ${highestMarket.market} లో అత్యధికంగా ₹${highestMarket.latestModalPriceKg}/కేజీ ఉండగా, ${lowestMarket.market} లో ₹${lowestMarket.latestModalPriceKg}/కేజీ ఉంది (వ్యత్యాసం ₹${diff.toFixed(1)}/కేజీ).`,
      },
      speechText: {
        en: `${highestMarket.market} has the highest reference price for ${commodity} at ₹${highestMarket.latestModalPriceKg} per kg.`,
        hi: `${commodity} के लिए ${highestMarket.market} में सबसे अधिक ₹${highestMarket.latestModalPriceKg} प्रति किलो का भाव दर्ज है।`,
        te: `${commodity} కొరకు ${highestMarket.market} మార్కెట్‌లో అత్యధికంగా కేజీకి ₹${highestMarket.latestModalPriceKg} ధర ఉంది.`,
      },
    });
  }

  // 3. Farmer Practical Pricing Recommendation
  insights.push({
    id: 'farmer-guidance',
    type: 'stability',
    title: {
      en: 'Direct Farm-Gate Realization Strategy',
      hi: 'सीधी बिक्री व लाभ रणनीति',
      te: 'రైతుకు లాభదాయక నేరుగా విక్రయ విధానం',
    },
    description: {
      en: `Estimated mandi modal price is ₹${stats.latestModalPriceKg}/kg. Direct farm-gate selling on Farm2Door bypasses mandi commission (6-8%) and unloading deductions, maximizing net take-home earnings.`,
      hi: `अनुमानित मंडी संदर्भ भाव ₹${stats.latestModalPriceKg}/किलो है। फार्म2डोर पर सीधे बेचने से 6-8% मंडी आढ़त और भाड़ा बचता है।`,
      te: `అంచనా వేసిన మార్కెట్ రిఫరెన్స్ ధర ₹${stats.latestModalPriceKg}/కేజీ. ఫార్మ్2డోర్ ద్వారా నేరుగా అమ్మితే 6-8% కమీషన్ మరియు రవాణా ఖర్చులు ఆదా అవుతాయి.`,
    },
    speechText: {
      en: `Reference mandi price is ₹${stats.latestModalPriceKg} per kg. Selling directly eliminates middleman commissions.`,
      hi: `मंडी संदर्भ भाव ₹${stats.latestModalPriceKg} प्रति किलो है। सीधे बेचने से बिचौलियों का कमीशन बचता है।`,
      te: `మార్కెట్ రిఫరెన్స్ ధర కేజీకి ₹${stats.latestModalPriceKg}. నేరుగా అమ్మడం ద్వారా కమీషన్లు ఆదా చేసుకోవచ్చు.`,
    },
  });

  return insights;
}

// Calculate 7-Day Price Forecast based on Historical Slope & Volatility
export function calculatePriceForecast(
  commodity: string,
  district: string = 'All',
  market: string = 'All'
): {
  forecastDays: ForecastDay[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  confidenceNote: string;
  isSufficientData: boolean;
} {
  const trend = calculatePriceTrend(commodity, district, market, '90d');

  if (trend.length < 2) {
    return {
      forecastDays: [],
      trendDirection: 'stable',
      confidenceNote: 'Historical records are insufficient to generate a reliable price forecast.',
      isSufficientData: false,
    };
  }

  // Linear momentum estimate
  const n = trend.length;
  const recentPoints = trend.slice(Math.max(0, n - 7));
  const latestPrice = trend[n - 1].modalPriceKg;

  let slope = 0;
  if (recentPoints.length >= 2) {
    const firstRecent = recentPoints[0].modalPriceKg;
    const lastRecent = recentPoints[recentPoints.length - 1].modalPriceKg;
    slope = (lastRecent - firstRecent) / recentPoints.length;
  }

  // Damping factor to prevent runaway extrapolation
  const damping = 0.65;
  const dailyDrift = slope * damping;

  const lastDate = new Date(trend[n - 1].date);
  const forecastDays: ForecastDay[] = [];

  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];
    const dayLabel = forecastDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    // Estimated price with variance band
    const rawEst = latestPrice + dailyDrift * i;
    const estimated = Math.max(5, Math.round(rawEst * 10) / 10);
    const spread = Math.max(1.5, Math.round((estimated * 0.05 + i * 0.3) * 10) / 10);

    forecastDays.push({
      date: dateStr,
      dayLabel,
      estimatedPriceKg: estimated,
      lowerBoundKg: Math.max(2, Math.round((estimated - spread) * 10) / 10),
      upperBoundKg: Math.round((estimated + spread) * 10) / 10,
      trendSignal: dailyDrift > 0.2 ? 'up' : dailyDrift < -0.2 ? 'down' : 'neutral',
    });
  }

  const trendDirection = dailyDrift > 0.2 ? 'increasing' : dailyDrift < -0.2 ? 'decreasing' : 'stable';

  return {
    forecastDays,
    trendDirection,
    confidenceNote: 'AI Forecast — Estimated from historical mandi-price data. Subject to actual supply arrivals and seasonal market conditions.',
    isSufficientData: true,
  };
}

// Answer Voice Queries from Kisan Voice Assistant
export function answerMarketQueryFromData(
  query: string,
  lang: 'en' | 'hi' | 'te' | string = 'en'
): string | null {
  const normalizedLang: 'en' | 'hi' | 'te' = lang === 'hi' ? 'hi' : lang === 'te' ? 'te' : 'en';
  const q = query.toLowerCase();

  // Detect commodity - do NOT default to Tomato if no commodity is mentioned
  let commodity: string | null = null;
  if (q.includes('onion') || q.includes('प्याज') || q.includes('प्याज़') || q.includes('ఉల్లి') || q.includes('ఉల్లిపాయ') || q.includes('ullipaya') || q.includes('pyaj')) {
    commodity = 'Onion';
  } else if (q.includes('potato') || q.includes('आलू') || q.includes('बంగాళాదుంప') || q.includes('బంగాళదుంప') || q.includes('ఆలూ') || q.includes('aloogadda') || q.includes('alu')) {
    commodity = 'Potato';
  } else if (q.includes('tomato') || q.includes('tomatoes') || q.includes('टमाटर') || q.includes('టమోటా') || q.includes('టమాటా') || q.includes('tamatar')) {
    commodity = 'Tomato';
  }

  // If question is not about a known commodity, return null so specific handlers/Gemini answer it
  if (!commodity) {
    return null;
  }

  const COMMODITY_NAMES: Record<string, { en: string; hi: string; te: string }> = {
    Tomato: { en: 'Tomato', hi: 'टमाटर', te: 'టమాటా' },
    Onion: { en: 'Onion', hi: 'प्याज', te: 'ఉల్లిపాయ' },
    Potato: { en: 'Potato', hi: 'आलू', te: 'బంగాళాదుంప' },
  };

  const commName = COMMODITY_NAMES[commodity]?.[normalizedLang] || commodity;

  const stats = calculateOverviewStats(commodity);
  const comparisons = calculateMarketComparison(commodity);
  const highest = comparisons.find((c) => c.isHighest);

  // 1. Highest market question
  if (
    q.includes('highest') ||
    q.includes('which market') ||
    q.includes('सबसे ज्यादा') ||
    q.includes('सबसे ऊँचा') ||
    q.includes('सबसे ऊंचा') ||
    q.includes('ఎక్కడ ఎక్కువ') ||
    q.includes('అధిక ధర')
  ) {
    if (!highest) return null;
    if (normalizedLang === 'hi') {
      return `उपलब्ध आंकड़ों के अनुसार ${commName} का सबसे ऊँचा मंडी भाव ${highest.market} (${highest.district}) में ₹${highest.latestModalPriceKg} प्रति किलो चल रहा है।`;
    }
    if (normalizedLang === 'te') {
      return `అందుబాటులో ఉన్న సమాచారం ప్రకారం ${commName} అత్యధిక మార్కెట్ రిఫరెన్స్ ధర ${highest.market} లో కిలోకు ₹${highest.latestModalPriceKg} గా ఉంది.`;
    }
    return `According to latest mandi records, ${highest.market} (${highest.district}) has the highest reference price for ${commName} at ₹${highest.latestModalPriceKg} per kg.`;
  }

  // 2. Price increasing / trend question
  if (
    q.includes('increasing') ||
    q.includes('trend') ||
    q.includes('बढ़') ||
    q.includes('घट') ||
    q.includes('भाव की चाल') ||
    q.includes('పెరుగుతోందా') ||
    q.includes('తగ్గుతోందా')
  ) {
    const isUp = stats.trendStatus === 'increasing';
    const isDown = stats.trendStatus === 'decreasing';
    if (normalizedLang === 'hi') {
      return `ऐतिहासिक मंडी आंकड़ों के अनुसार ${commName} के भाव में ${
        isUp ? 'बढ़ोतरी' : isDown ? 'कमी' : 'स्थिरता'
      } दर्ज की गई है। वर्तमान औसत मॉडल भाव ₹${stats.latestModalPriceKg} प्रति किलो है।`;
    }
    if (normalizedLang === 'te') {
      return `చారిత్రక రికార్డుల ప్రకారం ${commName} ధరలలో ${
        isUp ? 'పెరుగుదల' : isDown ? 'తగ్గుదల' : 'స్థిరత్వం'
      } కనిపిస్తోంది. ప్రస్తుత మోడల్ ధర కిలోకు ₹${stats.latestModalPriceKg} గా ఉంది.`;
    }
    return `Historical mandi data indicates ${commName} prices are currently ${stats.trendStatus}. The latest reference modal price is ₹${stats.latestModalPriceKg} per kg (${stats.priceChangeKg >= 0 ? '+' : ''}₹${stats.priceChangeKg}/kg).`;
  }

  // 3. Current reference price question
  if (
    q.includes('price') ||
    q.includes('rate') ||
    q.includes('cost') ||
    q.includes('bhav') ||
    q.includes('भाव') ||
    q.includes('कीमत') ||
    q.includes('रेट') ||
    q.includes('दाम') ||
    q.includes('ధర') ||
    q.includes('రేటు') ||
    q.includes('వెల') ||
    q.includes('ఎంత')
  ) {
    if (normalizedLang === 'hi') {
      return `उपलब्ध मंडी आंकड़ों के अनुसार ${commName} का वर्तमान मॉडल संदर्भ भाव ₹${stats.latestModalPriceKg} प्रति किलो (₹${stats.latestModalPriceKg * 100} प्रति क्विंटल) है। न्यूनतम भाव ₹${stats.minPriceKg} और अधिकतम भाव ₹${stats.maxPriceKg} प्रति किलो है।`;
    }
    if (normalizedLang === 'te') {
      return `అందుబాటులో ఉన్న రికార్డుల ప్రకారం ${commName} యొక్క ప్రస్తుత మార్కెట్ రిఫరెన్స్ ధర కిలోకు ₹${stats.latestModalPriceKg} (క్వింటాల్‌కు ₹${stats.latestModalPriceKg * 100}) గా ఉంది. కనిష్ట ధర ₹${stats.minPriceKg}, గరిష్ట ధర ₹${stats.maxPriceKg}.`;
    }
    return `According to available mandi data, ${commName} modal reference price is ₹${stats.latestModalPriceKg} per kg (₹${stats.latestModalPriceKg * 100} per quintal), with minimum ₹${stats.minPriceKg}/kg and maximum ₹${stats.maxPriceKg}/kg.`;
  }

  return null;
}
