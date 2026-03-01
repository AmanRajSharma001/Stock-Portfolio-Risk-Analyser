export const calculateDailyReturns = (prices) => {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        // Log return: ln(P_t / P_{t-1}) or simple return
        // We use simple returns here
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
};

export const calculatePortfolioReturn = (weights, assetReturns) => {
    // Both weights and assetReturns (for a specific period) should be arrays of equal length
    return weights.reduce((acc, weight, i) => acc + (weight * (assetReturns[i] || 0)), 0);
};

// Calculates portfolio history given historical prices and constant weights
export const calculatePortfolioHistory = (weights, pricesMatrix) => {
    // pricesMatrix: array of objects { date, assets: [price1, price2, ...]}
    const portfolioValues = [];
    // Assuming initial value is 10000 or relative 1
    let currentValue = 100;

    // We need daily returns matrix
    const dailyPortfolioReturns = [];

    for (let i = 1; i < pricesMatrix.length; i++) {
        let periodReturn = 0;
        for (let j = 0; j < weights.length; j++) {
            const prevPrice = pricesMatrix[i - 1].assets[j];
            const currentPrice = pricesMatrix[i].assets[j];
            if (prevPrice && currentPrice) {
                const r = (currentPrice - prevPrice) / prevPrice;
                periodReturn += r * weights[j];
            }
        }
        dailyPortfolioReturns.push(periodReturn);
        currentValue = currentValue * (1 + periodReturn);
        portfolioValues.push({ date: pricesMatrix[i].date, value: currentValue, return: periodReturn });
    }

    return { portfolioValues, dailyPortfolioReturns };
};

