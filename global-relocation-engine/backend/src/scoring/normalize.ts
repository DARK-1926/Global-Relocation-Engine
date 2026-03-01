/**
 * Normalization Module
 * Normalizes heterogeneous metrics to a 0-100 scale for comparable scoring.
 */

/**
 * Clamp a value between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

/**
 * Min-Max Normalization to 0-100 scale
 * Formula: ((value - min) / (max - min)) * 100
 *
 * Ranges used:
 * - Temperature: -50°C to 50°C
 * - AQI: 0 to 500 (inverted: lower is better)
 * - Life Expectancy: 50 to 85 years
 * - Healthcare Exp: 0% to 20% of GDP
 */
export function minMaxNormalize(value: number | null | undefined, min: number, max: number, invert: boolean = false): number | null {
    if (value === null || value === undefined || isNaN(value)) return null;
    let normalized = ((value - min) / (max - min)) * 100;
    if (invert) normalized = 100 - normalized;
    const clamped = Math.max(0, Math.min(100, normalized)); // Clamp to [0, 100]
    return Math.round(clamped * 100) / 100;
}

/**
 * Normalize temperature based on deviation from comfort zone (20-25°C).
 * Returns 0-100 where 100 = perfect comfort, 0 = extreme.
 */
export function normalizeTemperature(temp: number | null | undefined): number | null {
    if (temp === null || temp === undefined) return null;
    const comfortCenter = 22.5;
    const maxDeviation = 40; // beyond ±40°C from comfort = score 0
    const deviation = Math.abs(temp - comfortCenter);
    const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
    return Math.round(score * 100) / 100;
}

/**
 * Normalize AQI (US EPA scale, 0-500).
 * Returns 0-100 where 100 = best air quality, 0 = hazardous.
 */
export function normalizeAQI(aqi: number | null | undefined): number | null {
    if (aqi === null || aqi === undefined) return null;
    return minMaxNormalize(aqi, 0, 500, true);
}

/**
 * Normalize PM2.5 (µg/m³, capped at 250).
 * Returns 0-100 where 100 = cleanest, 0 = worst.
 */
export function normalizePM25(pm25: number | null | undefined): number | null {
    if (pm25 === null || pm25 === undefined) return null;
    return minMaxNormalize(pm25, 0, 250, true);
}

/**
 * Normalize life expectancy (global range 50 to 85 years).
 * Returns 0-100 where 100 = highest life expectancy.
 */
export function normalizeLifeExpectancy(lifeExp: number | null | undefined): number | null {
    return minMaxNormalize(lifeExp, 50, 85, false);
}

/**
 * Normalize Healthcare Expenditure (0% to 20% of GDP).
 * Returns 0-100 where 100 = highest expenditure.
 */
export function normalizeHealthcareExp(exp: number | null | undefined): number | null {
    return minMaxNormalize(exp, 0, 20, false);
}

/**
 * Normalize population to pressure factor using log scale.
 * Returns 0-100 where 100 = highest population pressure.
 */
export function normalizePopulation(pop: number | null | undefined): number | null {
    if (!pop || pop <= 0) return null;
    const logPop = Math.log10(pop);
    // Range: log10(10000) = 4 to log10(1.4B) ≈ 9.15
    return minMaxNormalize(logPop, 4, 9.15, false);
}

/**
 * Normalize wind speed (km/h, capped at 100).
 * Returns 0-100 where 100 = calm, 0 = extreme wind.
 */
export function normalizeWindSpeed(windSpeed: number | null | undefined): number | null {
    if (windSpeed === null || windSpeed === undefined) return null;
    return minMaxNormalize(windSpeed, 0, 100, true);
}

/**
 * Normalize humidity based on deviation from comfort zone (40-60%).
 * Returns 0-100 where 100 = perfect comfort humidity.
 */
export function normalizeHumidity(humidity: number | null | undefined): number | null {
    if (humidity === null || humidity === undefined) return null;
    const comfortLow = 40;
    const comfortHigh = 60;
    let deviation = 0;
    if (humidity < comfortLow) deviation = comfortLow - humidity;
    else if (humidity > comfortHigh) deviation = humidity - comfortHigh;
    const maxDeviation = 60; // 0% or 100% = max deviation
    const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
    return Math.round(score * 100) / 100;
}

/**
 * Normalize temperature range (volatility indicator).
 * High range = volatile weather. Returns 0-100 where 100 = stable.
 */
export function normalizeTemperatureRange(range: number | null | undefined): number | null {
    if (range === null || range === undefined) return null;
    return minMaxNormalize(range, 0, 40, true);
}
