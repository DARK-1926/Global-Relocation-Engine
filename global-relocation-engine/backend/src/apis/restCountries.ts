/**
 * REST Countries API Integration (v3.1)
 * Fetches country profile data: capital, population, currency, latlng, flag, region, etc.
 * API: https://restcountries.com/v3.1/name/{country}
 * No API key required.
 */

import logger from '../logger.js';

const BASE_URL = 'https://restcountries.com/v3.1/name';

export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
}

export interface CountryProfile {
    name: string;
    officialName: string;
    capital: string;
    population: number;
    area: number;
    region: string;
    subregion: string;
    currencies: CurrencyInfo[];
    languages: string[];
    latlng: [number, number];
    flag: string;
    flagEmoji: string;
    gini: number | null;
    timezones: string[];
    cca2: string;
    cca3: string;
}

export interface CompactCountry {
    name: string;
    cca2: string;
    cca3: string;
    flag: string;
}

/**
 * Fetch country profile data from REST Countries API.
 */
export async function fetchCountryData(countryName: string): Promise<CountryProfile> {
    const start = Date.now();
    const url = `${BASE_URL}/${encodeURIComponent(countryName)}?fullText=false`;

    try {
        const response = await fetch(url);
        const durationMs = Date.now() - start;

        if (!response.ok) {
            logger.apiCall('REST_Countries', durationMs, false, { country: countryName, status: response.status });
            if (response.status === 404) {
                throw new Error(`Country not found: ${countryName}`);
            }
            throw new Error(`REST Countries API error: ${response.status}`);
        }

        const data = await response.json();
        logger.apiCall('REST_Countries', durationMs, true, { country: countryName });

        // Take the best match (first result)
        let country = data[0];
        
        // Exact match override to prevent minor islands from overtaking the main USA
        if (countryName.toLowerCase() === 'united states' || countryName.toLowerCase() === 'usa' || countryName.toLowerCase() === 'us') {
            const usaMatch = data.find((c: any) => c.cca3 === 'USA');
            if (usaMatch) country = usaMatch;
        }

        // Extract currencies
        const currencies = country.currencies
            ? Object.entries(country.currencies).map(([code, anyInfo]: [string, any]) => ({
                code,
                name: anyInfo.name,
                symbol: anyInfo.symbol
            }))
            : [];

        // Extract life expectancy-related data (use GDP indicators if available)
        return {
            name: country.name?.common || countryName,
            officialName: country.name?.official || '',
            capital: country.capital?.[0] || 'Unknown',
            population: country.population || 0,
            area: country.area || 0,
            region: country.region || 'Unknown',
            subregion: country.subregion || 'Unknown',
            currencies,
            languages: country.languages ? Object.values(country.languages) as string[] : [],
            latlng: country.capitalInfo?.latlng || country.latlng || [0, 0],
            flag: country.flags?.svg || country.flags?.png || '',
            flagEmoji: country.flag || '',
            gini: country.gini ? (Object.values(country.gini)[0] as number) : null,
            timezones: country.timezones || [],
            cca2: country.cca2 || '',
            cca3: country.cca3 || ''
        };
    } catch (error: any) {
        const durationMs = Date.now() - start;
        logger.apiCall('REST_Countries', durationMs, false, { country: countryName, error: error.message });
        throw error;
    }
}

/**
 * Fetch all countries for autocomplete.
 */
export async function fetchAllCountries(): Promise<CompactCountry[]> {
    const start = Date.now();
    const url = `https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag`;

    try {
        const response = await fetch(url);
        const durationMs = Date.now() - start;

        if (!response.ok) {
            throw new Error(`REST Countries All API error: ${response.status}`);
        }

        const data = await response.json();
        logger.apiCall('REST_Countries_All', durationMs, true);

        return data.map((c: any) => ({
            name: c.name.common,
            cca2: c.cca2,
            cca3: c.cca3,
            flag: c.flag
        })).sort((a: CompactCountry, b: CompactCountry) => a.name.localeCompare(b.name));
    } catch (error: any) {
        const durationMs = Date.now() - start;
        logger.apiCall('REST_Countries_All', durationMs, false, { error: error.message });
        throw error;
    }
}
