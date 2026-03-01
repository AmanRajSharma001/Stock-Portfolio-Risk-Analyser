import axios from 'axios';
import NodeCache from 'node-cache';
import { randn_bm } from '../riskEngine/monteCarlo.js';

// Cache for 1 hour to prevent API rate limits
const cache = new NodeCache({ stdTTL: 3600 });
const API_KEY = process.env.STOCK_API_KEY || ''; // Optional: e.g. Alpha Vantage

// Base mapping of tech/finance/health stocks for the mock engine.
export const SECTOR_MAP = {
    tech: ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN", "META", "TSLA"],
    health: ["JNJ", "UNH", "PFE", "ABBV", "TMO", "DHR", "LLY"],
    finance: ["JPM", "BAC", "WFC", "C", "GS", "MS", "AXP"],
    energy: ["XOM", "CVX", "COP", "EOG", "SLB", "PXD", "MPC"],
    diverse: ["AAPL", "JNJ", "JPM", "XOM", "PG", "WMT", "KO"]
};

// Generates an exact 1-year historical data curve for a stock, 
// using deterministic drift based on string hashing so identical symbols always look the same in one session.
const generatePredictableMockPrices = (symbol, days = 252) => {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);

    // Pseudo-random properties based on ticker name
    const startPrice = 50 + (Math.abs(hash) % 200);
    const mu = ((Math.abs(hash) % 20) - 5) / 10000; // Daily drift (-0.05% to +0.15%)
    const sigma = 0.01 + ((Math.abs(hash) % 15) / 1000); // Daily Volatility (1% to 2.5%)

    const prices = [startPrice];
    let currentPrice = startPrice;

    // Calculate backwards from March 2026 linearly
    const dates = [];
    const endDate = new Date('2026-03-01T00:00:00Z');

    for (let i = 0; i < days; i++) {
        currentPrice = currentPrice * Math.exp(mu - (sigma * sigma) / 2 + sigma * randn_bm());
        prices.push(currentPrice);

        let d = new Date(endDate);
        d.setDate(d.getDate() - (days - i));
        dates.push(d.toISOString().split('T')[0]);
    }
    dates.push(endDate.toISOString().split('T')[0]);

    return { prices, dates };
};

export const fetchHistoricalData = async (symbol) => {
    const cached = cache.get(`hist_${symbol}`);
    if (cached) return cached;

    // If an API key is provided, attempt to fetch from AlphaVantage/etc in the future.
    // For now, or if no API key is present (the Hackathon default), generate realistic mock data:

    const { prices, dates } = generatePredictableMockPrices(symbol);

    // Calculate basic daily returns
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const data = {
        symbol,
        currentPrice: prices[prices.length - 1],
        historicalPrices: prices,
        historicalDates: dates,
        historicalReturns: returns
    };

    cache.set(`hist_${symbol}`, data);
    return data;
};

export const fetchSectorStocks = async (sector) => {
    const symbols = SECTOR_MAP[sector] || SECTOR_MAP['diverse'];

    // Fetch data for all symbols in the sector
    const promises = symbols.map(sym => fetchHistoricalData(sym));
    return Promise.all(promises);
};
