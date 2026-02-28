/**
 * NormalizationEngine normalizes raw metric values to a 0-100 scale.
 */
export class NormalizationEngine {
    /**
     * Normalizes a value using min-max normalization: ((value - min) / (max - min)) * 100
     * Clamps the result to [0, 100].
     */
    public normalize(value: number | null | undefined, min: number, max: number, inverted: boolean = false): number {
      if (value === null || value === undefined) {
        return 50; // Neutral default if missing? Or missing values shouldn't be scored. We'll return 0 if we assume worst or 50. Let's return null to handle gracefully.
      }
      
      let norm = ((value - min) / (max - min)) * 100;
      
      if (inverted) {
        norm = 100 - norm;
      }
      
      return this.clamp(norm);
    }
  
    /**
     * Special normalizers for each metric type.
     */
    public normalizeTemperature(value: number | null | undefined): number {
      // Best temp is around 22C. Let's score distance from 22C.
      if (value === null || value === undefined) return 50;
      const deviation = Math.abs(value - 22);
      // If deviation is 0, score is 100. If deviation is 30, score is 0.
      let norm = 100 - (deviation / 30) * 100;
      return this.clamp(norm);
    }
  
    public normalizeAQI(value: number | null | undefined): number {
      // AQI < 50 is good (100 score). AQI > 300 is hazardous (0 score).
      // min is 0, max is 300. Inverted.
      return this.normalize(value, 0, 300, true);
    }
  
    public normalizeAdvisory(value: number | null | undefined): number {
      // Advisory levels usually 0-4 where 4 is worst.
      return this.normalize(value, 0, 4, true);
    }
  
    public normalizeLifeExpectancy(value: number | null | undefined): number {
      // min 50, max 85
      return this.normalize(value, 50, 85, false);
    }
  
    public normalizeHealthcare(value: number | null | undefined): number {
      // Expenditure % GDP: min 0, max 20
      return this.normalize(value, 0, 20, false);
    }
  
    private clamp(value: number): number {
      return Math.max(0, Math.min(100, value));
    }
  }
  
