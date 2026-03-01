/**
 * Dynamic Weighting Logic
 *
 * Risk tolerance and travel duration affect scoring weights programmatically.
 * Weights are NOT static — they are computed based on user constraints.
 */

export type RiskTolerance = 'low' | 'moderate' | 'high';
export type TravelDuration = 'short-term' | 'long-term';

export interface ScoringWeights {
    travelRisk: number;
    healthInfra: number;
    envStability: number;
}

/**
 * Dynamic Penalty Weights
 *
 * Risk Tolerance Impact:
 * - Low: AQI penalty = 0.4, Advisory = 0.4, Temp = 0.2
 * - Moderate: AQI penalty = 0.3, Advisory = 0.3, Temp = 0.4
 * - High: AQI penalty = 0.2, Advisory = 0.2, Temp = 0.6
 *
 * Duration Impact:
 * - Short-term: Environment = 0.5, Health = 0.2, Risk = 0.3
 * - Long-term: Health = 0.5, Environment = 0.3, Risk = 0.2
 */
export function getWeights(riskTolerance: string | undefined, duration: string | undefined): ScoringWeights {
    const risk = (riskTolerance || 'moderate').toLowerCase() as RiskTolerance;
    const dur = (duration || 'short-term').toLowerCase() as TravelDuration;

    // Base weights by risk tolerance
    let travelRiskBase: number, healthInfraBase: number, envStabilityBase: number;

    switch (risk) {
        case 'low':
            travelRiskBase = 0.40;
            healthInfraBase = 0.25;
            envStabilityBase = 0.35;
            break;
        case 'high':
            travelRiskBase = 0.18;
            healthInfraBase = 0.35;
            envStabilityBase = 0.47;
            break;
        case 'moderate':
        default:
            travelRiskBase = 0.30;
            healthInfraBase = 0.30;
            envStabilityBase = 0.40;
            break;
    }

    // Duration adjustments
    if (dur === 'long-term') {
        // Long-term: shift weight toward health infrastructure
        travelRiskBase -= 0.10;
        healthInfraBase += 0.15;
        envStabilityBase -= 0.05;
    } else {
        // Short-term: shift weight toward environmental conditions
        travelRiskBase += 0.05;
        healthInfraBase -= 0.10;
        envStabilityBase += 0.05;
    }

    // Clamp to ensure no negative weights
    travelRiskBase = Math.max(0.05, travelRiskBase);
    healthInfraBase = Math.max(0.05, healthInfraBase);
    envStabilityBase = Math.max(0.05, envStabilityBase);

    // Re-normalize to sum to 1.0
    const total = travelRiskBase + healthInfraBase + envStabilityBase;

    return {
        travelRisk: Math.round((travelRiskBase / total) * 1000) / 1000,
        healthInfra: Math.round((healthInfraBase / total) * 1000) / 1000,
        envStability: Math.round((envStabilityBase / total) * 1000) / 1000
    };
}
