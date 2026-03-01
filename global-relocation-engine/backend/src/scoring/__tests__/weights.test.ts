import { describe, it, expect } from 'vitest';
import { getWeights } from '../weights.js';

describe('Dynamic Penalty Weights', () => {

    it('assigns base weights based on risk tolerance', () => {
        const lowRiskWeights = getWeights('low', 'short-term');
        const highRiskWeights = getWeights('high', 'short-term');

        // Low risk tolerance means the user cares MORE about avoiding travel risk
        // Therefore, travelRisk penalty weight should be higher.
        expect(lowRiskWeights.travelRisk).toBeGreaterThan(highRiskWeights.travelRisk);
        
        // High risk tolerance means the user cares MORE about raw environmental stability or health
        expect(highRiskWeights.envStability).toBeGreaterThan(lowRiskWeights.envStability);
    });

    it('adjusts weights based on travel duration', () => {
        const shortTerm = getWeights('moderate', 'short-term');
        const longTerm = getWeights('moderate', 'long-term');

        // Long-term stays should prioritize Health Infrastructure over short-term stays
        expect(longTerm.healthInfra).toBeGreaterThan(shortTerm.healthInfra);

        // Short-term stays heavily penalize immediate travel risks relatively more
        expect(shortTerm.travelRisk).toBeGreaterThan(longTerm.travelRisk);
    });

    it('always normalizes to sum to 1.0', () => {
        const testCases = [
            { risk: 'low', dur: 'short-term' },
            { risk: 'high', dur: 'long-term' },
            { risk: 'moderate', dur: 'short-term' },
            { risk: 'unknown', dur: 'unknown' }, // Should fallback gracefully
        ];

        for (const tc of testCases) {
            const weights = getWeights(tc.risk, tc.dur);
            const sum = weights.travelRisk + weights.healthInfra + weights.envStability;
            
            // Floating point precision, so check if it's extremely close to 1
            expect(sum).toBeCloseTo(1, 2);
        }
    });

});
