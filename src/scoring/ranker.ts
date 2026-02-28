/**
 * Ranking & Explainability Engine
 *
 * Computes composite scores per country using weighted scoring,
 * generates structured reasoning referencing contributing factors,
 * and returns a sorted ranking from best to worst.
 */

import { computeTravelRisk, TravelRiskResult } from './travelRisk.js';
import { computeHealthInfra, HealthInfraResult } from './healthInfra.js';
import { computeEnvStability, EnvStabilityResult } from './envStability.js';
import { getWeights, ScoringWeights } from './weights.js';
import logger from '../logger.js';

import type { CountryProfile } from '../apis/restCountries.js';
import type { WeatherData } from '../apis/openMeteoWeather.js';
import type { AQIData } from '../apis/openMeteoAQI.js';

export interface Factor {
    type: 'positive' | 'negative' | 'neutral';
    text: string;
    impact: 'high' | 'medium' | 'low';
    score?: number;
}

export interface Reasoning {
    summary: string;
    factors: Factor[];
    weightProfile: ScoringWeights;
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
    compositeScore: number | null;
    scores: {
        travelRisk: TravelRiskResult;
        healthInfra: HealthInfraResult;
        envStability: EnvStabilityResult;
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
    errors: string[];
}

export interface RankingResults {
    rankings: RankedCountry[];
    weights: ScoringWeights;
    metadata: {
        totalCountries: number;
        riskTolerance: string;
        duration: string;
        analyzedAt: string;
    };
}

/**
 * Generate structured reasoning for a country's ranking.
 * References at least two contributing factors.
 */
function generateReasoning(
    countryName: string,
    rank: number,
    totalCountries: number,
    scores: { travelRisk: TravelRiskResult, healthInfra: HealthInfraResult, envStability: EnvStabilityResult },
    weights: ScoringWeights
): Reasoning {
    const factors: Factor[] = [];

    // Analyze Travel Risk
    if (scores.travelRisk.score !== null) {
        if (scores.travelRisk.score <= 25) {
            factors.push({ type: 'positive', text: 'low travel risk', impact: 'high', score: scores.travelRisk.score });
        } else if (scores.travelRisk.score >= 50) {
            factors.push({ type: 'negative', text: 'elevated travel risk', impact: 'high', score: scores.travelRisk.score });
        } else {
            factors.push({ type: 'neutral', text: 'moderate travel risk', impact: 'medium', score: scores.travelRisk.score });
        }
    }

    // Analyze Health Infrastructure
    if (scores.healthInfra.score !== null) {
        if (scores.healthInfra.score >= 75) {
            factors.push({ type: 'positive', text: 'strong healthcare infrastructure', impact: 'high', score: scores.healthInfra.score });
        } else if (scores.healthInfra.score <= 45) {
            factors.push({ type: 'negative', text: 'limited healthcare infrastructure', impact: 'high', score: scores.healthInfra.score });
        } else {
            factors.push({ type: 'neutral', text: 'adequate healthcare infrastructure', impact: 'medium', score: scores.healthInfra.score });
        }
    }

    // Analyze Environmental Stability
    if (scores.envStability.score !== null) {
        if (scores.envStability.score >= 75) {
            factors.push({ type: 'positive', text: 'excellent environmental stability', impact: 'high', score: scores.envStability.score });
        } else if (scores.envStability.score <= 40) {
            factors.push({ type: 'negative', text: 'poor environmental conditions', impact: 'high', score: scores.envStability.score });
        } else {
            factors.push({ type: 'neutral', text: 'moderate environmental conditions', impact: 'medium', score: scores.envStability.score });
        }
    }

    // Analyze specific sub-factors for richer reasoning
    if (scores.travelRisk.breakdown) {
        if (scores.travelRisk.breakdown.aqiRisk !== null && scores.travelRisk.breakdown.aqiRisk > 10) {
            factors.push({ type: 'negative', text: 'high AQI contributing to travel risk', impact: 'medium' });
        }
        if (scores.travelRisk.breakdown.temperatureRisk !== null && scores.travelRisk.breakdown.temperatureRisk > 10) {
            factors.push({ type: 'negative', text: 'temperature extremes detected', impact: 'medium' });
        }
    }

    // Build summary sentence
    const positives = factors.filter(f => f.type === 'positive');
    const negatives = factors.filter(f => f.type === 'negative');

    let summary = '';
    if (rank === 1) {
        summary = `${countryName} ranks #1 out of ${totalCountries} destinations. `;
        if (positives.length > 0) {
            summary += `Boosted by ${positives.map(f => f.text).join(' and ')}. `;
        }
        if (negatives.length > 0) {
            summary += `Minor concerns: ${negatives.map(f => f.text).join(', ')}.`;
        }
    } else if (rank === totalCountries) {
        summary = `${countryName} ranks last (#${rank} of ${totalCountries}). `;
        if (negatives.length > 0) {
            summary += `Ranked lower due to ${negatives.map(f => f.text).join(' and ')}. `;
        }
        if (positives.length > 0) {
            summary += `Positives include ${positives.map(f => f.text).join(' and ')}.`;
        }
    } else {
        summary = `${countryName} ranks #${rank} of ${totalCountries}. `;
        const allFactorTexts = factors.slice(0, 3).map(f => {
            if (f.type === 'positive') return `benefits from ${f.text}`;
            if (f.type === 'negative') return `held back by ${f.text}`;
            return `shows ${f.text}`;
        });
        summary += allFactorTexts.join('; ') + '.';
    }

    return {
        summary: summary.trim(),
        factors,
        weightProfile: weights
    };
}

interface CountryEntry {
    country: CountryProfile;
    weather: WeatherData | null;
    aqi: AQIData | null;
    cacheStatus: any;
    errors: string[];
}

/**
 * Rank countries based on aggregated data and user constraints.
 */
export function rankCountries(countriesData: CountryEntry[], riskTolerance: string, duration: string): RankingResults {
    const weights = getWeights(riskTolerance, duration);

    const scored = countriesData.map(entry => {
        const { country, weather, aqi, cacheStatus, errors } = entry;

        // Compute individual scores
        const travelRisk = computeTravelRisk(weather, aqi);
        const healthInfra = computeHealthInfra(country);
        const envStability = computeEnvStability(weather, aqi);

        const scores = { travelRisk, healthInfra, envStability };

        // Compute composite score
        // Travel Risk is inverted: lower risk = higher suitability
        let compositeScore: number | null = null;
        let compositeSum = 0;
        let compositeWeightSum = 0;

        if (travelRisk.score !== null) {
            // Invert: 100 - riskScore = suitability from risk perspective
            compositeSum += (100 - travelRisk.score) * weights.travelRisk;
            compositeWeightSum += weights.travelRisk;
        }
        if (healthInfra.score !== null) {
            compositeSum += healthInfra.score * weights.healthInfra;
            compositeWeightSum += weights.healthInfra;
        }
        if (envStability.score !== null) {
            compositeSum += envStability.score * weights.envStability;
            compositeWeightSum += weights.envStability;
        }

        if (compositeWeightSum > 0) {
            compositeScore = Math.round((compositeSum / compositeWeightSum) * 100) / 100;
        }

        logger.scoringEvent(country?.name || 'Unknown', {
            travelRisk: travelRisk.score,
            healthInfra: healthInfra.score,
            envStability: envStability.score,
            composite: compositeScore
        });

        return {
            country: country || {},
            weather: weather || null,
            aqi: aqi || null,
            scores,
            compositeScore,
            cacheStatus: cacheStatus || {},
            errors: errors || [],
            hasPartialData: errors && errors.length > 0
        };
    });

    // Sort by composite score descending (highest = best)
    scored.sort((a, b) => {
        if (a.compositeScore === null && b.compositeScore === null) return 0;
        if (a.compositeScore === null) return 1;
        if (b.compositeScore === null) return -1;
        return b.compositeScore - a.compositeScore;
    });

    // Assign ranks and reasoning
    const totalCountries = scored.length;
    const ranked: RankedCountry[] = scored.map((entry, index) => {
        const rank = index + 1;
        const reasoning = generateReasoning(
            entry.country?.name || 'Unknown',
            rank,
            totalCountries,
            entry.scores,
            weights
        );

        return {
            rank,
            countryName: entry.country?.name || 'Unknown',
            flagEmoji: (entry.country as any).flagEmoji || '',
            flag: (entry.country as any).flag || '',
            capital: entry.country?.capital || 'Unknown',
            region: entry.country?.region || 'Unknown',
            population: entry.country?.population || 0,
            currencies: entry.country?.currencies || [],
            compositeScore: entry.compositeScore,
            scores: {
                travelRisk: entry.scores.travelRisk,
                healthInfra: entry.scores.healthInfra,
                envStability: entry.scores.envStability
            },
            currentConditions: {
                temperature: entry.weather?.temperature ?? null,
                weatherDescription: entry.weather?.weatherDescription ?? 'N/A',
                humidity: entry.weather?.humidity ?? null,
                windSpeed: entry.weather?.windSpeed ?? null,
                aqi: entry.aqi?.usAQI ?? null,
                aqiCategory: entry.aqi?.aqiCategory ?? 'Unknown',
                aqiColor: entry.aqi?.aqiColor ?? '#888'
            },
            reasoning,
            cacheStatus: entry.cacheStatus,
            hasPartialData: entry.hasPartialData || false,
            errors: entry.errors
        };
    });

    return {
        rankings: ranked,
        weights,
        metadata: {
            totalCountries,
            riskTolerance,
            duration,
            analyzedAt: new Date().toISOString()
        }
    };
}
