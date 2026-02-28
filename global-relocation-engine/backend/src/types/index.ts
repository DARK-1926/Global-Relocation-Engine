export interface CountryData {
  countryCode: string;
  name: string;
  capital?: string | null;
  population?: number | null;
  currency?: string | null;
  lifeExpectancy?: number | null;
  healthcareExpenditure?: number | null;
  temperature?: number | null;
  temperatureMin?: number | null;
  temperatureMax?: number | null;
  aqi?: number | null;
  advisoryLevel?: number | null;
}

export interface UserPreferences {
  countries: string[];
  riskTolerance: 'Low' | 'Moderate' | 'High';
  duration: 'Short-term' | 'Long-term';
}

export interface AnalysisRequest extends UserPreferences {}

export interface IntelligenceScores {
  travelRisk: number;
  healthInfrastructure: number;
  environmentalStability: number;
}

export interface ScoreWeights {
  travelRisk: number;
  healthInfrastructure: number;
  environmentalStability: number;
}

export interface RankedCountry extends IntelligenceScores {
  countryCode: string;
  name: string;
  weightedScore: number;
  rank: number;
  reasoning: string;
}

export interface FailureInfo {
  apiName: string;
  error: string;
}

export interface AnalysisResponse {
  results: RankedCountry[];
  metadata: {
    processingTimeMs: number;
    cacheHits: number;
    cacheMisses: number;
    failures: { country: string; infos: FailureInfo[] }[];
  };
}
