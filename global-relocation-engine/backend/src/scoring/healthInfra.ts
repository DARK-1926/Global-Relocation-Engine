/**
 * Health Infrastructure Score (0-100)
 * Higher score = better healthcare infrastructure.
 */

import {
    normalizeLifeExpectancy,
    normalizePopulation
} from './normalize.js';

import type { CountryProfile } from '../apis/restCountries.js';

/**
 * Estimate life expectancy based on region and development indicators.
 */
const REGION_LIFE_EXPECTANCY: Record<string, number> = {
    'Europe': 78,
    'Northern America': 78,
    'Oceania': 75,
    'South America': 74,
    'Central America': 73,
    'Caribbean': 72,
    'Eastern Asia': 76,
    'South-Eastern Asia': 72,
    'Western Asia': 74,
    'Southern Asia': 69,
    'Central Asia': 71,
    'Northern Africa': 72,
    'Western Africa': 58,
    'Eastern Africa': 62,
    'Southern Africa': 64,
    'Middle Africa': 58,
    'Antarctica': 75,
    'default': 70
};

/**
 * Region-based healthcare quality proxy score.
 */
const REGION_HEALTHCARE_PROXY: Record<string, number> = {
    'Europe': 85,
    'Northern America': 80,
    'Oceania': 78,
    'Eastern Asia': 77,
    'South America': 65,
    'South-Eastern Asia': 60,
    'Western Asia': 68,
    'Southern Asia': 50,
    'Central Asia': 55,
    'Northern Africa': 58,
    'Western Africa': 38,
    'Eastern Africa': 40,
    'Southern Africa': 55,
    'Middle Africa': 35,
    'Caribbean': 62,
    'Central America': 60,
    'default': 55
};

export interface HealthInfraBreakdown {
    lifeExpectancyScore: number | null;
    populationPressure: number | null;
    healthcareProxy: number | null;
    estimatedLifeExpectancy: number | null;
}

export interface HealthInfraResult {
    score: number | null;
    breakdown: HealthInfraBreakdown;
    factorsUsed: number;
}

/**
 * Compute Health Infrastructure Score for a country.
 */
export function computeHealthInfra(countryData: CountryProfile | null): HealthInfraResult {
    const breakdown: HealthInfraBreakdown = {
        lifeExpectancyScore: null,
        populationPressure: null,
        healthcareProxy: null,
        estimatedLifeExpectancy: null
    };

    if (!countryData) return { score: null, breakdown, factorsUsed: 0 };

    const subregion = countryData.subregion || '';
    const region = countryData.region || '';
    let factorsUsed = 0;

    // Life expectancy estimate
    const lifeExp = REGION_LIFE_EXPECTANCY[subregion]
        || REGION_LIFE_EXPECTANCY[region]
        || REGION_LIFE_EXPECTANCY['default'] || 70;
    breakdown.estimatedLifeExpectancy = lifeExp;
    breakdown.lifeExpectancyScore = normalizeLifeExpectancy(lifeExp);
    factorsUsed++;

    // Population pressure
    if (countryData.population) {
        const popNorm = normalizePopulation(countryData.population);
        // Invert: higher population = more pressure = lower score
        breakdown.populationPressure = popNorm !== null ? Math.round((100 - popNorm) * 100) / 100 : null;
        factorsUsed++;
    }

    // Healthcare quality proxy based on region
    const healthProxy = REGION_HEALTHCARE_PROXY[subregion]
        || REGION_HEALTHCARE_PROXY[region]
        || REGION_HEALTHCARE_PROXY['default'] || 55;
    breakdown.healthcareProxy = healthProxy;
    factorsUsed++;

    // Weighted aggregation
    const lifeExpWeight = 0.40;
    const popPressureWeight = 0.15;
    const healthProxyWeight = 0.45;

    let score = 0;
    let totalWeight = 0;

    if (breakdown.lifeExpectancyScore !== null) {
        score += breakdown.lifeExpectancyScore * lifeExpWeight;
        totalWeight += lifeExpWeight;
    }
    if (breakdown.populationPressure !== null) {
        score += breakdown.populationPressure * popPressureWeight;
        totalWeight += popPressureWeight;
    }
    if (breakdown.healthcareProxy !== null) {
        score += breakdown.healthcareProxy * healthProxyWeight;
        totalWeight += healthProxyWeight;
    }

    const finalScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) / 100 : null;

    return { score: finalScore, breakdown, factorsUsed };
}
