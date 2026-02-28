import { CountryData, IntelligenceScores, RankedCountry, ScoreWeights, UserPreferences } from '../types';
import { ReasoningGenerator } from './ReasoningGenerator';

export class RankingEngine {
  private reasoningGen = new ReasoningGenerator();

  public rankCountries(
    results: { country: CountryData; scores: IntelligenceScores; weightedScore: number; weights: ScoreWeights }[],
    prefs: UserPreferences
  ): RankedCountry[] {
    
    // Sort descending by weighted score
    results.sort((a, b) => {
      if (b.weightedScore === a.weightedScore) {
        return a.country.name.localeCompare(b.country.name); // Alphabetical tiebreaker
      }
      return b.weightedScore - a.weightedScore;
    });

    const ranked: RankedCountry[] = results.map((item, index) => {
      const rankNum = index + 1;
      const reasoning = this.reasoningGen.generateReasoning(
        item.country.name, 
        rankNum, 
        item.scores, 
        item.weightedScore, 
        item.weights, 
        prefs
      );

      return {
        countryCode: item.country.countryCode,
        name: item.country.name,
        travelRisk: item.scores.travelRisk,
        healthInfrastructure: item.scores.healthInfrastructure,
        environmentalStability: item.scores.environmentalStability,
        weightedScore: item.weightedScore,
        rank: rankNum,
        reasoning
      };
    });

    return ranked;
  }
}
