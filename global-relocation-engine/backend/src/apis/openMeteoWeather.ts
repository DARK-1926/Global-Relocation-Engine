/**
 * Open-Meteo Weather API Integration
 * Fetches current weather data for a capital city using lat/lng.
 * API: https://api.open-meteo.com/v1/forecast
 * No API key required.
 */

import logger from '../logger.js';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
    temperature: number | null;
    apparentTemperature: number | null;
    humidity: number | null;
    weatherCode: number | null;
    windSpeed: number | null;
    windGusts: number | null;
    pressure: number | null;
    temperatureRange: number;
    dailyMaxTemps: number[];
    dailyMinTemps: number[];
    dailyWeatherCodes: number[];
    weatherDescription: string;
}

/**
 * Fetch current weather data for given coordinates.
 */
export async function fetchWeatherData(lat: number, lng: number, countryName: string = ''): Promise<WeatherData> {
    const start = Date.now();

    const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,pressure_msl',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        timezone: 'auto',
        forecast_days: '3'
    });

    const url = `${BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const durationMs = Date.now() - start;

        if (!response.ok) {
            logger.apiCall('Open_Meteo_Weather', durationMs, false, { country: countryName, status: response.status });
            throw new Error(`Open-Meteo Weather API error: ${response.status}`);
        }

        const data = await response.json();
        logger.apiCall('Open_Meteo_Weather', durationMs, true, { country: countryName });

        const current = data.current || {};
        const daily = data.daily || {};

        // Calculate temperature range from daily data
        const tempMax: number[] = daily.temperature_2m_max || [];
        const tempMin: number[] = daily.temperature_2m_min || [];
        const tempRange = tempMax.length > 0 && tempMin.length > 0
            ? Math.max(...tempMax) - Math.min(...tempMin)
            : 0;

        return {
            temperature: current.temperature_2m ?? null,
            apparentTemperature: current.apparent_temperature ?? null,
            humidity: current.relative_humidity_2m ?? null,
            weatherCode: current.weather_code ?? null,
            windSpeed: current.wind_speed_10m ?? null,
            windGusts: current.wind_gusts_10m ?? null,
            pressure: current.pressure_msl ?? null,
            temperatureRange: tempRange,
            dailyMaxTemps: tempMax,
            dailyMinTemps: tempMin,
            dailyWeatherCodes: daily.weather_code || [],
            weatherDescription: getWeatherDescription(current.weather_code)
        };
    } catch (error: any) {
        const durationMs = Date.now() - start;
        logger.apiCall('Open_Meteo_Weather', durationMs, false, { country: countryName, error: error.message });

        // Fallback to OpenWeatherMap config if available
        if (process.env.OPENWEATHER_API_KEY) {
            try {
                const owStart = Date.now();
                const owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
                const owRes = await fetch(owUrl);
                const owData = await owRes.json();

                if (owRes.ok) {
                    logger.apiCall('OpenWeather_Fallback', Date.now() - owStart, true, { country: countryName });
                    return {
                        temperature: owData.main?.temp ?? null,
                        apparentTemperature: owData.main?.feels_like ?? null,
                        humidity: owData.main?.humidity ?? null,
                        weatherCode: null,
                        windSpeed: owData.wind?.speed ? owData.wind.speed * 3.6 : null, // Convert m/s to km/h
                        windGusts: null,
                        pressure: owData.main?.pressure ?? null,
                        temperatureRange: 0,
                        dailyMaxTemps: [],
                        dailyMinTemps: [],
                        dailyWeatherCodes: [],
                        weatherDescription: owData.weather?.[0]?.description ?? 'Unknown'
                    };
                }
            } catch (fallbackError: any) {
                logger.apiCall('OpenWeather_Fallback', 0, false, { error: fallbackError.message });
            }
        }

        throw error;
    }
}

/**
 * Convert WMO weather code to human-readable description.
 */
function getWeatherDescription(code: number | null): string {
    if (code === null) return 'Unknown';
    const descriptions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Freezing light drizzle', 57: 'Freezing dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Freezing light rain', 67: 'Freezing heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}
