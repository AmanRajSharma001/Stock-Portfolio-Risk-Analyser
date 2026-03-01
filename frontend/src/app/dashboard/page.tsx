"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CloudUpload, TrendingUp, AlertTriangle, ShieldCheck, Cpu, Zap, Activity, RotateCcw, Save } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import axios from 'axios'

import PortfolioPerformanceChart from '@/components/charts/PortfolioPerformanceChart'
import CorrelationHeatmap from '@/components/charts/CorrelationHeatmap'
import AllocationPieChart from '@/components/charts/AllocationPieChart'
import MonteCarloChart from '@/components/charts/MonteCarloChart'
import { generateInsights, Insight, RiskMetrics } from '@/lib/insightGenerator'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [userName, setUserName] = useState<string>("Investor")
    const router = useRouter()

    // File Upload State
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Portfolio Data State
    const [portfolioData, setPortfolioData] = useState<any>(null)
    const [insights, setInsights] = useState<Insight[]>([])

    // Monte Carlo State
    const [mcData, setMcData] = useState<any>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    // Scenario State
    const [dropPercentage, setDropPercentage] = useState<number>(10)

    // AI Discovery State
    const [mode, setMode] = useState<'upload' | 'ai'>('upload')
    const [aiForm, setAiForm] = useState({ budget: 10000, horizon: 5, sector: 'tech', riskTolerance: 'moderate' })
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiResult, setAiResult] = useState<any>(null)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login')
            } else {
                setUser(currentUser)
                setUserName(currentUser.displayName?.split(" ")[0] || "Investor")
                setLoading(false)
            }
        })
        return () => unsub()
    }, [router])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const analyzePortfolio = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/api/portfolio/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const data = res.data.data;
                setPortfolioData(data);
                setInsights(generateInsights(data.metrics, data.correlationMatrix));
            }
        } catch (error) {
            console.error("Analysis Failed", error);
            alert("Failed to analyze portfolio. Ensure backend is running.");
        } finally {
            setIsAnalyzing(false);
        }
    }

    const runSimulation = async () => {
        if (!portfolioData) return;
        setIsSimulating(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/api/simulation/monte-carlo`, {
                initialValue: portfolioData.portfolioValues[portfolioData.portfolioValues.length - 1].value,
                returns: portfolioData.dailyPortfolioReturns,
                numSimulations: 1000
            });

            if (res.data.success) {
                setMcData(res.data.data);
            }
        } catch (error) {
            console.error("Simulation Failed", error);
        } finally {
            setIsSimulating(false);
        }
    }

    const runAiDiscovery = async () => {
        setIsGenerating(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/api/ai/recommend`, aiForm)
            if (res.data.success) {
                setAiResult(res.data.data)
            }
        } catch (e) {
            console.error("AI Generation Failed", e)
            alert("Failed to run AI engine.")
        } finally {
            setIsGenerating(false)
        }
    }

    const savePortfolio = async () => {
        if (!user || !aiResult) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/api/saved`, {
                uid: user.uid,
                portfolioName: `${aiForm.riskTolerance} ${aiForm.sector} Allocator - $${aiForm.budget}`,
                allocationData: aiResult.allocation,
                metricsData: aiResult.portfolioMetrics,
                predictedGrowthData: aiResult.predictedGrowth
            });
            if (res.data.success) {
                alert("Successfully saved AI Strategy to SQL Database!");
            }
        } catch (e) {
            console.error("Save Failed", e);
            alert("Failed to save portfolio.");
        }
    }

    const downloadTemplate = () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        window.location.href = `${API_URL}/api/portfolio/template`
    }

    const handleReset = () => {
        setPortfolioData(null)
        setAiResult(null)
        setMcData(null)
        setInsights([])
        setFile(null)
    }

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">Loading Intelligence Engine...</div>

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 relative overflow-x-hidden">
            <Navbar />

            {/* Subtle background gradients */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-neutral-950 to-neutral-950 -z-50 pointer-events-none" />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Institutional Dashboard</h1>
                        <p className="text-neutral-400">Welcome back, {userName}. Your risk intelligence environment is ready.</p>
                    </div>

                    {(!portfolioData && !aiResult) ? (
                        <div className="flex bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-1 rounded-2xl">
                            <button
                                onClick={() => setMode('upload')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition ${mode === 'upload' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                Backtesting
                            </button>
                            <button
                                onClick={() => setMode('ai')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${mode === 'ai' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                <Zap className="w-4 h-4" /> AI Discovery
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl transition text-sm font-bold text-neutral-400 hover:text-white"
                        >
                            <RotateCcw className="w-4 h-4" /> Start New Analysis
                        </button>
                    )}
                </motion.div>

                {/* Empty State vs Loaded View */}
                {!portfolioData && !aiResult ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="w-full h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-3xl"
                    >
                        {mode === 'upload' ? (
                            <>
                                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                                    <CloudUpload className="w-10 h-10 text-neutral-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Upload your portfolio data</h2>
                                <p className="text-neutral-500 max-w-sm text-center mb-6">We need historical positions or a raw CSV of symbols to begin computing risk metrics.</p>

                                <div className="flex gap-4">
                                    <button onClick={downloadTemplate} className="px-6 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition text-sm font-medium">
                                        Download CSV Template
                                    </button>
                                    <label className={`px-6 py-3 rounded-xl border transition cursor-pointer text-sm font-bold flex items-center gap-2 text-white shadow-lg ${file ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 border-rose-400 shadow-rose-500/20 hover:bg-rose-600'}`}>
                                        <CloudUpload className="w-4 h-4" /> {file ? file.name : "Select CSV explicitly"}
                                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                    {file && (
                                        <button onClick={analyzePortfolio} disabled={isAnalyzing} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm shadow-xl hover:bg-neutral-200 transition">
                                            {isAnalyzing ? "Processing..." : "Run Analysis"}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full max-w-lg">
                                <div className="w-16 h-16 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-fuchsia-500/20">
                                    <Cpu className="w-8 h-8 text-fuchsia-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300">Intelligent Portfolio Allocation</h2>
                                <p className="text-neutral-500 text-center mb-8 text-sm">Allow the Monte Carlo quantitative engine to construct the optimal portfolio based on modern portfolio theory.</p>

                                <div className="space-y-4 bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Initial Capital ($)</label>
                                            <input type="number" value={aiForm.budget} onChange={e => setAiForm({ ...aiForm, budget: Number(e.target.value) })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Horizon (Years)</label>
                                            <input type="number" value={aiForm.horizon} onChange={e => setAiForm({ ...aiForm, horizon: Number(e.target.value) })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Focus Sector</label>
                                            <select value={aiForm.sector} onChange={e => setAiForm({ ...aiForm, sector: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 appearance-none">
                                                <option value="tech">Technology</option>
                                                <option value="health">Healthcare</option>
                                                <option value="finance">Finance</option>
                                                <option value="energy">Energy</option>
                                                <option value="diverse">Diversified</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Risk Approach</label>
                                            <select value={aiForm.riskTolerance} onChange={e => setAiForm({ ...aiForm, riskTolerance: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 appearance-none">
                                                <option value="conservative">Conservative</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="aggressive">Aggressive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={runAiDiscovery} disabled={isGenerating} className="w-full mt-4 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                                        {isGenerating ? "Executing Quant Model..." : "Generate AI Portfolio"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : portfolioData && !aiResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Main Charts */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Performance History Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-5 h-5 text-rose-400" />
                                    <h3 className="text-lg font-bold">Historical Performance</h3>
                                </div>
                                <PortfolioPerformanceChart data={portfolioData.portfolioValues} />
                            </motion.div>

                            {/* Monte Carlo Simulation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-fuchsia-400" />
                                        <h3 className="text-lg font-bold">Monte Carlo Simulation</h3>
                                    </div>
                                    <button
                                        onClick={runSimulation}
                                        disabled={isSimulating}
                                        className="text-xs font-bold px-4 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 rounded-lg transition"
                                    >
                                        {isSimulating ? 'Running 1000 Paths...' : 'Run Simulation'}
                                    </button>
                                </div>

                                {mcData ? (
                                    <MonteCarloChart data={mcData} />
                                ) : (
                                    <div className="w-full h-[350px] flex flex-col items-center justify-center text-neutral-500 text-sm border border-dashed border-neutral-800 rounded-2xl">
                                        Click "Run Simulation" to generate Geometric Brownian Motion paths.
                                    </div>
                                )}
                            </motion.div>

                            {/* Correlation Matrix */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl overflow-hidden"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-lg font-bold">Asset Correlation Matrix</h3>
                                </div>
                                <CorrelationHeatmap data={portfolioData.correlationMatrix} assets={portfolioData.assets} />
                            </motion.div>

                        </div>

                        {/* RIGHT COLUMN: Metrics & Insights */}
                        <div className="space-y-6">

                            {/* Key Metrics Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <h3 className="text-lg font-bold mb-6">Quantitative Risk Metrics</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/50">
                                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-1">Sharpe Ratio</span>
                                        <span className="text-2xl font-bold">{portfolioData.metrics.sharpe.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/50">
                                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-1">Portfolio Beta</span>
                                        <span className="text-2xl font-bold">{portfolioData.metrics.beta.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/50 col-span-2">
                                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-1">95% Daily VaR</span>
                                        <span className="text-2xl font-bold text-red-400">{(portfolioData.metrics.var95 * 100).toFixed(2)}%</span>
                                        <span className="text-xs text-neutral-500 mt-1 block">Expected maximum loss on 19 out of 20 days.</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* AI Insights Engine Feed */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    AI Insights Feed
                                </h3>

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {insights.map((insight, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                                className={`p-4 rounded-2xl border ${insight.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                                                    insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                                                        insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
                                                            'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {insight.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
                                                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                                                    {insight.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />}

                                                    <div>
                                                        <h4 className="text-sm font-bold mb-1">{insight.title}</h4>
                                                        <p className="text-xs opacity-80 leading-relaxed">{insight.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* Stress Test / Scenario Engine Tool */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <h3 className="text-lg font-bold mb-2">Scenario Sandbox</h3>
                                <p className="text-neutral-500 text-xs mb-6">What if the S&P 500 crashed down tomorrow?</p>

                                <div className="mb-6">
                                    <div className="flex justify-between text-xs font-bold text-neutral-400 mb-2">
                                        <span>Market Drop</span>
                                        <span className="text-rose-400">-{dropPercentage}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="50"
                                        value={dropPercentage}
                                        onChange={(e) => setDropPercentage(Number(e.target.value))}
                                        className="w-full accent-rose-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/50">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-1">Estimated Portfolio Impact</span>
                                    {/* Simple UI side calculation for MVP: Portfolio Value * (Drop * Beta) */}
                                    <span className="text-2xl font-bold text-red-400">
                                        -$ {((portfolioData.portfolioValues[portfolioData.portfolioValues.length - 1].value) * (dropPercentage / 100) * portfolioData.metrics.beta).toFixed(0)}
                                    </span>
                                </div>

                            </motion.div>

                        </div>
                    </div>
                ) : aiResult && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">

                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-fuchsia-400" />
                                        <h3 className="text-lg font-bold">Projected Monte Carlo Fan</h3>
                                    </div>
                                    <div className="text-xs text-neutral-400 font-bold bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800">
                                        {aiForm.horizon} Year Projection
                                    </div>
                                </div>
                                <MonteCarloChart data={{
                                    expectedValue: aiResult.predictedGrowth.expectedFutureValue,
                                    worstCase5: aiResult.predictedGrowth.worstCase5,
                                    representativePaths: aiResult.predictedGrowth.paths
                                }} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-2">Expected Annual Return</span>
                                    <span className="text-3xl font-bold text-emerald-400">{(aiResult.portfolioMetrics.expectedAnnualReturn * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider block mb-2">Annualized Volatility</span>
                                    <span className="text-3xl font-bold text-rose-400">{(aiResult.portfolioMetrics.annualVolatility * 100).toFixed(1)}%</span>
                                </div>
                            </motion.div>

                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-6 rounded-3xl"
                            >
                                <h3 className="text-lg font-bold mb-6">Quant Allocation Engine</h3>
                                <AllocationPieChart data={aiResult.allocation} />

                                <div className="mt-8 space-y-3">
                                    {aiResult.allocation.map((alloc: any) => (
                                        <div key={alloc.symbol} className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800/50">
                                            <span className="font-bold flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div> {alloc.symbol}
                                            </span>
                                            <div className="text-right">
                                                <div className="font-medium">${alloc.allocationAmount.toFixed(0)}</div>
                                                <div className="text-xs text-neutral-500">{(alloc.weight * 100).toFixed(1)}% ({alloc.sharesToBuy.toFixed(1)} shares)</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.button
                                onClick={savePortfolio}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition border border-neutral-700 hover:border-neutral-600 shadow-xl"
                            >
                                <Save className="w-4 h-4" /> Save Strategy to SQL Database
                            </motion.button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
