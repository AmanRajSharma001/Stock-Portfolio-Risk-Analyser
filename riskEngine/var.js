import * as math from 'mathjs';

export const calculateHistoricalVaR = (returns, confidence = 0.95) => {
    if (!returns || returns.length === 0) return 0;
    // Sort returns ascending (worst losses first)
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    return sorted[index]; // Value will be negative representing a loss
};

export const calculateParametricVaR = (returns, confidence = 0.95) => {
    if (!returns || returns.length === 0) return 0;
    const mean = math.mean(returns);
    const std = math.std(returns);

    // Z-score for 95% is 1.645, for 99% is 2.33
    const zScore = confidence === 0.99 ? 2.33 : 1.645;
    return mean - (zScore * std);
};

