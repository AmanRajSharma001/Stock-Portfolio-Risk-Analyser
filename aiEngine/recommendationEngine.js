import { fetchSectorStocks } from '../services/stockService.js';
import * as math from 'mathjs';
import axios from 'axios';
import { runMonteCarlo } from '../riskEngine/monteCarlo.js';

const LYZR_API_KEY = process.env.LYZR_API_KEY || 'sk-default-m9cMRZXPRyCcPZKTVcvB0CddiDX98ltf';

export const generateRecommendation = async (budget, horizon, sector, riskTolerance) => {
    // 1. Fetch available stocks in the selected sector
    const stocks = await fetchSectorStocks(sector);

    // 2. Rank and analyze metrics for each stock
    const analyzedStocks = stocks.map(stock => {
        const returns = stock.historicalReturns;
        const mean = returns.length > 0 ? math.mean(returns) : 0;
        const std = returns.length > 0 ? math.std(returns) : 1;
        const sharpe = std > 0 ? (mean * 252 - 0.02) / (std * Math.sqrt(252)) : 0;

        // Simple linear regression to find trend strength
        // (Simplified for MVP hackathon constraints by doing simple moving averages)
        const recentReturns = returns.slice(-30);
        const longReturns = returns.slice(-100);
        const shortMA = recentReturns.length > 0 ? math.mean(recentReturns) : 0;
        const longMA = longReturns.length > 0 ? math.mean(longReturns) : 0;
        const trendStrength = shortMA - longMA;

        return {
            symbol: stock.symbol,
            currentPrice: stock.currentPrice,
            returns,
            mean,
            std,
            sharpe,
            trendStrength,
            volatility: std * Math.sqrt(252) // Annualized
        };
    });

    // 3. Filter and weight based on Risk Tolerance 
    // We try to ask the Lyzr AI Agent first!
    let selectedSymbols = [];
    try {
        const availableSymbols = analyzedStocks.map(s => s.symbol).join(', ');
        const prompt = `You are an elite quantitative AI portfolio manager operating in March 2026.
        The user wants a highly specialized ${riskTolerance} portfolio with a budget of $${budget} projecting forward from the year 2026 over ${horizon} years in the ${sector} sector.
        Available stocks to choose from: ${availableSymbols}.
        CRITICAL INSTRUCTION: You MUST select EXACTLY 5 DIFFERENT stock symbols that perfectly match the ${riskTolerance} profile in the ${sector} sector. Randomize your selection from the available optimal choices so the output isn't exactly the same every time.
        Respond with ONLY 5 stock symbols separated by commas. Do not include any other text, reasoning, or markdown format. Example output: AAPL, MSFT, GOOGL, NVDA, TSLA`;

        const lyzrPayload = {
            "user_id": "sankajash@gmail.com",
            "agent_id": "6914c2b3805206bbcf61c802",
            "session_id": "6914c2b3805206bbcf61c802-portfolioGen",
            "message": prompt
        };

        const response = await axios.post('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', lyzrPayload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': LYZR_API_KEY
            },
            timeout: 10000 // 10 second timeout for the hackathon demo
        });

        const replyRaw = response.data.response || response.data.message || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

        // Extract symbols using regex (uppercase letters, 1 to 5 chars long)
        const matchedSymbols = replyRaw.match(/[A-Z]{1,5}/g) || [];
        const uniqueSymbols = [...new Set(matchedSymbols)];

        // Ensure they actually exist in our analyzed pool
        selectedSymbols = uniqueSymbols.filter(sym => analyzedStocks.some(s => s.symbol === sym)).slice(0, 5);

        console.log("Lyzr AI Recommended:", selectedSymbols);
    } catch (e) {
        console.warn("Lyzr AI failed to generate portfolio, falling back to math heuristic:", e.message);
    }

    let filtered = [];
    if (selectedSymbols.length >= 3) { // As long as Lyzr gave us at least 3 valid ones
        filtered = analyzedStocks.filter(s => selectedSymbols.includes(s.symbol));
        // Fill the rest if it didn't give 5
        while (filtered.length < 5 && analyzedStocks.length >= 5) {
            const randomStock = analyzedStocks[Math.floor(Math.random() * analyzedStocks.length)];
            if (!filtered.find(s => s.symbol === randomStock.symbol)) {
                filtered.push(randomStock);
            }
        }
    } else {
        // Fallback: Conservative: Low Vol, Moderate: High Sharpe, Aggressive: High Trend & Mean
        filtered = analyzedStocks.sort((a, b) => {
            if (riskTolerance === 'conservative') {
                return a.volatility - b.volatility;
            } else if (riskTolerance === 'aggressive') {
                return b.trendStrength - a.trendStrength || b.mean - a.mean;
            } else {
                return b.sharpe - a.sharpe; // Moderate defaults to best risk-adjusted
            }
        });

        // Add a small amount of randomness so the fallback isn't identical every time
        filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    // 4. Allocate Budget 
    // Using inverse volatility weighting strategy as a standard Institutional approach
    const inverseVols = filtered.map(s => 1 / s.volatility);
    const sumInverseVols = math.sum(inverseVols);
    const weights = inverseVols.map(iv => iv / sumInverseVols);

    const allocation = filtered.map((stock, i) => {
        // Add slight randomization to weights (± 5%) so it's not identical every time
        const randomizeWeight = weights[i] * (1 + (Math.random() * 0.1 - 0.05));

        return {
            symbol: stock.symbol,
            weight: randomizeWeight,
            allocationAmount: budget * randomizeWeight,
            sharesToBuy: (budget * randomizeWeight) / stock.currentPrice,
            historicalReturns: stock.returns
        };
    });

    // Normalize weights back to 1.0 after randomization
    const totalRandWeight = math.sum(allocation.map(a => a.weight));
    allocation.forEach(a => {
        a.weight = a.weight / totalRandWeight;
        a.allocationAmount = budget * a.weight;
        a.sharesToBuy = a.allocationAmount / analyzedStocks.find(s => s.symbol === a.symbol).currentPrice;
    });

    // 5. Predict Future Growth
    // Blend the daily returns of the new portfolio
    const blendedReturns = [];
    const minLen = Math.min(...allocation.map(a => a.historicalReturns.length));

    for (let i = 0; i < minLen; i++) {
        let dailyRet = 0;
        allocation.forEach(a => {
            dailyRet += a.historicalReturns[Math.max(0, a.historicalReturns.length - minLen + i)] * a.weight;
        });
        blendedReturns.push(dailyRet);
    }

    // Run Monte Carlo based on the requested horizon (in years)
    const tradingDays = horizon * 252;
    // Inject a bit of noise into the MC simulation based on risk tolerance to ensure completely dynamic fans
    const noiseFactor = riskTolerance === 'aggressive' ? 1.5 : riskTolerance === 'conservative' ? 0.8 : 1.1;
    const simulationData = runMonteCarlo(budget, blendedReturns.map(r => r * noiseFactor), 500, tradingDays);

    return {
        allocation,
        predictedGrowth: {
            expectedFutureValue: simulationData.expectedValue,
            worstCase5: simulationData.worstCase5,
            cagr: Math.pow(simulationData.expectedValue / budget, 1 / horizon) - 1,
            paths: simulationData.representativePaths // For graphing the UI fan
        },
        portfolioMetrics: {
            annualVolatility: math.std(blendedReturns) * Math.sqrt(252),
            expectedAnnualReturn: math.mean(blendedReturns) * 252
        }
    };
};
