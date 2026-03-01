/**
 * World Bank API handler
 * Fetches healthcare data to replace static regional proxies.
 */

import axios from 'axios';
import logger from '../logger.js';

export interface WorldBankHealthData {
    lifeExpectancy: number | null;
    healthcareExpenditure: number | null;
}

/**
 * Fetch Life Expectancy (SP.DYN.LE00.IN) and Healthcare Expenditure % of GDP (SH.XPD.CHEX.GD.ZS)
 * for a given ISO Alpha-3 country code.
 */
export async function fetchHealthData(countryCode: string): Promise<WorldBankHealthData> {
    const defaultData: WorldBankHealthData = {
        lifeExpectancy: null,
        healthcareExpenditure: null
    };

    if (!countryCode) return defaultData;

    try {
        // World Bank uses ISO Alpha-3, but some endpoints handle it flexibly.
        const code = countryCode.toUpperCase();
        
        // Fetch Life Expectancy
        const lifeExpUrl = `https://api.worldbank.org/v2/country/${code}/indicator/SP.DYN.LE00.IN?format=json&mrnev=1`;
        
        // Fetch Healthcare Expenditure (% of GDP)
        const healthExpUrl = `https://api.worldbank.org/v2/country/${code}/indicator/SH.XPD.CHEX.GD.ZS?format=json&mrnev=1`;

        const [lifeExpRes, healthExpRes] = await Promise.allSettled([
            axios.get(lifeExpUrl, { timeout: 4000 }),
            axios.get(healthExpUrl, { timeout: 4000 })
        ]);

        let lifeExpectancy: number | null = null;
        let healthcareExpenditure: number | null = null;

        if (lifeExpRes.status === 'fulfilled' && lifeExpRes.value.data && Array.isArray(lifeExpRes.value.data) && lifeExpRes.value.data[1]) {
            const records = lifeExpRes.value.data[1];
            if (records.length > 0 && records[0].value !== null) {
                lifeExpectancy = records[0].value;
            }
        }

        if (healthExpRes.status === 'fulfilled' && healthExpRes.value.data && Array.isArray(healthExpRes.value.data) && healthExpRes.value.data[1]) {
            const records = healthExpRes.value.data[1];
            if (records.length > 0 && records[0].value !== null) {
                healthcareExpenditure = records[0].value;
            }
        }

        return { lifeExpectancy, healthcareExpenditure };
    } catch (error: any) {
        logger.error('API_CALL', `WorldBank API error for ${countryCode}`, { error: error.message });
        return defaultData;
    }
}
