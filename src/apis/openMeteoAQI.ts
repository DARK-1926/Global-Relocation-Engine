/**
 * Open-Meteo Air Quality API Integration
 * Fetches AQI and pollutant data for a capital city using lat/lng.
 * API: https://air-quality-api.open-meteo.com/v1/air-quality
 * No API key required.
 */

import logger from '../logger.js';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export interface AQIData {
    usAQI: number | null;
    pm25: number | null;
    pm10: number | null;
    carbonMonoxide: number | null;
    nitrogenDioxide: number | null;
    sulphurDioxide: number | null;
    ozone: number | null;
    aqiCategory: string;
    aqiColor: string;
}

/**
 * Fetch air quality data for given coordinates.
 */
export async function fetchAQIData(lat: number, lng: number, countryName: string = ''): Promise<AQIData> {
    const start = Date.now();

    const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        current: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
        timezone: 'auto'
    });

    const url = `${BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const durationMs = Date.now() - start;

        if (!response.ok) {
            logger.apiCall('Open_Meteo_AQI', durationMs, false, { country: countryName, status: response.status });
            throw new Error(`Open-Meteo AQI API error: ${response.status}`);
        }

        const data = await response.json();
        logger.apiCall('Open_Meteo_AQI', durationMs, true, { country: countryName });

        const current = data.current || {};

        return {
            usAQI: current.us_aqi ?? null,
            pm25: current.pm2_5 ?? null,
            pm10: current.pm10 ?? null,
            carbonMonoxide: current.carbon_monoxide ?? null,
            nitrogenDioxide: current.nitrogen_dioxide ?? null,
            sulphurDioxide: current.sulphur_dioxide ?? null,
            ozone: current.ozone ?? null,
            aqiCategory: getAQICategory(current.us_aqi),
            aqiColor: getAQIColor(current.us_aqi)
        };
    } catch (error: any) {
        const durationMs = Date.now() - start;
        logger.apiCall('Open_Meteo_AQI', durationMs, false, { country: countryName, error: error.message });
        throw error;
    }
}

/**
 * Get AQI category based on US EPA scale.
 */
function getAQICategory(aqi: number | null | undefined): string {
    if (aqi === null || aqi === undefined) return 'Unknown';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

/**
 * Get display color for AQI level.
 */
function getAQIColor(aqi: number | null | undefined): string {
    if (aqi === null || aqi === undefined) return '#888';
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
}
