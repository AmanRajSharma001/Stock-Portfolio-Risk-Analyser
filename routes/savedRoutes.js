import express from 'express';
import dbPromise from '../db/database.js';

const router = express.Router();

// Save an AI Reccomendation Portfolio
router.post('/', async (req, res) => {
    try {
        const { uid, portfolioName, allocationData, metricsData, predictedGrowthData } = req.body;
        const db = await dbPromise;

        // Ensure user exists first before adding foreign key bound data
        await db.run(`
            INSERT OR IGNORE INTO users (uid, riskTolerance, investmentHorizon)
            VALUES (?, 'moderate', 'medium')
        `, [uid]);

        // Insert JSON payloads as strings into the SQLite database
        const result = await db.run(`
            INSERT INTO saved_portfolios (uid, portfolioName, allocationData, metricsData, predictedGrowthData)
            VALUES (?, ?, ?, ?, ?)
        `, [
            uid,
            portfolioName || "AI Generated Quant Portfolio",
            JSON.stringify(allocationData),
            JSON.stringify(metricsData),
            JSON.stringify(predictedGrowthData)
        ]);

        res.json({ success: true, message: "Portfolio permanently saved to SQL Database.", id: result.lastID });
    } catch (e) {
        console.error("SQL Save Portfolio Error:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// Get all saved portfolios for a user
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const db = await dbPromise;

        const portfolios = await db.all('SELECT * FROM saved_portfolios WHERE uid = ? ORDER BY createdAt DESC', [uid]);

        // Parse Strings back into JSON for the frontend
        const parsedData = portfolios.map(p => ({
            id: p.id,
            portfolioName: p.portfolioName,
            createdAt: p.createdAt,
            allocationData: JSON.parse(p.allocationData),
            metricsData: JSON.parse(p.metricsData),
            predictedGrowthData: JSON.parse(p.predictedGrowthData)
        }));

        res.json({ success: true, data: parsedData });
    } catch (e) {
        console.error("SQL Get Portfolios Error:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// Delete a saved portfolio
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await dbPromise;
        const { uid } = req.body; // Basic auth check

        const result = await db.run('DELETE FROM saved_portfolios WHERE id = ? AND uid = ?', [id, uid]);

        if (result.changes > 0) {
            res.json({ success: true, message: "Portfolio deleted." });
        } else {
            res.status(404).json({ success: false, message: "Portfolio not found or unauthorized." });
        }
    } catch (e) {
        console.error("SQL Delete Portfolios Error:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});


export default router;
