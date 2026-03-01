import * as math from 'mathjs';

// Standard Normal variate using Box-Muller transform
export const randn_bm = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const runMonteCarlo = (initialValue, returns, numSimulations = 1000, days = 252) => {
    const meanReturn = returns.length > 0 ? math.mean(returns) : 0.0002;
    const stdDev = returns.length > 0 ? math.std(returns) : 0.015;

    const endValues = [];
    const representativePaths = []; // Save a few paths for UI drawing

    for (let i = 0; i < numSimulations; i++) {
        let currentValue = initialValue;
        const currentPath = [initialValue];

        for (let day = 0; day < days; day++) {
            // GBM: S_{t+1} = S_t * exp((mu - sigma^2/2)*dt + sigma * sqrt(dt) * Z)
            // Simplified approximation for daily steps:
            const dailyShock = meanReturn - (stdDev * stdDev) / 2 + stdDev * randn_bm();
            currentValue = currentValue * Math.exp(dailyShock);

            if (i < 5) currentPath.push(currentValue); // Save first 5 paths
        }
        endValues.push(currentValue);
        if (i < 5) representativePaths.push(currentPath);
    }

    endValues.sort((a, b) => a - b);

    // Create density histogram for distribution chart
    const minVal = endValues[0];
    const maxVal = endValues[endValues.length - 1];
    const buckets = 30;
    const step = (maxVal - minVal) / buckets;
    const histogram = Array(buckets).fill(0);

    endValues.forEach(val => {
        let bucketIndex = Math.floor((val - minVal) / step);
        if (bucketIndex === buckets) bucketIndex--;
        histogram[bucketIndex]++;
    });

    const distribution = histogram.map((count, i) => ({
        value: Math.round(minVal + i * step),
        count
    }));

    return {
        expectedValue: math.mean(endValues),
        worstCase5: endValues[Math.floor(0.05 * endValues.length)],
        worstCase1: endValues[Math.floor(0.01 * endValues.length)],
        bestCase95: endValues[Math.floor(0.95 * endValues.length)],
        representativePaths,
        distribution
    };
};

