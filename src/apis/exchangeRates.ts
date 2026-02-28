/**
 * Open Exchange Rates API Integration
 *
 * Fetches latest exchange rates from open.er-api.com.
 * Used to provide financial context (currency strength vs USD).
 */

import logger from '../logger.js';

const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRates {
    base: string;
    rates: Record<string, number>;
    lastUpdate: string;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    const startTime = Date.now();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Exchange Rate API failed: ${response.statusText}`);
        }
        const data = await response.json();
        const duration = Date.now() - startTime;

        logger.apiCall('Exchange Rates', duration, true);

        return {
            base: data.base_code,
            rates: data.rates,
            lastUpdate: data.time_last_update_utc
        };
    } catch (error: any) {
        const duration = Date.now() - startTime;
        logger.apiCall('Exchange Rates', duration, false, { error: error.message });
        throw error;
    }
}
