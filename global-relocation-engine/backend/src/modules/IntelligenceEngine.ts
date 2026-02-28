import { AnalysisRequest, AnalysisResponse, CountryData, FailureInfo } from '../types';
import { APIAggregator } from './APIAggregator';
import { CacheManager } from './CacheManager';
import { ObservabilityLogger } from './ObservabilityLogger';
import { RankingEngine } from './RankingEngine';
import { RequestValidator } from './RequestValidator';
import { ScoringModule } from './ScoringModule';

export class IntelligenceEngine {
  private cache = new CacheManager();
  private logger = new ObservabilityLogger();
  private validator = new RequestValidator();
  private aggregator = new APIAggregator(this.cache, this.logger);
  private scoring = new ScoringModule(this.logger);
  private ranking = new RankingEngine();

  public async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    let cacheHits = 0;
    let cacheMisses = 0;

    const fetchPromises = request.countries.map(async (code: string) => {
      const cacheKey = `country:${code}`;
      const isHit = !!this.cache.get(cacheKey);
      if (isHit) {
        cacheHits++;
      } else {
        cacheMisses++;
      }

      const result = await this.aggregator.fetchCountryData(code);
      return { code, ...result };
    });

    const results = await Promise.all(fetchPromises);

    const validResults = [];
    const allFailures: { country: string; infos: FailureInfo[] }[] = [];

    for (const res of results) {
      if (res.failures.length > 0) {
        allFailures.push({
          country: res.code,
          infos: res.failures.map((f: string) => ({ apiName: f, error: 'API Failure/Timeout' }))
        });
      }

      if (!res.data || (!res.data.temperature && !res.data.aqi && !res.data.lifeExpectancy && !res.data.healthcareExpenditure && !res.data.advisoryLevel)) {
         this.logger.logFailure('ALL', 'Complete Failure. Excluding country.', res.code);
         continue; 
      }

      const { scores, weightedScore, weights } = this.scoring.computeScores(res.data, request);
      validResults.push({ country: res.data, scores, weightedScore, weights });
    }

    const rankedCountries = this.ranking.rankCountries(validResults, request);
    
    const processingTimeMs = Date.now() - startTime;
    this.logger.logCompletion(processingTimeMs, rankedCountries.length);

    return {
      results: rankedCountries,
      metadata: {
        processingTimeMs,
        cacheHits,
        cacheMisses,
        failures: allFailures
      }
    };
  }
}
