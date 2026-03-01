import express from 'express';
import { runMonteCarlo } from '../riskEngine/monteCarlo.js';

const router = express.Router();

router.post('/monte-carlo', (req, res) => {
    try {
        const { initialValue = 10000, returns = [], numSimulations = 1000 } = req.body;

        // The engine defaults to basic drift if empty returns mapped, or maps real drift
        const simulationData = runMonteCarlo(initialValue, returns, numSimulations);

        res.json({
            success: true,
            data: simulationData
        });
    } catch (e) {
        console.error("Monte Carlo Error:", e);
        res.status(500).json({ success: false, message: "Error running simulation engine." });
    }
});

// Scenario Engine
router.post('/scenario', (req, res) => {
    try {
        const { dropPercentage, currentValue = 10000 } = req.body;

        // Dummy basic logic:
        // A portfolio value dropping by a synthetic stressed market correlation parameter.
        // Ex: if market drops 10% (dropPercentage = 0.1), and Beta = 1.2
        // We'll just fake it as it's proportional to the beta in real life.
        // Assuming 1:1 for the hackathon MVP

        const impactValue = currentValue * (1 - (dropPercentage / 100));
        const dollarLoss = currentValue - impactValue;

        res.json({
            success: true,
            data: {
                impactValue,
                dollarLoss
            }
        });
    } catch (e) {
        console.error("Scenario Analysis Error:", e);
        res.status(500).json({ success: false, message: "Error rendering historical scenario." });
    }
});

export default router;
