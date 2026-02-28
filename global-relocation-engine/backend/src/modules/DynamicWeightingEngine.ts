import { ScoreWeights, UserPreferences } from "../types";

export class DynamicWeightingEngine {
  public calculateWeights(prefs: UserPreferences): ScoreWeights {
    const weights: ScoreWeights = {
      travelRisk: 33.33,
      healthInfrastructure: 33.33,
      environmentalStability: 33.33
    };

    // Duration logic
    if (prefs.duration === 'Short-term') {
      weights.environmentalStability += 20;
      weights.healthInfrastructure -= 10;
      weights.travelRisk -= 10;
    } else if (prefs.duration === 'Long-term') {
      weights.healthInfrastructure += 20;
      weights.environmentalStability -= 10;
      weights.travelRisk -= 10;
    }

    // Risk tolerance affects risk penalty within the travelRisk calculation, 
    // or it affects the weight of travelRisk overall. 
    // "Low risk tolerance: Higher penalty for poor AQI and advisory risk" 
    // This implies travel risk takes higher precedence if tolerance is low.
    if (prefs.riskTolerance === 'Low') {
      weights.travelRisk += 20;
      weights.environmentalStability -= 10;
      weights.healthInfrastructure -= 10;
    } else if (prefs.riskTolerance === 'High') {
      weights.travelRisk -= 20;
      weights.environmentalStability += 10;
      weights.healthInfrastructure += 10;
    }

    // Normalize weights to sum to 100
    const total = weights.travelRisk + weights.healthInfrastructure + weights.environmentalStability;
    weights.travelRisk = (weights.travelRisk / total) * 100;
    weights.healthInfrastructure = (weights.healthInfrastructure / total) * 100;
    weights.environmentalStability = (weights.environmentalStability / total) * 100;

    return weights;
  }
}
