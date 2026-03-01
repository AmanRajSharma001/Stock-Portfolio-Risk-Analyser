import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPromise = open({
    filename: path.join(__dirname, '../marketplay.sqlite'),
    driver: sqlite3.Database
});

export const initializeDatabase = async () => {
    try {
        const db = await dbPromise;

        // Create Users Table for persistent Profile preferences
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                uid TEXT PRIMARY KEY,
                displayName TEXT,
                riskTolerance TEXT DEFAULT 'moderate',
                investmentHorizon TEXT DEFAULT 'medium',
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Saved Portfolios Table for storing AI generated results
        await db.exec(`
            CREATE TABLE IF NOT EXISTS saved_portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL,
                portfolioName TEXT,
                allocationData TEXT NOT NULL,      -- Storing JSON as TEXT
                metricsData TEXT NOT NULL,         -- Storing JSON as TEXT
                predictedGrowthData TEXT NOT NULL,   -- Storing JSON as TEXT
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uid) REFERENCES users (uid)
            )
        `);

        console.log("✅ SQLite Database initialized and tables configured.");
    } catch (error) {
        console.error("❌ Error initializing SQLite database:", error);
    }
};

export default dbPromise;
