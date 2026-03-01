/**
 * News API handler
 * Fetches latest news for a country via Google News RSS to bypass API keys.
 */

import axios from 'axios';
import xml2js from 'xml2js';
import logger from '../logger.js';

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

/**
 * Fetch top 3 latest news headlines for a country using Google News RSS.
 */
export async function fetchNews(countryName: string): Promise<NewsItem[]> {
    if (!countryName) return [];

    try {
        const query = encodeURIComponent(`"${countryName}"`);
        const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

        const res = await axios.get(url, {
            timeout: 4000,
            headers: { 'User-Agent': 'GlobalRelocationEngine/1.0' }
        });

        // Parse XML to JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(res.data);

        const items = result?.rss?.channel?.item;
        if (!items) return [];

        // Ensure items is an array
        const itemsArray = Array.isArray(items) ? items : [items];

        return itemsArray.slice(0, 3).map((item: any) => ({
            title: item.title || 'Untitled',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            source: item.source?._ || item.source || 'Google News'
        }));
    } catch (error: any) {
        logger.warn('API_CALL', `News API error for ${countryName}`, { error: error.message });
        return [];
    }
}
