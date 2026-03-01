export interface RiskMetrics {
    var95: number;
    pvar95: number;
    sharpe: number;
    beta: number;
}

export interface Insight {
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    description: string;
}

export function generateInsights(metrics: RiskMetrics, correlationMatrix: any[]): Insight[] {
    const insights: Insight[] = [];

    // 1. Sharpe Ratio Analysis
    if (metrics.sharpe < 0.5) {
        insights.push({
            type: 'warning',
            title: 'Suboptimal Risk-Adjusted Returns',
            description: `A Sharpe ratio of ${metrics.sharpe.toFixed(2)} indicates the portfolio is not generating enough excess return for the level of volatility you are exposed to.`
        });
    } else if (metrics.sharpe > 1.5) {
        insights.push({
            type: 'success',
            title: 'Excellent Risk-Adjusted Returns',
            description: `A Sharpe ratio of ${metrics.sharpe.toFixed(2)} signifies strong historical performance tightly bound to low variance.`
        });
    }

    // 2. Beta (Systematic Risk) Analysis
    if (metrics.beta > 1.3) {
        insights.push({
            type: 'danger',
            title: 'High Market Sensitivity',
            description: `With a Beta of ${metrics.beta.toFixed(2)}, this portfolio is highly sensitive to broad market down-swings. Consider hedging.`
        });
    } else if (metrics.beta < 0.8) {
        insights.push({
            type: 'info',
            title: 'Defensive Positioning',
            description: `A Beta of ${metrics.beta.toFixed(2)} means the portfolio is insulated from market shocks, but may underperform in bull rallies.`
        });
    }

    // 3. Diversification / Correlation Warnings
    let highCorrelationPairs = 0;
    if (correlationMatrix && correlationMatrix.length > 0) {
        const assets = Object.keys(correlationMatrix[0]).filter(k => k !== 'name');

        for (let i = 0; i < correlationMatrix.length; i++) {
            for (let j = i + 1; j < assets.length; j++) {
                const corr = Number(correlationMatrix[i][assets[j]]);
                if (corr > 0.85) {
                    highCorrelationPairs++;
                }
            }
        }

        if (highCorrelationPairs > 2) {
            insights.push({
                type: 'danger',
                title: 'Diversification Hole',
                description: `Multiple assets are highly correlated (>0.85). In a sector downturn, these assets will crash simultaneously.`
            });
        }
    }

    // 4. Value at Risk generic translation
    // Assuming var95 is a daily percentage return (negative)
    if (metrics.var95 < -0.05) { // worse than a 5% daily drop
        insights.push({
            type: 'danger',
            title: 'Extreme Tail Risk',
            description: `The 95% Historical VaR indicates a 1-in-20 chance of a single-day loss exceeding ${(metrics.var95 * 100).toFixed(1)}%.`
        });
    }

    // Fallback if the portfolio is completely normal
    if (insights.length === 0) {
        insights.push({
            type: 'success',
            title: 'Balanced Risk Profile',
            description: 'The portfolio exhibits standard market risk characteristics with no immediate red flags.'
        });
    }

    return insights;
}
