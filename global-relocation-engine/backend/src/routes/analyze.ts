/**
 * POST /api/analyze Route Handler
 */

import { Request, Response } from 'express';
import { fetchCountryData } from '../apis/restCountries.js';
import { fetchWeatherData } from '../apis/openMeteoWeather.js';
import { fetchAQIData } from '../apis/openMeteoAQI.js';
import { fetchExchangeRates } from '../apis/exchangeRates.js';
import { fetchHealthData } from '../apis/worldBank.js';
import { fetchWikiContext } from '../apis/wikipedia.js';
import { fetchNews } from '../apis/news.js';
import { rankCountries } from '../scoring/ranker.js';
import cache from '../cache.js';
import logger from '../logger.js';

const VALID_RISK_LEVELS = ['low', 'moderate', 'high'];
const VALID_DURATIONS = ['short-term', 'long-term'];

interface AnalyzeRequestBody {
    countries: string[];
    riskTolerance: string;
    duration: string;
}

/**
 * Validate request body.
 */
function validateInput(body: any): string[] {
    const errors: string[] = [];

    if (!body.countries || !Array.isArray(body.countries)) {
        errors.push('countries must be an array');
    } else if (body.countries.length < 1) {
        errors.push('At least 1 country is required');
    } else {
        // Check for valid strings
        const invalid = body.countries.filter((c: any) => typeof c !== 'string' || c.trim().length === 0);
        if (invalid.length > 0) {
            errors.push('All country entries must be non-empty strings');
        }
    }

    if (!body.riskTolerance || !VALID_RISK_LEVELS.includes(body.riskTolerance.toLowerCase())) {
        errors.push(`riskTolerance must be one of: ${VALID_RISK_LEVELS.join(', ')}`);
    }

    if (!body.duration || !VALID_DURATIONS.includes(body.duration.toLowerCase())) {
        errors.push(`duration must be one of: ${VALID_DURATIONS.join(', ')}`);
    }

    return errors;
}

/**
 * Fetch all data for a single country with caching and error resilience.
 */
async function fetchCountryAllData(countryName: string) {
    const cacheKey = countryName.toLowerCase().trim();
    const errors: any[] = [];
    const cacheStatus = { country: 'miss', weather: 'miss', aqi: 'miss', wb: 'miss', wiki: 'miss', news: 'miss' };

    // Fetch country profile (with cache)
    let countryData = null;
    try {
        const result = await cache.getOrFetch(`country:${cacheKey}`, () => fetchCountryData(countryName));
        countryData = result.data;
        cacheStatus.country = result.cacheStatus;
    } catch (error: any) {
        errors.push({ api: 'REST Countries', error: error.message });
        logger.partialFailure(countryName, ['REST Countries']);
    }

    // If we don't have country data (and thus no coordinates), we can't fetch weather/AQI
    if (!countryData) {
        return { country: null, weather: null, aqi: null, cacheStatus, errors };
    }

    const [lat, lng] = countryData.latlng;

    // Fetch weather, AQI, World Bank, Wikipedia, and News concurrently (with cache)
    const [weatherResult, aqiResult, wbResult, wikiResult, newsResult] = await Promise.allSettled([
        cache.getOrFetch(`weather:${cacheKey}`, () => fetchWeatherData(lat, lng, countryName)),
        cache.getOrFetch(`aqi:${cacheKey}`, () => fetchAQIData(lat, lng, countryName)),
        cache.getOrFetch(`wb:${cacheKey}`, () => fetchHealthData(countryData.cca3)),
        cache.getOrFetch(`wiki:${cacheKey}`, () => fetchWikiContext(countryName)),
        cache.getOrFetch(`news:${cacheKey}`, () => fetchNews(countryName))
    ]);

    let weatherData = null;
    if (weatherResult.status === 'fulfilled') {
        weatherData = weatherResult.value.data;
        cacheStatus.weather = weatherResult.value.cacheStatus;
    } else {
        errors.push({ api: 'Open-Meteo Weather', error: weatherResult.reason?.message || 'Unknown error' });
        logger.partialFailure(countryName, ['Open-Meteo Weather']);
    }

    let aqiData = null;
    if (aqiResult.status === 'fulfilled') {
        aqiData = aqiResult.value.data;
        cacheStatus.aqi = aqiResult.value.cacheStatus;
    } else {
        errors.push({ api: 'Open-Meteo AQI', error: aqiResult.reason?.message || 'Unknown error' });
        logger.partialFailure(countryName, ['Open-Meteo AQI']);
    }

    let wbData = null;
    if (wbResult.status === 'fulfilled') {
        wbData = wbResult.value.data;
        cacheStatus.wb = wbResult.value.cacheStatus;
    } else {
        errors.push({ api: 'World Bank Health', error: wbResult.reason?.message || 'Unknown error' });
        logger.partialFailure(countryName, ['World Bank Health']);
    }

    let wikiData = null;
    if (wikiResult.status === 'fulfilled') {
        wikiData = wikiResult.value.data;
        cacheStatus.wiki = wikiResult.value.cacheStatus;
    } else {
        errors.push({ api: 'Wikipedia Context', error: wikiResult.reason?.message || 'Unknown error' });
        logger.partialFailure(countryName, ['Wikipedia Context']);
    }

    let newsData: any[] = [];
    if (newsResult.status === 'fulfilled') {
        newsData = newsResult.value.data;
        cacheStatus.news = newsResult.value.cacheStatus;
    } else {
        errors.push({ api: 'News API', error: newsResult.reason?.message || 'Unknown error' });
        logger.partialFailure(countryName, ['News API']);
    }

    return { country: countryData, weather: weatherData, aqi: aqiData, wb: wbData, wiki: wikiData, news: newsData, cacheStatus, errors };
}

/**
 * Express route handler for POST /api/analyze
 */
export async function analyzeHandler(req: Request<{}, {}, AnalyzeRequestBody>, res: Response) {
    const startTime = Date.now();

    try {
        // Validate input
        const validationErrors = validateInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

        const { countries, riskTolerance, duration } = req.body;
        const cleanCountries = [...new Set(countries.map(c => c.trim()))]; // Remove duplicates

        logger.startCollecting();

        logger.info('ANALYZE', `Starting analysis for ${cleanCountries.length} countries`, {
            countries: cleanCountries,
            riskTolerance,
            duration
        });

        // Fetch all country data and exchange rates concurrently
        const [fetchResults, exchangeResult] = await Promise.all([
            Promise.all(cleanCountries.map(country => fetchCountryAllData(country))),
            cache.getOrFetch('exchange_rates', fetchExchangeRates).catch(err => {
                logger.error('EXCHANGE', 'Failed to fetch rates', { error: err.message });
                return null;
            })
        ]);

        // Filter out completely failed countries (no data at all)
        const validResults: any[] = [];
        const failedCountries: any[] = [];

        fetchResults.forEach((result, index) => {
            if (!result.country) {
                failedCountries.push({
                    name: cleanCountries[index],
                    reason: result.errors[0]?.error || 'Country not found'
                });
            } else {
                validResults.push(result);
            }
        });

        // If no valid results at all
        if (validResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'None of the specified countries could be found',
                failedCountries
            });
        }

        // Rank countries
        const rankingResult = rankCountries(validResults, riskTolerance.toLowerCase(), duration.toLowerCase());

        const responseTime = Date.now() - startTime;
        logger.info('ANALYZE', `Analysis completed in ${responseTime}ms`, {
            totalCountries: cleanCountries.length,
            successfulCountries: validResults.length,
            failedCountries: failedCountries.length
        });

        // Return structured response
        const activityLog = logger.stopCollecting();
        return res.json({
            success: true,
            data: rankingResult,
            failedCountries: failedCountries.length > 0 ? failedCountries : undefined,
            performance: {
                responseTimeMs: responseTime,
                cacheStats: cache.getStats()
            },
            activityLog,
            exchangeRates: exchangeResult ? (exchangeResult as any).data : null
        });
    } catch (error: any) {
        logger.error('ANALYZE', 'Unexpected error during analysis', { error: error.message });
        return res.status(500).json({
            success: false,
            error: 'Internal server error during analysis',
            details: error.message
        });
    }
}
