export interface Factor {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
  impact: 'high' | 'medium' | 'low';
  score?: number;
}

export interface Reasoning {
  summary: string;
  factors: Factor[];
  weightProfile: { travelRisk: number; healthInfra: number; envStability: number };
}

export interface RankedCountry {
  rank: number;
  countryName: string;
  flagEmoji: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  currencies: any[];
  latlng: [number, number];
  cca3: string;
  compositeScore: number | null;
  scores: {
    travelRisk: { score: number | null };
    healthInfra: { score: number | null };
    envStability: { score: number | null };
  };
  currentConditions: {
    temperature: number | null;
    weatherDescription: string;
    humidity: number | null;
    windSpeed: number | null;
    aqi: number | null;
    aqiCategory: string;
    aqiColor: string;
  };
  reasoning: Reasoning;
  cacheStatus: any;
  hasPartialData: boolean;
  errors: any[];
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    rankings: RankedCountry[];
    weights: { travelRisk: number; healthInfra: number; envStability: number };
    metadata: {
      totalCountries: number;
      riskTolerance: string;
      duration: string;
      analyzedAt: string;
    };
  };
  failedCountries?: any[];
  performance: {
    responseTimeMs: number;
    cacheStats: any;
  };
  activityLog?: any[];
  exchangeRates?: any;
}

export interface AnalysisRequest {
  countries: string[];
  riskTolerance: 'Low' | 'Moderate' | 'High';
  duration: 'Short-term' | 'Long-term';
}
