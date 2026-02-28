/**
 * Travel Risk Score (0-100)
 * Lower score = safer destination.
 */

import {
    normalizeTemperature,
    normalizeAQI,
    normalizeWindSpeed
} from './normalize.js';

import type { WeatherData } from '../apis/openMeteoWeather.js';
import type { AQIData } from '../apis/openMeteoAQI.js';

/**
 * Get weather severity penalty from WMO weather code.
 * Range: 0 (clear) to 30 (severe storm)
 */
function getWeatherCodePenalty(code: number | null | undefined): number {
    if (code === null || code === undefined) return 0;
    if (code === 0) return 0;                        // Clear
    if (code <= 3) return 2;                         // Cloudy
    if (code <= 48) return 8;                        // Fog
    if (code <= 57) return 12;                       // Drizzle / Freezing drizzle
    if (code <= 65) return 15;                       // Rain
    if (code <= 67) return 20;                       // Freezing rain
    if (code <= 77) return 22;                       // Snow
    if (code <= 82) return 18;                       // Rain showers
    if (code <= 86) return 22;                       // Snow showers
    if (code >= 95) return 30;                       // Thunderstorm
    return 5;
}

export interface TravelRiskBreakdown {
    temperatureRisk: number | null;
    aqiRisk: number | null;
    windRisk: number | null;
    weatherSeverity: number | null;
}

export interface TravelRiskResult {
    score: number | null;
    breakdown: TravelRiskBreakdown;
    factorsUsed: number;
}

/**
 * Compute Travel Risk Score for a country.
 */
export function computeTravelRisk(weatherData: WeatherData | null, aqiData: AQIData | null): TravelRiskResult {
    const breakdown: TravelRiskBreakdown = {
        temperatureRisk: null,
        aqiRisk: null,
        windRisk: null,
        weatherSeverity: null
    };

    let totalPenalty = 0;
    let factorsUsed = 0;

    // Temperature extremes
    if (weatherData?.temperature !== null && weatherData?.temperature !== undefined) {
        const comfortScore = normalizeTemperature(weatherData.temperature);
        if (comfortScore !== null) {
            breakdown.temperatureRisk = Math.round((100 - comfortScore) * 0.35 * 100) / 100;
            totalPenalty += breakdown.temperatureRisk;
            factorsUsed++;
        }
    }

    // AQI severity
    if (aqiData?.usAQI !== null && aqiData?.usAQI !== undefined) {
        const aqiScore = normalizeAQI(aqiData.usAQI);
        if (aqiScore !== null) {
            breakdown.aqiRisk = Math.round((100 - aqiScore) * 0.35 * 100) / 100;
            totalPenalty += breakdown.aqiRisk;
            factorsUsed++;
        }
    }

    // Wind risk
    if (weatherData?.windSpeed !== null && weatherData?.windSpeed !== undefined) {
        const windScore = normalizeWindSpeed(weatherData.windSpeed);
        if (windScore !== null) {
            breakdown.windRisk = Math.round((100 - windScore) * 0.15 * 100) / 100;
            totalPenalty += breakdown.windRisk;
            factorsUsed++;
        }
    }

    // Weather severity from code
    if (weatherData?.weatherCode !== null && weatherData?.weatherCode !== undefined) {
        breakdown.weatherSeverity = getWeatherCodePenalty(weatherData.weatherCode) * 0.5;
        totalPenalty += breakdown.weatherSeverity;
        factorsUsed++;
    }

    // Scale if not all factors available
    let score: number | null;
    if (factorsUsed === 0) {
        score = null;
    } else {
        score = Math.min(100, Math.max(0, Math.round(totalPenalty * 100) / 100));
    }

    return { score, breakdown, factorsUsed };
}
