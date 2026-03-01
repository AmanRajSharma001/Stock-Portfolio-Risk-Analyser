import express from 'express';
import multer from 'multer';
import { calculatePortfolioHistory } from '../riskEngine/returns.js';
import { calculateHistoricalVaR, calculateParametricVaR } from '../riskEngine/var.js';
import { calculateSharpeRatio, calculateBeta } from '../riskEngine/metrics.js';
import { generateCorrelationMatrix } from '../riskEngine/correlation.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Mock function to generate 1 year of daily prices for an asset
// Starts at 100, injects random walk with a bit of drift
const generateMockPrices = (ticker) => {
    let price = 100;
    const prices = [price];
    const mu = 0.0004; // S&P 500 drift approx 10% annual, daily = 0.0004
    const sigma = 0.015; // Volatility 15% annual, daily = 0.009 -> 0.015 for individual stocks

    for (let i = 0; i < 252; i++) {
        // Simple normal approx (Irwin-Hall)
        let rand = 0;
        for (let j = 0; j < 6; j++) rand += Math.random();
        rand = (rand - 3) / 3;

        price = price * (1 + mu + sigma * Math.sqrt(1) * rand);
        prices.push(price);
    }
    return prices;
};

// CSV Template Downloader
router.get('/template', (req, res) => {
    const csvContent = "Symbol,Quantity,BuyPrice\nAAPL,10,150.50\nMSFT,5,300.25\nGOOGL,2,2500.00\nTSLA,4,200.00\nAMZN,15,130.00";
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio_template.csv"');
    res.status(200).send(csvContent);
});

router.post('/analyze', upload.single('file'), (req, res) => {
    try {
        // MOCK CSV PARSING FOR MVP:
        // Normally we'd use 'csv-parser' on req.file.buffer here.
        // Let's assume the CSV parsed successfully and gave us:
        const assets = ["AAPL", "MSFT", "GOOG"];
        const weights = [0.4, 0.4, 0.2];

        const pricesMatrix = [];
        const rawPrices = assets.map(a => generateMockPrices(a));

        const now = new Date();
        for (let i = 0; i <= 252; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (252 - i)); // Backdate 252 trading days (~1 year)
            pricesMatrix.push({
                date: date.toISOString().split('T')[0],
                assets: [rawPrices[0][i], rawPrices[1][i], rawPrices[2][i]]
            });
        }

        // 1. Calculate historical portfolio performance
        const { portfolioValues, dailyPortfolioReturns } = calculatePortfolioHistory(weights, pricesMatrix);

        // 2. Value at Risk
        const var95 = calculateHistoricalVaR(dailyPortfolioReturns, 0.95);
        const pvar95 = calculateParametricVaR(dailyPortfolioReturns, 0.95);

        // 3. Sharpe Ratio
        const sharpe = calculateSharpeRatio(dailyPortfolioReturns);

        // 4. Beta calculation (requires Mock benchmark)
        const spyPrices = generateMockPrices("SPY");
        const spyReturns = [];
        for (let i = 1; i < spyPrices.length; i++) spyReturns.push((spyPrices[i] - spyPrices[i - 1]) / spyPrices[i - 1]);
        const beta = calculateBeta(dailyPortfolioReturns, spyReturns);

        // 5. Asset daily returns for correlation
        const assetReturnsArray = rawPrices.map(prices => {
            const ret = [];
            for (let i = 1; i < prices.length; i++) ret.push((prices[i] - prices[i - 1]) / prices[i - 1]);
            return ret;
        });

        // 6. Correlation Matrix
        const correlationMatrix = generateCorrelationMatrix(assetReturnsArray, assets);

        res.json({
            success: true,
            data: {
                portfolioValues,
                metrics: {
                    var95,
                    pvar95,
                    sharpe,
                    beta
                },
                correlationMatrix,
                assets,
                weights,
                dailyPortfolioReturns // Returning this so Monte Carlo can use real historical Vol if requested
            }
        });
    } catch (e) {
        console.error("Analysis Error:", e);
        res.status(500).json({ success: false, message: "Error analyzing portfolio." });
    }
});

export default router;
