"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CloudUpload, BrainCircuit, Target, TrendingUp, DollarSign, Clock, Briefcase, ChevronRight } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState<string>("Investor")
    const [file, setFile] = useState<File | null>(null)
    const router = useRouter()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login')
            } else {
                setUserName(user.displayName?.split(" ")[0] || "Investor")
                setLoading(false)
            }
        })
        return () => unsub()
    }, [router])

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Intelligence Engine...</div>

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Header Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                        Transform raw data into actionable intelligence. Upload your existing portfolio or let our AI build one tailored to your goals.
                    </p>
                </motion.div>

                {/* Features Highlight */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                    {/* Abstract feature cards into a generic animated motion div */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group"
                    >
                        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CloudUpload className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-100">Portfolio Analysis</h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">Upload your portfolio CSV file to instanty receive risk metrics like VaR, Beta, and Sharpe ratios.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center hover:border-purple-500/40 hover:bg-slate-900/80 transition-all group"
                    >
                        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-100">AI Recommendations</h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">Tell us your investment capital, timeframe, and favored sectors. Our engine will suggest the perfect stocks.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all group"
                    >
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-100">Risk Mitigation</h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">Run Monte Carlo simulations to foresee potential portfolio drawdowns during extreme market volatility.</p>
                    </motion.div>
                </motion.div>

                {/* Action Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* CSV Upload Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
                        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 lg:p-10 rounded-[2rem] flex flex-col hover:border-slate-700 transition-colors"
                    >
                        <h2 className="text-2xl font-bold mb-2">Upload Portfolio</h2>
                        <p className="text-slate-400 mb-8 text-sm">Analyze your current holdings by uploading a CSV file.</p>

                        <label className={`border-2 border-dashed ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5'} transition w-full flex-grow rounded-2xl flex flex-col items-center justify-center cursor-pointer group min-h-[250px]`}>
                            {file ? (
                                <>
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 transition">
                                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <span className="text-emerald-400 font-bold mb-1 text-lg">{file.name}</span>
                                    <span className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB • Click to change</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 transition">
                                        <CloudUpload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition" />
                                    </div>
                                    <span className="text-slate-300 font-medium mb-1">Click to browse or drag your .csv here</span>
                                    <span className="text-slate-500 text-sm">Max file size 10MB</span>
                                </>
                            )}
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </label>

                        {file && (
                            <button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20">
                                Analyze Portfolio
                            </button>
                        )}
                    </motion.div>

                    {/* AI Discovery Engine Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl"
                    >
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            AI Discovery Engine
                        </h2>
                        <p className="text-slate-400 mb-8 text-sm">Get tailored stock recommendations based on your unique criteria.</p>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                            {/* Investment Amount */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Total Investment Capacity</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <DollarSign className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10000"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Time Horizon */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Time Horizon (Years)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Clock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                                        <option value="">Select timeframe...</option>
                                        <option value="1">Short Term (0 - 2 Years)</option>
                                        <option value="5">Medium Term (3 - 7 Years)</option>
                                        <option value="10">Long Term (10+ Years)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preferred Sector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Market Sector</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Briefcase className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                                        <option value="">Select sector...</option>
                                        <option value="tech">Technology / AI</option>
                                        <option value="health">Healthcare & Bio</option>
                                        <option value="finance">Financial Services</option>
                                        <option value="energy">Energy & Renewables</option>
                                        <option value="diverse">Diversified (All Sectors)</option>
                                    </select>
                                </div>
                            </div>

                            <button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition group">
                                Analyze Market Data
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                            </button>

                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
