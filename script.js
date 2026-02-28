/**
 * Stock Portfolio Risk Analyzer
 * Educational tool for calculating and visualizing portfolio risk metrics
 */

class PortfolioAnalyzer {
  constructor() {
    // Available stocks for selection
    this.availableStocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
    this.maxStocks = 5;

    // Store current portfolio
    this.portfolio = [];
    this.stockData = {};
    this.metrics = {};
    this.originalData = {};

    // Charts
    this.charts = {};

    // Initialize
    this.generateMockData();
    this.initializeUI();
  }

  /**
   * Generate realistic mock data for stocks
   * Creates 252 days of price history with realistic volatility and correlations
   */
  generateMockData() {
    const stocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "SPY"];

    // Base parameters for each stock (annualized volatility, drift)
    const stockParams = {
      AAPL: { volatility: 0.28, drift: 0.12, basePrice: 175 },
      GOOGL: { volatility: 0.3, drift: 0.1, basePrice: 140 },
      MSFT: { volatility: 0.25, drift: 0.15, basePrice: 380 },
      AMZN: { volatility: 0.35, drift: 0.08, basePrice: 180 },
      TSLA: { volatility: 0.55, drift: 0.05, basePrice: 250 },
      SPY: { volatility: 0.18, drift: 0.1, basePrice: 500 },
    };

    // Correlation matrix (simplified)
    const correlations = {
      "AAPL-GOOGL": 0.75,
      "AAPL-MSFT": 0.7,
      "AAPL-AMZN": 0.65,
      "AAPL-TSLA": 0.5,
      "GOOGL-MSFT": 0.72,
      "GOOGL-AMZN": 0.68,
      "GOOGL-TSLA": 0.52,
      "MSFT-AMZN": 0.6,
      "MSFT-TSLA": 0.48,
      "AMZN-TSLA": 0.55,
      "SPY-AAPL": 0.75,
      "SPY-GOOGL": 0.72,
      "SPY-MSFT": 0.78,
      "SPY-AMZN": 0.7,
      "SPY-TSLA": 0.45,
    };

    // Generate correlated returns using Cholesky decomposition approximation
    stocks.forEach((stock) => {
      const params = stockParams[stock];
      const dailyVol = params.volatility / Math.sqrt(252);
      const dailyDrift = params.drift / 252;

      const prices = [params.basePrice];
      const returns = [];

      for (let i = 0; i < 252; i++) {
        // Generate random return with drift
        const randomReturn = this.generateCorrelatedRandom(
          stock,
          stocks,
          correlations,
          i,
          dailyVol,
        );
        const dailyReturn = dailyDrift / 252 + randomReturn * dailyVol;
        returns.push(dailyReturn);

        const newPrice = prices[i] * (1 + dailyReturn);
        prices.push(newPrice);
      }

      this.stockData[stock] = { prices, returns };
      this.originalData[stock] = { prices: [...prices], returns: [...returns] };
    });

    // Store params for scenario adjustments
    this.stockParams = stockParams;
  }

  /**
   * Generate correlated random returns
   */
  generateCorrelatedRandom(stock, allStocks, correlations, dayIndex, baseVol) {
    // Use day index as seed for reproducibility
    const seed =
      Math.sin(dayIndex * 12.9898 + allStocks.indexOf(stock) * 78.233) *
      43758.5453;
    const random1 = seed - Math.floor(seed);
    const random2 = Math.sin(dayIndex * 39.346 + allStocks.indexOf(stock)) % 1;

    // Box-Muller transform for normal distribution
    const u1 = Math.abs(random1);
    const u2 = Math.abs(random2);
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Add some correlation with market (SPY)
    const marketCorrelation = correlations[`SPY-${stock}`] || 0.7;
    const marketRandom = Math.sin(dayIndex * 12.345) % 1;
    const marketZ =
      Math.sqrt(-2 * Math.log(Math.abs(marketRandom))) *
      Math.cos(2 * Math.PI * Math.abs(Math.sin(dayIndex * 56.789)));

    return (
      z * (1 - marketCorrelation * 0.5) + marketZ * marketCorrelation * 0.5
    );
  }

  /**
   * Initialize the UI with default stocks
   */
  initializeUI() {
    // Add default 3 stocks
    this.portfolio = [
      { ticker: "AAPL", allocation: 33.33 },
      { ticker: "GOOGL", allocation: 33.33 },
      { ticker: "MSFT", allocation: 33.34 },
    ];

    this.renderStockInputs();
    this.analyzePortfolio();
  }

  /**
   * Render stock input rows
   */
  renderStockInputs() {
    const container = document.getElementById("stockInputs");
    container.innerHTML = "";

    this.portfolio.forEach((stock, index) => {
      const row = document.createElement("div");
      row.className = "stock-row";
      row.innerHTML = `
                <div>
                    <label>Ticker Symbol</label>
                    <select id="ticker-${index}" onchange="portfolioAnalyzer.updateTicker(${index}, this.value)" 
                            style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); 
                                   border-radius: 8px; color: var(--text-primary); font-size: 1rem;">
                        ${this.availableStocks
                          .map(
                            (s) =>
                              `<option value="${s}" ${s === stock.ticker ? "selected" : ""}>${s}</option>`,
                          )
                          .join("")}
                    </select>
                </div>
                <div>
                    <label>Allocation %</label>
                    <input type="number" id="allocation-${index}" class="allocation" 
                           value="${stock.allocation}" min="0" max="100" step="0.01"
                           onchange="portfolioAnalyzer.updateAllocation(${index}, this.value)">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button class="btn btn-danger" onclick="portfolioAnalyzer.removeStockRow(${index})" 
                            ${this.portfolio.length <= 1 ? "disabled" : ""}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
      container.appendChild(row);
    });

    this.updateAllocationStatus();
  }

  /**
   * Add a new stock row
   */
  addStockRow() {
    if (this.portfolio.length >= this.maxStocks) {
      alert("Maximum 5 stocks allowed");
      return;
    }

    // Find unused stock
    const usedTickers = this.portfolio.map((s) => s.ticker);
    const available = this.availableStocks.filter(
      (s) => !usedTickers.includes(s),
    );

    if (available.length === 0) {
      alert("All available stocks are already in portfolio");
      return;
    }

    // Distribute remaining allocation
    const remainingAllocation =
      100 - this.portfolio.reduce((sum, s) => sum + s.allocation, 0);
    const newAllocation = Math.min(remainingAllocation / 2, 33.33);

    // Reduce existing allocations proportionally
    this.portfolio.forEach((s) => {
      s.allocation = s.allocation * (1 - newAllocation / 100);
    });

    this.portfolio.push({ ticker: available[0], allocation: newAllocation });
    this.renderStockInputs();
  }

  /**
   * Remove a stock row
   */
  removeStockRow(index) {
    if (this.portfolio.length <= 1) return;

    const removedAllocation = this.portfolio[index].allocation;
    this.portfolio.splice(index, 1);

    // Redistribute removed allocation
    this.portfolio.forEach((s) => {
      s.allocation += removedAllocation / this.portfolio.length;
    });

    this.renderStockInputs();
  }

  /**
   * Update ticker symbol
   */
  updateTicker(index, ticker) {
    this.portfolio[index].ticker = ticker;
  }

  /**
   * Update allocation percentage
   */
  updateAllocation(index, value) {
    this.portfolio[index].allocation = parseFloat(value) || 0;
    this.updateAllocationStatus();
  }

  /**
   * Update allocation status display
   */
  updateAllocationStatus() {
    const total = this.portfolio.reduce((sum, s) => sum + s.allocation, 0);
    const statusEl = document.getElementById("allocationStatus");

    statusEl.textContent = `Total Allocation: ${total.toFixed(2)}%`;
    statusEl.className = `allocation-status ${Math.abs(total - 100) < 0.01 ? "valid" : "invalid"}`;

    // Update add button state
    const addBtn = document.getElementById("addStockBtn");
    addBtn.disabled = this.portfolio.length >= this.maxStocks;
  }

  /**
   * Show loading overlay
   */
  showLoading(show) {
    document.getElementById("loadingOverlay").classList.toggle("active", show);
  }

  /**
   * Main analysis function
   */
  analyzePortfolio() {
    this.showLoading(true);

    setTimeout(() => {
      // Reset data to original (in case of previous scenarios)
      this.resetData();

      // Calculate metrics
      this.calculateMetrics();

      // Update UI
      this.renderMetrics();
      this.renderCorrelationMatrix();
      this.updateCharts();
      this.runMonteCarlo();
      this.renderRiskSummary();
      this.renderBenchmarkComparison();

      this.showLoading(false);
    }, 500);
  }

  /**
   * Reset data to original
   */
  resetData() {
    Object.keys(this.originalData).forEach((stock) => {
      this.stockData[stock] = {
        prices: [...this.originalData[stock].prices],
        returns: [...this.originalData[stock].returns],
      };
    });
  }

  /**
   * Calculate all risk metrics
   */
  calculateMetrics() {
    const weights = this.portfolio.map((s) => s.allocation / 100);
    const tickers = this.portfolio.map((s) => s.ticker);

    // Calculate portfolio returns (weighted average)
    const portfolioReturns = [];
    for (let i = 0; i < 252; i++) {
      let dailyReturn = 0;
      for (let j = 0; j < tickers.length; j++) {
        dailyReturn += weights[j] * this.stockData[tickers[j]].returns[i];
      }
      portfolioReturns.push(dailyReturn);
    }

    // 1. Average Daily Return
    const avgDailyReturn =
      portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;

    // 2. Portfolio Volatility (annualized standard deviation)
    const variance =
      portfolioReturns.reduce(
        (sum, r) => sum + Math.pow(r - avgDailyReturn, 2),
        0,
      ) / portfolioReturns.length;
    const dailyVolatility = Math.sqrt(variance);
    const annualizedVolatility = dailyVolatility * Math.sqrt(252);

    // 3. Value at Risk (VaR) at 95% - Historical method
    const sortedReturns = [...portfolioReturns].sort((a, b) => a - b);
    const varIndex = Math.floor(portfolioReturns.length * 0.05);
    const var95 = -sortedReturns[varIndex]; // Make positive

    // 4. Conditional VaR (CVaR) - average of losses beyond VaR
    const tailReturns = sortedReturns.slice(0, varIndex + 1);
    const cvar95 = -tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;

    // 5. Sharpe Ratio: (avg return - risk-free rate) / volatility
    const riskFreeRate = 0.03; // 3% annual
    const dailyRiskFree = riskFreeRate / 252;
    const sharpeRatio =
      ((avgDailyReturn - dailyRiskFree) / dailyVolatility) * Math.sqrt(252);

    // 6. Portfolio Beta - covariance with market (SPY)
    const marketReturns = this.stockData["SPY"].returns;
    const marketMean =
      marketReturns.reduce((a, b) => a + b, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;
    for (let i = 0; i < 252; i++) {
      covariance +=
        (portfolioReturns[i] - avgDailyReturn) *
        (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    covariance /= 252;
    marketVariance /= 252;
    const portfolioBeta = covariance / marketVariance;

    // 7. Maximum Drawdown
    let peak = this.stockData[tickers[0]].prices[0] * weights[0];
    let maxDrawdown = 0;
    const drawdowns = [];

    let runningValue = peak;
    for (let i = 0; i < portfolioReturns.length; i++) {
      runningValue *= 1 + portfolioReturns[i];
      if (runningValue > peak) peak = runningValue;
      const drawdown = (peak - runningValue) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      drawdowns.push(-drawdown * 100); // Convert to percentage
    }

    // Store metrics
    this.metrics = {
      avgDailyReturn: avgDailyReturn * 100,
      annualizedReturn: avgDailyReturn * 252 * 100,
      volatility: annualizedVolatility * 100,
      var95: var95 * 100,
      cvar95: cvar95 * 100,
      sharpeRatio: sharpeRatio,
      beta: portfolioBeta,
      maxDrawdown: maxDrawdown * 100,
      portfolioReturns,
      drawdowns,
      weights,
      tickers,
    };
  }

  /**
   * Render metrics cards
   */
  renderMetrics() {
    const container = document.getElementById("metricsGrid");

    const metricsData = [
      {
        label: "Annualized Return",
        value: this.metrics.annualizedReturn,
        format: "percent",
        tooltip:
          "The expected annual return based on historical performance, calculated as the average daily return multiplied by 252 trading days.",
      },
      {
        label: "Volatility",
        value: this.metrics.volatility,
        format: "percent",
        tooltip:
          "Measures the variation of portfolio returns over time. Higher volatility means higher risk. Annualized from daily standard deviation.",
        colorClass:
          this.metrics.volatility > 25
            ? "negative"
            : this.metrics.volatility > 15
              ? "neutral"
              : "positive",
      },
      {
        label: "Value at Risk (95%)",
        value: this.metrics.var95,
        format: "percent",
        tooltip:
          "The maximum expected loss over a given time period (1 day) at a 95% confidence level. In 95% of cases, daily losses won't exceed this value.",
        colorClass:
          this.metrics.var95 > 5
            ? "negative"
            : this.metrics.var95 > 2
              ? "neutral"
              : "positive",
      },
      {
        label: "Conditional VaR (95%)",
        value: this.metrics.cvar95,
        format: "percent",
        tooltip:
          "Also known as Expected Shortfall. The average loss when losses exceed VaR. More informative than VaR for tail risks.",
      },
      {
        label: "Sharpe Ratio",
        value: this.metrics.sharpeRatio,
        format: "number",
        tooltip:
          "Risk-adjusted return metric. Higher is better. A ratio > 1 is considered good, > 2 is very good, > 3 is excellent.",
        colorClass:
          this.metrics.sharpeRatio > 1
            ? "positive"
            : this.metrics.sharpeRatio > 0
              ? "neutral"
              : "negative",
      },
      {
        label: "Portfolio Beta",
        value: this.metrics.beta,
        format: "number",
        tooltip:
          "Measures portfolio sensitivity to market movements. Beta > 1 means more volatile than market, < 1 means less volatile.",
        colorClass:
          this.metrics.beta > 1
            ? "negative"
            : this.metrics.beta > 0.8
              ? "neutral"
              : "positive",
      },
      {
        label: "Maximum Drawdown",
        value: this.metrics.maxDrawdown,
        format: "percent",
        tooltip:
          "The largest peak-to-trough decline in portfolio value. Represents the worst-case historical loss.",
        colorClass:
          this.metrics.maxDrawdown > 20
            ? "negative"
            : this.metrics.maxDrawdown > 10
              ? "neutral"
              : "positive",
      },
    ];

    container.innerHTML = metricsData
      .map(
        (m) => `
            <div class="metric-card">
                <div class="metric-label">
                    ${m.label}
                    <span class="tooltip">
                        <i class="fas fa-info-circle info-icon"></i>
                        <span class="tooltiptext">${m.tooltip}</span>
                    </span>
                </div>
                <div class="metric-value ${m.colorClass || "neutral"}">
                    ${m.format === "percent" ? m.value.toFixed(1) + "%" : m.value.toFixed(2)}
                </div>
            </div>
        `,
      )
      .join("");
  }

  /**
   * Calculate and render correlation matrix
   */
  renderCorrelationMatrix() {
    const tickers = this.metrics.tickers;
    const n = tickers.length;

    let matrix = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = this.calculateCorrelation(
            this.stockData[tickers[i]].returns,
            this.stockData[tickers[j]].returns,
          );
        }
      }
    }

    const container = document.getElementById("correlationMatrix");
    let html = '<table class="correlation-table"><thead><tr><th></th>';

    tickers.forEach((t) => (html += `<th>${t}</th>`));
    html += "</tr></thead><tbody>";

    for (let i = 0; i < n; i++) {
      html += `<tr><th>${tickers[i]}</th>`;
      for (let j = 0; j < n; j++) {
        const corr = matrix[i][j];
        const color = this.getCorrelationColor(corr);
        html += `<td class="correlation-cell" style="background: ${color}">${corr.toFixed(2)}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table>";

    container.innerHTML = html;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  calculateCorrelation(returns1, returns2) {
    const n = returns1.length;
    const mean1 = returns1.reduce((a, b) => a + b, 0) / n;
    const mean2 = returns2.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }

    return numerator / Math.sqrt(denom1 * denom2);
  }

  /**
   * Get color for correlation value
   */
  getCorrelationColor(corr) {
    // Red (-1) to green (+1), with white/neutral at 0
    if (corr >= 0) {
      const intensity = Math.round(corr * 255);
      return `rgba(63, 185, 80, ${0.2 + corr * 0.6})`;
    } else {
      const intensity = Math.round(Math.abs(corr) * 255);
      return `rgba(248, 81, 73, ${0.2 + Math.abs(corr) * 0.6})`;
    }
  }

  /**
   * Update all charts
   */
  updateCharts() {
    this.updatePerformanceChart();
    this.updateAllocationChart();
    this.updateDistributionChart();
    this.updateDrawdownChart();
  }

  /**
   * Historical Performance Chart
   */
  updatePerformanceChart() {
    const ctx = document.getElementById("performanceChart").getContext("2d");

    // Calculate portfolio value over time
    const weights = this.metrics.weights;
    const tickers = this.metrics.tickers;

    const portfolioValue = [100]; // Start at $100
    for (let i = 0; i < 252; i++) {
      let dayReturn = 0;
      for (let j = 0; j < tickers.length; j++) {
        dayReturn += weights[j] * this.stockData[tickers[j]].returns[i];
      }
      portfolioValue.push(portfolioValue[i] * (1 + dayReturn));
    }

    // Also add SPY for comparison
    const spyValue = this.stockData["SPY"].prices.map(
      (p) => (p / this.stockData["SPY"].prices[0]) * 100,
    );

    const labels = Array.from({ length: 253 }, (_, i) => `Day ${i}`);

    if (this.charts.performance) this.charts.performance.destroy();

    this.charts.performance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Portfolio",
            data: portfolioValue,
            borderColor: "#58a6ff",
            backgroundColor: "rgba(88, 166, 255, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "S&P 500",
            data: spyValue,
            borderColor: "#8b949e",
            backgroundColor: "transparent",
            borderDash: [5, 5],
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#f0f6fc" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#8b949e" },
            grid: { color: "#30363d" },
          },
          y: {
            ticks: { color: "#8b949e" },
            grid: { color: "#30363d" },
            title: {
              display: true,
              text: "Value ($)",
              color: "#8b949e",
            },
          },
        },
      },
    });
  }

  /**
   * Allocation Pie Chart
   */
  updateAllocationChart() {
    const ctx = document.getElementById("allocationChart").getContext("2d");

    const data = this.portfolio.map((s) => s.allocation);
    const labels = this.portfolio.map((s) => s.ticker);
    const colors = ["#58a6ff", "#3fb950", "#f85149", "#d29922", "#a371f7"];

    if (this.charts.allocation) this.charts.allocation.destroy();

    this.charts.allocation = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: "#21262d",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#f0f6fc" },
          },
        },
      },
    });
  }

  /**
   * Returns Distribution Histogram
   */
  updateDistributionChart() {
    const ctx = document.getElementById("distributionChart").getContext("2d");

    const returns = this.metrics.portfolioReturns;

    // Create histogram bins
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const binCount = 30;
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const binLabels = [];

    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      binLabels.push((binStart * 100).toFixed(1) + "%");
    }

    returns.forEach((r) => {
      const binIndex = Math.min(Math.floor((r - min) / binWidth), binCount - 1);
      bins[binIndex]++;
    });

    // VaR line position
    const varLine = this.metrics.var95;

    if (this.charts.distribution) this.charts.distribution.destroy();

    this.charts.distribution = new Chart(ctx, {
      type: "bar",
      data: {
        labels: binLabels,
        datasets: [
          {
            data: bins,
            backgroundColor: bins.map((_, i) => {
              const binCenter = min + (i + 0.5) * binWidth;
              if (binCenter < -varLine) return "rgba(248, 81, 73, 0.7)";
              return "rgba(88, 166, 255, 0.7)";
            }),
            borderColor: "#30363d",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: {
              color: "#8b949e",
              maxRotation: 45,
              minRotation: 45,
            },
            grid: { color: "#30363d" },
            title: {
              display: true,
              text: "Daily Return",
              color: "#8b949e",
            },
          },
          y: {
            ticks: { color: "#8b949e" },
            grid: { color: "#30363d" },
            title: {
              display: true,
              text: "Frequency",
              color: "#8b949e",
            },
          },
        },
      },
    });
  }

  /**
   * Drawdown Area Chart
   */
  updateDrawdownChart() {
    const ctx = document.getElementById("drawdownChart").getContext("2d");
    const drawdowns = this.metrics.drawdowns;
    const labels = Array.from(
      { length: drawdowns.length },
      (_, i) => `Day ${i + 1}`,
    );

    if (this.charts.drawdown) this.charts.drawdown.destroy();

    this.charts.drawdown = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Drawdown %",
            data: drawdowns,
            borderColor: "#f85149",
            backgroundColor: "rgba(248, 81, 73, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: {
              color: "#8b949e",
              maxTicksLimit: 10,
            },
            grid: { color: "#30363d" },
          },
          y: {
            ticks: { color: "#8b949e" },
            grid: { color: "#30363d" },
            title: {
              display: true,
              text: "Drawdown %",
              color: "#8b949e",
            },
          },
        },
      },
    });
  }

  /**
   * Run Monte Carlo Simulation
   */
  runMonteCarlo() {
    const numSimulations = 500;
    const numDays = 252;
    const weights = this.metrics.weights;
    const tickers = this.metrics.tickers;
    const returns = this.metrics.portfolioReturns;

    const simulations = [];

    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [100];
      for (let day = 0; day < numDays; day++) {
        // Bootstrap: randomly sample from historical returns
        const randomIndex = Math.floor(Math.random() * returns.length);
        const randomReturn = returns[randomIndex];
        path.push(path[day] * (1 + randomReturn));
      }
      simulations.push(path);
    }

    // Calculate statistics
    const finalValues = simulations.map((s) => s[s.length - 1]);
    finalValues.sort((a, b) => a - b);

    const median = finalValues[Math.floor(finalValues.length / 2)];
    const lower5 = finalValues[Math.floor(finalValues.length * 0.05)];
    const upper95 = finalValues[Math.floor(finalValues.length * 0.95)];
    const probProfit =
      (finalValues.filter((v) => v > 100).length / numSimulations) * 100;

    // Update stats display
    document.getElementById("mcMedian").textContent = "$" + median.toFixed(2);
    document.getElementById("mcLower").textContent = "$" + lower5.toFixed(2);
    document.getElementById("mcUpper").textContent = "$" + upper95.toFixed(2);
    document.getElementById("mcProbProfit").textContent =
      probProfit.toFixed(1) + "%";

    // Chart - show 50 sample paths
    const ctx = document.getElementById("monteCarloChart").getContext("2d");
    const labels = Array.from({ length: numDays + 1 }, (_, i) => `Day ${i}`);

    // Sample 50 paths
    const samplePaths = simulations.slice(0, 50);

    const datasets = samplePaths.map((path, i) => ({
      data: path,
      borderColor: "rgba(88, 166, 255, 0.1)",
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.4,
    }));

    // Add median line
    const medianPath = simulations.reduce(
      (acc, sim) => {
        return acc.map((val, i) => val + sim[i] / numSimulations);
      },
      Array(numDays + 1).fill(0),
    );

    datasets.push({
      data: medianPath,
      borderColor: "#3fb950",
      borderWidth: 3,
      fill: false,
      pointRadius: 0,
      tension: 0.4,
      label: "Median",
    });

    // Add confidence interval as filled area
    const lowerBounds = [];
    const upperBounds = [];
    for (let i = 0; i <= numDays; i++) {
      const dayValues = simulations.map((s) => s[i]).sort((a, b) => a - b);
      lowerBounds.push(dayValues[Math.floor(numSimulations * 0.05)]);
      upperBounds.push(dayValues[Math.floor(numSimulations * 0.95)]);
    }

    if (this.charts.monteCarlo) this.charts.monteCarlo.destroy();

    this.charts.monteCarlo = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          ...datasets,
          {
            data: upperBounds,
            borderColor: "transparent",
            backgroundColor: "rgba(88, 166, 255, 0.2)",
            fill: "+1",
            pointRadius: 0,
            tension: 0.4,
            label: "90% CI Upper",
          },
          {
            data: lowerBounds,
            borderColor: "transparent",
            backgroundColor: "transparent",
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            label: "90% CI Lower",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#f0f6fc",
              filter: (item) => item.text === "Median",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#8b949e",
              maxTicksLimit: 10,
            },
            grid: { color: "#30363d" },
          },
          y: {
            ticks: { color: "#8b949e" },
            grid: { color: "#30363d" },
            title: {
              display: true,
              text: "Portfolio Value ($)",
              color: "#8b949e",
            },
          },
        },
      },
    });
  }

  /**
   * Apply scenario analysis
   */
  applyScenario(scenario) {
    this.showLoading(true);

    setTimeout(() => {
      // Store current metrics as "before"
      const beforeMetrics = { ...this.metrics };

      // Reset data and apply scenario
      this.resetData();

      const tickers = this.portfolio.map((s) => s.ticker);

      switch (scenario) {
        case "techCrash":
          // Reduce all stock prices/returns by 15%
          tickers.forEach((ticker) => {
            this.stockData[ticker].prices = this.stockData[ticker].prices.map(
              (p) => p * 0.85,
            );
            this.stockData[ticker].returns = this.stockData[ticker].returns.map(
              (r) => r - 0.15,
            );
          });
          break;

        case "marketRally":
          // Increase all stock prices/returns by 10%
          tickers.forEach((ticker) => {
            this.stockData[ticker].prices = this.stockData[ticker].prices.map(
              (p) => p * 1.1,
            );
            this.stockData[ticker].returns = this.stockData[ticker].returns.map(
              (r) => r + 0.1,
            );
          });
          break;

        case "volatilitySpike":
          // Increase volatility by 50%
          tickers.forEach((ticker) => {
            this.stockData[ticker].returns = this.stockData[ticker].returns.map(
              (r) => r * 1.5,
            );
          });
          break;
      }

      // Recalculate metrics
      this.calculateMetrics();

      // Render comparison
      this.renderScenarioComparison(beforeMetrics, scenario);

      // Update displays
      this.renderMetrics();
      this.renderCorrelationMatrix();
      this.updateCharts();
      this.runMonteCarlo();
      this.renderRiskSummary();
      this.renderBenchmarkComparison();

      this.showLoading(false);
    }, 500);
  }

  /**
   * Reset scenario to original data
   */
  resetScenario() {
    this.analyzePortfolio();
    document.getElementById("scenarioComparison").innerHTML =
      '<p style="color: var(--text-secondary); text-align: center;">Click a scenario to see impact analysis</p>';
  }

  /**
   * Render scenario comparison
   */
  renderScenarioComparison(beforeMetrics, scenario) {
    const container = document.getElementById("scenarioComparison");

    const scenarioNames = {
      techCrash: "Tech Crash (-15%)",
      marketRally: "Market Rally (+10%)",
      volatilitySpike: "Volatility Spike",
    };

    const comparisonData = [
      {
        label: "Portfolio Value",
        before: 100,
        after:
          100 *
          (scenario === "techCrash"
            ? 0.85
            : scenario === "marketRally"
              ? 1.1
              : 1),
        format: "currency",
      },
      {
        label: "Volatility",
        before: beforeMetrics.volatility,
        after: this.metrics.volatility,
        format: "percent",
      },
      {
        label: "Value at Risk",
        before: beforeMetrics.var95,
        after: this.metrics.var95,
        format: "percent",
      },
    ];

    let html = `<h3 style="margin-bottom: 15px; text-align: center;">${scenarioNames[scenario]} Impact</h3>`;
    html += '<div class="comparison-grid">';

    comparisonData.forEach((item) => {
      let beforeStr, afterStr, change;

      if (item.format === "currency") {
        beforeStr = "$" + item.before.toFixed(2);
        afterStr = "$" + item.after.toFixed(2);
        change = ((item.after - item.before) / item.before) * 100;
      } else {
        beforeStr = item.before.toFixed(1) + "%";
        afterStr = item.after.toFixed(1) + "%";
        change = item.after - item.before;
      }

      const changeClass =
        change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
      const changeStr = change >= 0 ? "+" : "";

      html += `
                <div class="comparison-item">
                    <div class="comparison-label">${item.label}</div>
                    <div class="comparison-values">
                        <div class="comparison-before">Before: ${beforeStr}</div>
                        <div class="comparison-after">After: ${afterStr}</div>
                    </div>
                    <div class="comparison-change ${changeClass}">
                        ${changeStr}${item.format === "currency" ? change.toFixed(1) : change.toFixed(1)}%
                    </div>
                </div>
            `;
    });

    html += "</div>";
    container.innerHTML = html;
  }

  /**
   * Render risk summary
   */
  renderRiskSummary() {
    const var95 = this.metrics.var95;
    const volatility = this.metrics.volatility;

    let riskLevel, riskDescription;

    if (var95 < 2 && volatility < 15) {
      riskLevel = "Low Risk";
      riskDescription =
        "This portfolio has low volatility and VaR, suggesting stable returns with minimal downside risk. Suitable for conservative investors.";
    } else if (var95 <= 5 && volatility <= 25) {
      riskLevel = "Moderate Risk";
      riskDescription =
        "This portfolio has moderate volatility and VaR. Balanced risk-reward profile suitable for most investors.";
    } else {
      riskLevel = "High Risk";
      riskDescription =
        "This portfolio shows high volatility and significant downside risk. Suitable for risk-tolerant investors with longer time horizons.";
    }

    const riskEl = document.getElementById("riskLevel");
    riskEl.textContent = riskLevel;
    riskEl.className = "risk-level " + riskLevel.toLowerCase().replace(" ", "");

    document.getElementById("riskDescription").textContent = riskDescription;
  }

  /**
   * Render benchmark comparison
   */
  renderBenchmarkComparison() {
    const container = document.getElementById("benchmarkComparison");

    // Calculate S&P 500 metrics
    const spyReturns = this.stockData["SPY"].returns;
    const spyMean = spyReturns.reduce((a, b) => a + b, 0) / spyReturns.length;
    const spyVariance =
      spyReturns.reduce((sum, r) => sum + Math.pow(r - spyMean, 2), 0) /
      spyReturns.length;
    const spyVol = Math.sqrt(spyVariance) * Math.sqrt(252) * 100;

    const spySorted = [...spyReturns].sort((a, b) => a - b);
    const spyVar = -spySorted[Math.floor(spyReturns.length * 0.05)] * 100;

    const benchmarkData = [
      {
        label: "Volatility",
        portfolio: this.metrics.volatility,
        benchmark: spyVol,
        invert: true,
      },
      {
        label: "Value at Risk",
        portfolio: this.metrics.var95,
        benchmark: spyVar,
        invert: true,
      },
      { label: "Beta", portfolio: this.metrics.beta, benchmark: 1 },
    ];

    container.innerHTML = benchmarkData
      .map((item) => {
        const diff = item.portfolio - item.benchmark;
        const isBetter = item.invert ? diff < 0 : diff > 0;
        const diffStr = (diff >= 0 ? "+" : "") + diff.toFixed(1);

        return `
                <div class="metric-card">
                    <div class="metric-label">${item.label}</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span style="color: var(--accent-blue)">Portfolio: ${item.portfolio.toFixed(1)}%</span>
                        <span style="color: var(--text-secondary)">S&P 500: ${item.benchmark.toFixed(1)}%</span>
                    </div>
                    <div class="metric-value ${isBetter ? "positive" : "negative"}" style="font-size: 1rem; margin-top: 5px;">
                        ${diffStr}${item.label === "Beta" ? "" : "%"} vs benchmark
                    </div>
                </div>
            `;
      })
      .join("");
  }
}

// Initialize the portfolio analyzer
let portfolioAnalyzer;
document.addEventListener("DOMContentLoaded", () => {
  portfolioAnalyzer = new PortfolioAnalyzer();

  // Initialize interactive features
  initializeSidebar();
  initializeModals();
});

// Sidebar functionality
function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const mainWrapper = document.querySelector(".main-wrapper");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      if (window.innerWidth > 768) {
        mainWrapper.classList.toggle("sidebar-collapsed");
      }
    });
  }

  // Nav link click handlers - show/hide sections
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionIds = {
    Overview: [
      "section-portfolio",
      "section-risk",
      "section-charts",
      "section-simulation",
    ],
    Portfolio: ["section-portfolio"],
    "Risk Analysis": ["section-risk"],
    Charts: ["section-charts"],
    Settings: [],
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));
      // Add active class to clicked link
      link.classList.add("active");

      // Get the link text
      const linkText = link.querySelector("span").textContent;

      // Show/hide sections based on navigation
      if (sectionIds[linkText]) {
        // Hide all dashboard sections first
        document.querySelectorAll(".card").forEach((section) => {
          if (section.id && section.id.startsWith("section-")) {
            section.classList.add("hidden");
          }
        });

        // Show selected sections
        if (linkText === "Overview") {
          // Show all sections for Overview
          document.querySelectorAll(".card").forEach((section) => {
            if (section.id && section.id.startsWith("section-")) {
              section.classList.remove("hidden");
            }
          });
        } else {
          sectionIds[linkText].forEach((id) => {
            const section = document.getElementById(id);
            if (section) {
              section.classList.remove("hidden");
            }
          });
        }
      }
    });
  });
}

// Modal functionality
function initializeModals() {
  // Profile Modal
  const profileBtn = document.getElementById("profileBtn");
  const profileModal = document.getElementById("profileModal");
  const closeProfileModal = document.getElementById("closeProfileModal");
  const cancelProfile = document.getElementById("cancelProfile");
  const saveProfile = document.getElementById("saveProfile");
  const userNameInput = document.getElementById("userNameInput");
  const userEmailInput = document.getElementById("userEmailInput");
  const userPhoneInput = document.getElementById("userPhoneInput");
  const userAddressInput = document.getElementById("userAddressInput");
  const userCompanyInput = document.getElementById("userCompanyInput");
  const profileName = document.getElementById("profileName");
  const displayUserName = document.getElementById("displayUserName");
  const displayUserEmail = document.getElementById("displayUserEmail");

  // Settings Modal
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsModal = document.getElementById("closeSettingsModal");
  const cancelSettings = document.getElementById("cancelSettings");
  const saveSettings = document.getElementById("saveSettings");
  const resetSettingsBtn = document.getElementById("resetSettingsBtn");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  const appNameInput = document.getElementById("appNameInput");
  const appTitle = document.getElementById("appTitle");

  // Profile Modal Events
  if (profileBtn && profileModal) {
    profileBtn.addEventListener("click", () => {
      // Load current values
      userNameInput.value = localStorage.getItem("userName") || "User";
      userEmailInput.value =
        localStorage.getItem("userEmail") || "user@example.com";
      userPhoneInput.value = localStorage.getItem("userPhone") || "";
      userAddressInput.value = localStorage.getItem("userAddress") || "";
      userCompanyInput.value = localStorage.getItem("userCompany") || "";

      // Update display
      displayUserName.textContent = localStorage.getItem("userName") || "User";
      displayUserEmail.textContent =
        localStorage.getItem("userEmail") || "user@example.com";

      profileModal.classList.add("active");
    });
  }

  if (closeProfileModal) {
    closeProfileModal.addEventListener("click", () => {
      profileModal.classList.remove("active");
    });
  }

  if (cancelProfile) {
    cancelProfile.addEventListener("click", () => {
      profileModal.classList.remove("active");
    });
  }

  if (saveProfile) {
    saveProfile.addEventListener("click", () => {
      const newName = userNameInput.value.trim();
      const newEmail = userEmailInput.value.trim();
      const newPhone = userPhoneInput.value.trim();
      const newAddress = userAddressInput.value.trim();
      const newCompany = userCompanyInput.value.trim();

      if (newName) {
        profileName.textContent = newName;
        displayUserName.textContent = newName;
        displayUserEmail.textContent = newEmail || "user@example.com";

        // Save all fields to localStorage
        localStorage.setItem("userName", newName);
        localStorage.setItem("userEmail", newEmail);
        localStorage.setItem("userPhone", newPhone);
        localStorage.setItem("userAddress", newAddress);
        localStorage.setItem("userCompany", newCompany);

        profileModal.classList.remove("active");
      }
    });
  }

  // Settings Modal Events
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      // Load current settings
      appNameInput.value = appTitle.textContent.replace(
        /^\s*<i[^>]*><\/i>\s*/,
        "",
      );

      // Load saved settings
      const themeSelect = document.getElementById("themeSelect");
      const chartTypeSelect = document.getElementById("chartTypeSelect");
      const showAnimations = document.getElementById("showAnimations");
      const riskFreeRate = document.getElementById("riskFreeRate");
      const monteCarloRuns = document.getElementById("monteCarloRuns");
      const notifyAnalysis = document.getElementById("notifyAnalysis");
      const notifyErrors = document.getElementById("notifyErrors");
      const cacheData = document.getElementById("cacheData");

      if (themeSelect)
        themeSelect.value = localStorage.getItem("theme") || "dark";
      if (chartTypeSelect)
        chartTypeSelect.value = localStorage.getItem("chartType") || "line";
      if (showAnimations)
        showAnimations.checked =
          localStorage.getItem("showAnimations") !== "false";
      if (riskFreeRate)
        riskFreeRate.value = localStorage.getItem("riskFreeRate") || "3";
      if (monteCarloRuns)
        monteCarloRuns.value = localStorage.getItem("monteCarloRuns") || "500";
      if (notifyAnalysis)
        notifyAnalysis.checked =
          localStorage.getItem("notifyAnalysis") !== "false";
      if (notifyErrors)
        notifyErrors.checked = localStorage.getItem("notifyErrors") === "true";
      if (cacheData)
        cacheData.checked = localStorage.getItem("cacheData") !== "false";

      settingsModal.classList.add("active");
    });
  }

  if (closeSettingsModal) {
    closeSettingsModal.addEventListener("click", () => {
      settingsModal.classList.remove("active");
    });
  }

  if (cancelSettings) {
    cancelSettings.addEventListener("click", () => {
      settingsModal.classList.remove("active");
    });
  }

  if (saveSettings) {
    saveSettings.addEventListener("click", () => {
      const newAppName = appNameInput.value.trim();

      // Update app title
      if (newAppName) {
        appTitle.innerHTML = '<i class="fas fa-chart-line"></i> ' + newAppName;
        localStorage.setItem("appName", newAppName);
      }

      // Save all settings
      const themeSelect = document.getElementById("themeSelect");
      const chartTypeSelect = document.getElementById("chartTypeSelect");
      const showAnimations = document.getElementById("showAnimations");
      const riskFreeRate = document.getElementById("riskFreeRate");
      const monteCarloRuns = document.getElementById("monteCarloRuns");
      const notifyAnalysis = document.getElementById("notifyAnalysis");
      const notifyErrors = document.getElementById("notifyErrors");
      const cacheData = document.getElementById("cacheData");

      if (themeSelect) localStorage.setItem("theme", themeSelect.value);
      if (chartTypeSelect)
        localStorage.setItem("chartType", chartTypeSelect.value);
      if (showAnimations)
        localStorage.setItem("showAnimations", showAnimations.checked);
      if (riskFreeRate)
        localStorage.setItem("riskFreeRate", riskFreeRate.value);
      if (monteCarloRuns)
        localStorage.setItem("monteCarloRuns", monteCarloRuns.value);
      if (notifyAnalysis)
        localStorage.setItem("notifyAnalysis", notifyAnalysis.checked);
      if (notifyErrors)
        localStorage.setItem("notifyErrors", notifyErrors.checked);
      if (cacheData) localStorage.setItem("cacheData", cacheData.checked);

      settingsModal.classList.remove("active");

      // Show notification
      alert("Settings saved successfully!");
    });
  }

  // Reset settings to defaults
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all settings to defaults?")) {
        localStorage.removeItem("theme");
        localStorage.removeItem("chartType");
        localStorage.removeItem("showAnimations");
        localStorage.removeItem("riskFreeRate");
        localStorage.removeItem("monteCarloRuns");
        localStorage.removeItem("notifyAnalysis");
        localStorage.removeItem("notifyErrors");
        localStorage.removeItem("cacheData");

        // Reset form values
        const themeSelect = document.getElementById("themeSelect");
        const chartTypeSelect = document.getElementById("chartTypeSelect");
        const showAnimations = document.getElementById("showAnimations");
        const riskFreeRate = document.getElementById("riskFreeRate");
        const monteCarloRuns = document.getElementById("monteCarloRuns");
        const notifyAnalysis = document.getElementById("notifyAnalysis");
        const notifyErrors = document.getElementById("notifyErrors");
        const cacheData = document.getElementById("cacheData");

        if (themeSelect) themeSelect.value = "dark";
        if (chartTypeSelect) chartTypeSelect.value = "line";
        if (showAnimations) showAnimations.checked = true;
        if (riskFreeRate) riskFreeRate.value = "3";
        if (monteCarloRuns) monteCarloRuns.value = "500";
        if (notifyAnalysis) notifyAnalysis.checked = true;
        if (notifyErrors) notifyErrors.checked = false;
        if (cacheData) cacheData.checked = true;

        alert("Settings reset to defaults!");
      }
    });
  }

  // Clear cache
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the cache?")) {
        localStorage.removeItem("stockDataCache");
        // Clear all stock-related localStorage items
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("Stock") || key.includes("stock")) {
            localStorage.removeItem(key);
          }
        });
        alert("Cache cleared successfully!");
      }
    });
  }

  // Close modals on outside click
  [profileModal, settingsModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    }
  });

  // Load saved preferences
  loadPreferences();
}

// Load saved preferences from localStorage
function loadPreferences() {
  const savedUserName = localStorage.getItem("userName");
  const savedAppName = localStorage.getItem("appName");

  if (savedUserName) {
    document.getElementById("profileName").textContent = savedUserName;
  }

  if (savedAppName) {
    document.getElementById("appTitle").innerHTML =
      '<i class="fas fa-chart-line"></i> ' + savedAppName;
  }
}
