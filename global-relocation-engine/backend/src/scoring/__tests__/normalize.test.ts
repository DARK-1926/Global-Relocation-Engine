import { describe, it, expect } from 'vitest';
import { 
    minMaxNormalize, 
    normalizeTemperature, 
    normalizeAQI, 
    normalizeLifeExpectancy 
} from '../normalize.js';

describe('Normalization Algorithms', () => {

    describe('minMaxNormalize()', () => {
        it('normalizes correctly (standard)', () => {
            // standard 0 to 100, value 50 should be 50
            expect(minMaxNormalize(50, 0, 100)).toBe(50);
            
            // 50 in a range of 0 to 200 should be 25
            expect(minMaxNormalize(50, 0, 200)).toBe(25);
        });

        it('clamps correctly below minimum', () => {
            // -10 in a range of 0 to 100 should be 0
            expect(minMaxNormalize(-10, 0, 100)).toBe(0);
        });

        it('clamps correctly above maximum', () => {
            // 150 in a range of 0 to 100 should be 100
            expect(minMaxNormalize(150, 0, 100)).toBe(100);
        });

        it('inverts correctly', () => {
            // 75 in normal 0-100 is 75. Inverted, it should be 25
            expect(minMaxNormalize(75, 0, 100, true)).toBe(25);
        });
        
        it('handles null/undefined gracefully', () => {
            expect(minMaxNormalize(null, 0, 100)).toBeNull();
            expect(minMaxNormalize(undefined, 0, 100)).toBeNull();
        });
    });

    describe('Environment Normalizers', () => {
        it('Temperature (comfort center 22.5)', () => {
            expect(normalizeTemperature(22.5)).toBe(100); // Perfect
            expect(normalizeTemperature(62.5)).toBe(0);   // Too hot (+40)
            expect(normalizeTemperature(-17.5)).toBe(0);  // Too cold (-40)
            expect(normalizeTemperature(42.5)).toBe(50);  // (+20) degree dev
        });

        it('AQI (0-500, inverted)', () => {
            expect(normalizeAQI(0)).toBe(100);    // Perfect air
            expect(normalizeAQI(500)).toBe(0);    // Hazardous
            expect(normalizeAQI(250)).toBe(50);   // Middle
            expect(normalizeAQI(-10)).toBe(100);  // Clamping below 0
            expect(normalizeAQI(1000)).toBe(0);   // Clamping above max
        });
    });

    describe('Health Normalizers', () => {
        it('Life Expectancy (50-85)', () => {
            expect(normalizeLifeExpectancy(85)).toBe(100); 
            expect(normalizeLifeExpectancy(50)).toBe(0);
            expect(normalizeLifeExpectancy(67.5)).toBe(50);
            
            // Should clamp
            expect(normalizeLifeExpectancy(90)).toBe(100);
            expect(normalizeLifeExpectancy(40)).toBe(0);
        });
    });
});
