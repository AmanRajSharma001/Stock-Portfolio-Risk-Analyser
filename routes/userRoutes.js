import express from 'express';
import dbPromise from '../db/database.js';

const router = express.Router();

// Get User Profile Preferences
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const db = await dbPromise;

        const user = await db.get('SELECT * FROM users WHERE uid = ?', [uid]);

        if (user) {
            res.json({ success: true, data: user });
        } else {
            // Return default preferences if not found
            res.json({
                success: true,
                data: {
                    riskTolerance: 'moderate',
                    investmentHorizon: 'medium'
                }
            });
        }
    } catch (e) {
        console.error("SQL Get User Error:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// Update or Create User Profile Preferences
router.post('/', async (req, res) => {
    try {
        const { uid, displayName, riskTolerance, investmentHorizon } = req.body;
        const db = await dbPromise;

        // SQLite UPSERT syntax
        await db.run(`
            INSERT INTO users (uid, displayName, riskTolerance, investmentHorizon)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
                displayName = excluded.displayName,
                riskTolerance = excluded.riskTolerance,
                investmentHorizon = excluded.investmentHorizon,
                updatedAt = CURRENT_TIMESTAMP
        `, [uid, displayName, riskTolerance, investmentHorizon]);

        res.json({ success: true, message: "Profile successfully saved to SQL Database." });
    } catch (e) {
        console.error("SQL Save User Error:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

export default router;
