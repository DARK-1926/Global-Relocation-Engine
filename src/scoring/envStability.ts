/**
 * Environmental Stability Score (0-100)
 * Higher score = more environmentally stable destination.
 */

import {
    normalizeAQI,
    normalizePM25,
    normalizeHumidity,
    normalizeWindSpeed,
    normalizeTemperatureRange
} from './normalize.js';

import type { WeatherData } from '../apis/openMeteoWeather.js';
import type { AQIData } from '../apis/openMeteoAQI.js';

export interface EnvStabilityBreakdown {
    weatherVolatility: number | null;
    airQualityScore: number | null;
    humidityComfort: number | null;
    windStability: number | null;
    pm25Score: number | null;
}

export interface EnvStabilityResult {
    score: number | null;
    breakdown: EnvStabilityBreakdown;
    factorsUsed: number;
}

/**
 * Compute Environmental Stability Score for a country.
 */
export function computeEnvStability(weatherData: WeatherData | null, aqiData: AQIData | null): EnvStabilityResult {
    const breakdown: EnvStabilityBreakdown = {
        weatherVolatility: null,
        airQualityScore: null,
        humidityComfort: null,
        windStability: null,
        pm25Score: null
    };

    let weightedSum = 0;
    let totalWeight = 0;
    let factorsUsed = 0;

    // Weather volatility (from temperature range)
    if (weatherData?.temperatureRange !== null && weatherData?.temperatureRange !== undefined) {
        breakdown.weatherVolatility = normalizeTemperatureRange(weatherData.temperatureRange);
        if (breakdown.weatherVolatility !== null) {
            weightedSum += breakdown.weatherVolatility * 0.25;
            totalWeight += 0.25;
            factorsUsed++;
        }
    }

    // Air quality (US AQI)
    if (aqiData?.usAQI !== null && aqiData?.usAQI !== undefined) {
        breakdown.airQualityScore = normalizeAQI(aqiData.usAQI);
        if (breakdown.airQualityScore !== null) {
            weightedSum += breakdown.airQualityScore * 0.30;
            totalWeight += 0.30;
            factorsUsed++;
        }
    }

    // PM2.5 component
    if (aqiData?.pm25 !== null && aqiData?.pm25 !== undefined) {
        breakdown.pm25Score = normalizePM25(aqiData.pm25);
        if (breakdown.pm25Score !== null) {
            weightedSum += breakdown.pm25Score * 0.15;
            totalWeight += 0.15;
            factorsUsed++;
        }
    }

    // Humidity comfort
    if (weatherData?.humidity !== null && weatherData?.humidity !== undefined) {
        breakdown.humidityComfort = normalizeHumidity(weatherData.humidity);
        if (breakdown.humidityComfort !== null) {
            weightedSum += breakdown.humidityComfort * 0.15;
            totalWeight += 0.15;
            factorsUsed++;
        }
    }

    // Wind stability
    if (weatherData?.windSpeed !== null && weatherData?.windSpeed !== undefined) {
        breakdown.windStability = normalizeWindSpeed(weatherData.windSpeed);
        if (breakdown.windStability !== null) {
            weightedSum += breakdown.windStability * 0.15;
            totalWeight += 0.15;
            factorsUsed++;
        }
    }

    const score = totalWeight > 0
        ? Math.round((weightedSum / totalWeight) * 100) / 100
        : null;

    return { score, breakdown, factorsUsed };
}
