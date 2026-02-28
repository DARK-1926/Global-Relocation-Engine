export interface IntelligenceScores {
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

export interface AnalysisRequest {
  countries: string[];
  riskTolerance: 'Low' | 'Moderate' | 'High';
  duration: 'Short-term' | 'Long-term';
}
