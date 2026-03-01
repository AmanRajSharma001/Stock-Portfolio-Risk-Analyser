# 1. Problem Statement
## Problem Title
Stock Portfolio Risk Analyzer
## Problem Description
Retail investors often rely on daily gains and losses to evaluate performance. However, this approach fails to capture true portfolio risk. Important metrics such as Value at Risk (VaR), Sharpe Ratio, Beta, and asset correlations are rarely accessible in simple tools.
Without structured risk analysis, investors may underestimate volatility, ignore diversification weaknesses, and make decisions based on intuition rather than data.
## Target Users
Retail investors,
Beginner traders,
Finance students,
Portfolio managers (entry-level)
## Existing Gaps
Lack of simple tools for advanced risk metrics
No integrated desktop dashboard for portfolio simulation
Limited scenario-based analysis tools
Complex institutional tools not accessible to beginners
## 2. Problem Understanding & Approach
### Root Cause Analysis
Most retail investors:
Focus only on returns, not risk
Lack access to structured risk models
Do not understand correlation & diversification
Do not simulate worst-case scenarios
### Solution Strategy
Build an interactive dashboard that:
Accepts user portfolio inputs
Fetches historical stock data
Calculates risk metrics
Runs Monte Carlo simulations
Visualizes insights clearly
## 3. Proposed Solution
### Solution Overview
An end-to-end risk analytics platform that transforms raw stock data into actionable risk insights.
### Core Idea
Combine statistical finance models with simulation-based forecasting inside an intuitive dashboard to make institutional-grade analytics accessible.
### Key Features
Portfolio input (multiple assets)
Value at Risk (VaR) calculation
Sharpe Ratio computation
Beta vs Market analysis
Correlation heatmap
Monte Carlo simulation
Scenario analysis (e.g., asset drop by X%)
Interactive data visualization
## 4. System Architecture
### High-Level Flow
User → Frontend → Backend → Risk Engine → Database → Response
### Architecture Description
User inputs portfolio
Frontend sends request to backend
Backend fetches historical data
Risk engine computes metrics
Simulation module runs Monte Carlo
Results stored temporarily
Insights returned and visualized
### Architecture Diagram

## 5. Dataset Selected
### Dataset Name
Historical Stock Price Data
### Source
Yahoo Finance API (yfinance)
### Data Type
Time-series financial data
### Selection Reason
Reliable historical market data
Free and accessible
Covers global markets
### Preprocessing Steps
Extract Adjusted Close prices
Handle missing values
Compute daily returns
Normalize for simulations
## 6. Model Selected
Model Name
Statistical Risk Models + Monte Carlo Simulation
Selection Reasoning
Industry standard in portfolio risk analysis
Interpretable results
Computationally efficient
Alternatives Considered
GARCH volatility model
LSTM-based forecasting
ARIMA time-series model
Evaluation Metrics
Portfolio volatility
Sharpe Ratio
95% Value at Risk
Beta coefficient
## 7. Technology Stack
### Frontend
Streamlit
### Backend
Python / FastAPI
ML/AI
NumPy, Pandas, SciPy
### Database
PostgreSQL / SQLite
### Deployment
Streamlit Cloud / Render / AWS
## 8. API Documentation & Testing
### API Endpoints List
Endpoint 1: /get-portfolio-data
Fetches historical stock data
Endpoint 2: /calculate-risk
Returns risk metrics
Endpoint 3: /run-simulation
Runs Monte Carlo simulation
API Testing Screenshots
(Add Postman / Thunder Client screenshots here)
## 9. End-to-End Workflow
User enters stock tickers and allocation
System fetches historical price data
Daily returns computed
Risk metrics calculated
Monte Carlo simulation runs
Insights and visualizations displayed
## 10. Demo & Video
Live Demo Link: https://stock-portfolio-risk-analyser.onrender.com

Demo Video Link:

GitHub Repository: https://github.com/AmanRajSharma001/Stock-Portfolio-Risk-Analyser
## 11. Hackathon Deliverables Summary
Working risk analytics dashboard
Simulation engine
API endpoints
Visual risk reporting
Deployment-ready system
## 12. Team Roles & Responsibilities
| Member Name	| Role	| Responsibilities |
| --- | --- | --- |
| Aman Raj Sharma	| Backend Developer	| Risk engine & API |
| Deepak Kumar	| Frontend Developer	| Dashboard & UI |
| Saransh Mittal	| Data/ML Engineer	| Simulation & modeling |
## 13. Future Scope & Scalability
Short-Term
Portfolio optimization (Efficient Frontier)
PDF risk reports
Improved UI analytics
Long-Term
Real-time streaming data
AI-based volatility forecasting
Multi-user authentication system
Cloud-scale architecture
## 14. Known Limitations
Assumes normal distribution in simulation
Dependent on historical data
No real-time live trading integration
## 15. Impact
This project empowers retail investors by transforming complex financial risk models into clear, visual, and actionable insights — enabling smarter, data-driven investment decisions.
