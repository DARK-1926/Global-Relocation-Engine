import axios from 'axios';
import { CountryData } from '../types';
import { CacheManager } from './CacheManager';
import { ObservabilityLogger } from './ObservabilityLogger';

export class APIAggregator {
  private cache: CacheManager;
  private logger?: ObservabilityLogger;

  constructor(cache: CacheManager, logger?: ObservabilityLogger) {
    this.cache = cache;
    this.logger = logger;
  }

  public async fetchCountryData(countryCode: string): Promise<{ data: CountryData | null; failures: string[] }> {
    const cacheKey = `country:${countryCode}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { data: cached, failures: [] };
    }

    const failures: string[] = [];
    let countryData: Partial<CountryData> = { countryCode };

    try {
      // 1. Fetch REST Countries
      const rcRes = await this.fetchWithTimeout(`REST_Countries`, `https://restcountries.com/v3.1/alpha/${countryCode}`);
      if (rcRes) {
        countryData.name = rcRes[0]?.name?.common || countryCode;
        countryData.capital = rcRes[0]?.capital?.[0];
        countryData.population = rcRes[0]?.population;
        // Mocking advisory for simplicity. There is no standard free advisory API without a token.
        countryData.advisoryLevel = Math.floor(Math.random() * 5); // 0 to 4
      }
    } catch (e: any) {
      failures.push('REST_Countries');
      this.logger?.logFailure('REST_Countries', e.message, countryCode);
    }

    // Parallel fetch the rest
    const promises = [];

    // WB Life Expectancy
    promises.push((async () => {
      try {
        const res = await this.fetchWithTimeout(`WB_LifeExp`, `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.DYN.LE00.IN?format=json&mrnev=1`);
        if (res && res[1] && res[1][0]) {
          countryData.lifeExpectancy = res[1][0].value;
        }
      } catch (e: any) {
        failures.push('WB_LifeExp');
        this.logger?.logFailure('WB_LifeExp', e.message, countryCode);
      }
    })());

    // WB Healthcare Expenditure
    promises.push((async () => {
      try {
        const res = await this.fetchWithTimeout(`WB_HealthExp`, `https://api.worldbank.org/v2/country/${countryCode}/indicator/SH.XPD.CHEX.GD.ZS?format=json&mrnev=1`);
        if (res && res[1] && res[1][0]) {
          countryData.healthcareExpenditure = res[1][0].value;
        }
      } catch (e: any) {
        failures.push('WB_HealthExp');
        this.logger?.logFailure('WB_HealthExp', e.message, countryCode);
      }
    })());

    // Wait for parallel WB requests
    await Promise.all(promises);

    const weatherPromises = [];
    if (countryData.capital) {
      weatherPromises.push((async () => {
        try {
          const key = process.env.OPENWEATHER_API_KEY;
          if (!key) throw new Error("Missing OPENWEATHER_API_KEY");
          const res = await this.fetchWithTimeout(`OpenWeather`, `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(countryData.capital!)}&appid=${key}&units=metric`);
          if (res && res.main) {
            countryData.temperature = res.main.temp;
          }
        } catch (e: any) {
          failures.push('OpenWeather');
          this.logger?.logFailure('OpenWeather', e.message, countryCode);
        }
      })());

      weatherPromises.push((async () => {
        try {
          const key = process.env.WAQI_TOKEN;
          if (!key) throw new Error("Missing WAQI_TOKEN");
          const res = await this.fetchWithTimeout(`WAQI`, `https://api.waqi.info/feed/${encodeURIComponent(countryData.capital!)}/?token=${key}`);
          if (res && res.status === 'ok' && res.data) {
            countryData.aqi = res.data.aqi;
          }
        } catch (e: any) {
          failures.push('WAQI');
          this.logger?.logFailure('WAQI', e.message, countryCode);
        }
      })());
    }

    await Promise.all(weatherPromises);

    const finalData = countryData as CountryData;
    if (finalData.name) {
      this.cache.set(cacheKey, finalData);
    }

    return { data: finalData.name ? finalData : null, failures };
  }

  private async fetchWithTimeout(apiName: string, url: string, timeoutMs: number = 5000): Promise<any> {
    const startTime = Date.now();
    try {
      const response = await axios.get(url, { timeout: timeoutMs });
      this.logger?.logAPICall(apiName, Date.now() - startTime, response.status);
      return response.data;
    } catch (error: any) {
      this.logger?.logAPICall(apiName, Date.now() - startTime, error.response?.status || 500);
      throw error;
    }
  }
}
