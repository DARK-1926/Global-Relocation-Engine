/**
 * Wikipedia API handler
 * Fetches short cultural/historical context for a country.
 */

import axios from 'axios';
import logger from '../logger.js';

export interface WikiContextData {
    extract: string | null;
    url: string | null;
}

/**
 * Fetch a short introductory summary for a country from Wikipedia.
 */
export async function fetchWikiContext(countryName: string): Promise<WikiContextData> {
    const defaultData: WikiContextData = { extract: null, url: null };
    
    if (!countryName) return defaultData;

    try {
        // We use the REST API which is generally faster and cleaner for simple extracts
        const encodedName = encodeURIComponent(countryName.replace(/ /g, '_'));
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;

        const res = await axios.get(url, {
            timeout: 3000,
            headers: { 'User-Agent': 'GlobalRelocationEngine/1.0 (Integration/Hackathon)' }
        });

        if (res.data && res.data.extract) {
            // Cut down to the first two sentences for brevity in the UI
            const extract = res.data.extract.split('. ').slice(0, 2).join('. ') + '.';
            return {
                extract,
                url: res.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedName}`
            };
        }

        return defaultData;
    } catch (error: any) {
        // It's very common for country names to have disambiguation or slightly 
        // different wiki slugs (e.g., "Georgia (country)"). We fail silently.
        logger.warn('API_CALL', `Wikipedia API unresolvable for ${countryName}`, { error: error.message });
        return defaultData;
    }
}
