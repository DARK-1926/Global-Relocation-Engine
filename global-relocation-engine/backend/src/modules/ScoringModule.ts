import { CountryData, IntelligenceScores, ScoreWeights, UserPreferences } from '../types';
import { NormalizationEngine } from './NormalizationEngine';
import { DynamicWeightingEngine } from './DynamicWeightingEngine';
import { ObservabilityLogger } from './ObservabilityLogger';

export class ScoringModule {
  private normalizer = new NormalizationEngine();
  private weighter = new DynamicWeightingEngine();
  private logger?: ObservabilityLogger;

  constructor(logger?: ObservabilityLogger) {
    this.logger = logger;
  }

  public computeScores(data: CountryData, prefs: UserPreferences): { scores: IntelligenceScores; weightedScore: number; weights: ScoreWeights } {
    this.logger?.logScoringComputation(data.name, prefs);

    const weights = this.weighter.calculateWeights(prefs);

    // 1. Travel Risk Score
    const tempScore = this.normalizer.normalizeTemperature(data.temperature);
    const aqiScore = this.normalizer.normalizeAQI(data.aqi);
    const advScore = this.normalizer.normalizeAdvisory(data.advisoryLevel);
    
    let trAQIWeight = 0.33;
    let trAdvWeight = 0.33;
    let trTempWeight = 0.34;

    if (prefs.riskTolerance === 'Low') {
      trAdvWeight = 0.5;
      trAQIWeight = 0.4;
      trTempWeight = 0.1;
    }

    const travelRisk = Math.round((tempScore * trTempWeight) + (aqiScore * trAQIWeight) + (advScore * trAdvWeight));

    // 2. Health Infrastructure Score
    const lifeExpScore = this.normalizer.normalizeLifeExpectancy(data.lifeExpectancy);
    const healthExpScore = this.normalizer.normalizeHealthcare(data.healthcareExpenditure);
    const healthInfrastructure = Math.round((lifeExpScore * 0.5) + (healthExpScore * 0.5));

    // 3. Environmental Stability Score
    const environmentalStability = Math.round((tempScore * 0.5) + (aqiScore * 0.5));

    const scores: IntelligenceScores = {
      travelRisk: this.clamp(travelRisk),
      healthInfrastructure: this.clamp(healthInfrastructure),
      environmentalStability: this.clamp(environmentalStability)
    };

    const weightedScore = Math.round(
      (scores.travelRisk * (weights.travelRisk / 100)) +
      (scores.healthInfrastructure * (weights.healthInfrastructure / 100)) +
      (scores.environmentalStability * (weights.environmentalStability / 100))
    );

    return { scores, weightedScore, weights };
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
