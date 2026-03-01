import * as math from 'mathjs';

export const calculateSharpeRatio = (returns, riskFreeRate = 0.02) => {
    if (!returns || returns.length === 0) return 0;
    const meanReturn = math.mean(returns);
    const stdDev = math.std(returns);
    if (stdDev === 0) return 0;

    // Annualized return assuming daily data (252 trading days)
    const annualReturn = meanReturn * 252;
    const annualStdDev = stdDev * Math.sqrt(252);

    return (annualReturn - riskFreeRate) / annualStdDev;
};

export const calculateBeta = (assetReturns, benchmarkReturns) => {
    if (!assetReturns || !benchmarkReturns || assetReturns.length !== benchmarkReturns.length) return 1;

    const assetMean = math.mean(assetReturns);
    const benchMean = math.mean(benchmarkReturns);

    const covariance = math.sum(
        assetReturns.map((r, i) => (r - assetMean) * (benchmarkReturns[i] - benchMean))
    ) / (assetReturns.length - 1);

    const variance = math.variance(benchmarkReturns);
    if (variance === 0) return 1;
    return covariance / variance;
};

