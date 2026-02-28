import { AnalysisRequest } from '../types';

export class RequestValidator {
  public validate(req: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!req.countries || !Array.isArray(req.countries)) {
      errors.push('countries must be an array');
    } else if (req.countries.length < 3) {
      errors.push('minimum 3 countries required');
    }

    if (!['Low', 'Moderate', 'High'].includes(req.riskTolerance)) {
      errors.push('riskTolerance must be Low, Moderate, or High');
    }

    if (!['Short-term', 'Long-term'].includes(req.duration)) {
      errors.push('duration must be Short-term or Long-term');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
