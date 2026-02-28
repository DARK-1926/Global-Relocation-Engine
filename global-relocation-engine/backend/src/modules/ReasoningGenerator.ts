import { CountryData, IntelligenceScores, ScoreWeights, UserPreferences } from '../types';

export class ReasoningGenerator {
  public generateReasoning(
    country: string, 
    rank: number, 
    scores: IntelligenceScores, 
    weightedScore: number, 
    weights: ScoreWeights, 
    prefs: UserPreferences
  ): string {
    let factors = [
      { name: 'Travel Risk', score: scores.travelRisk, weight: weights.travelRisk },
      { name: 'Health Infrastructure', score: scores.healthInfrastructure, weight: weights.healthInfrastructure },
      { name: 'Environmental Stability', score: scores.environmentalStability, weight: weights.environmentalStability }
    ];

    factors.sort((a, b) => a.score - b.score);
    const lowest = factors[0];
    const middle = factors[1];
    const highest = factors[2];

    let context = '';
    if (prefs.duration === 'Long-term' && lowest.name === 'Health Infrastructure') {
      context = ' This is particularly impactful given your long-term duration preference.';
    } else if (prefs.duration === 'Short-term' && lowest.name === 'Environmental Stability') {
      context = ' Environmental stability is critical for your short-term duration.';
    }

    if (rank === 1) {
      return `${country} ranks ${rank} with an excellent weighted score of ${Math.round(weightedScore)}/100. Key strengths: ${highest.name} (${Math.round(highest.score)}/100) and ${middle.name} (${Math.round(middle.score)}/100).${context}`;
    }

    return `${country} ranks ${rank} with a weighted score of ${Math.round(weightedScore)}/100. Ranked lower primarily due to poor ${lowest.name} (${Math.round(lowest.score)}/100), despite better ${highest.name} (${Math.round(highest.score)}/100).${context}`;
  }
}
