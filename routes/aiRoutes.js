import express from 'express';
import { generateRecommendation } from '../aiEngine/recommendationEngine.js';
import { fetchHistoricalData } from '../services/stockService.js';

const router = express.Router();

router.post('/recommend', async (req, res) => {
    try {
        const { budget = 10000, horizon = 5, sector = 'tech', riskTolerance = 'moderate' } = req.body;

        const recommendation = await generateRecommendation(
            Number(budget),
            Number(horizon),
            sector,
            riskTolerance
        );

        res.json({
            success: true,
            data: recommendation
        });
    } catch (e) {
        console.error("AI Recommendation Error:", e);
        res.status(500).json({ success: false, message: "Error generating portfolio recommendations." });
    }
});

router.get('/stocks/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const data = await fetchHistoricalData(symbol);

        res.json({
            success: true,
            data
        });
    } catch (e) {
        console.error("Stock Fetch Error:", e);
        res.status(500).json({ success: false, message: `Error fetching data for ${req.params.symbol}` });
    }
});

export default router;
