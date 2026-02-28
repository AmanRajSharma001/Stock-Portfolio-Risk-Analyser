"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Trash2, Building2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Placeholder interface
interface Asset {
    id: number
    ticker: string
    quantity: number
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [portfolio, setPortfolio] = useState<Asset[]>([])
    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login')
            } else {
                // Mock portfolio fetch success
                setTimeout(() => {
                    setPortfolio([
                        { id: 1, ticker: "AAPL", quantity: 15.5 },
                        { id: 2, ticker: "MSFT", quantity: 10.0 },
                        { id: 3, ticker: "GOOGL", quantity: 25.0 }
                    ])
                    setLoading(false)
                }, 500)
            }
        })

        return () => unsub()
    }, [router])

    const handleConnectPlaid = async () => {
        setConnecting(true)
        setTimeout(() => {
            setPortfolio([
                { id: 1, ticker: "AAPL", quantity: 15.5 },
                { id: 2, ticker: "MSFT", quantity: 10.0 },
                { id: 3, ticker: "GOOGL", quantity: 25.0 }
            ])
            setConnecting(false)
        }, 1000)
    }

    const handleDisconnect = async () => {
        setDeleting(true)
        setTimeout(() => {
            setPortfolio([])
            setDeleting(false)
        }, 500)
    }

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Intelligence Engine...</div>

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Portfolio Command Center</h1>
                        <p className="text-slate-400">Manage connections and view active assets.</p>
                    </div>

                    {portfolio.length > 0 && (
                        <button
                            onClick={handleDisconnect}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Disconnecting...' : 'Disconnect Broker'}
                        </button>
                    )}
                </div>

                {portfolio.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full border border-dashed border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-900/20"
                    >
                        <Building2 className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Portfolio Connected</h3>
                        <p className="text-slate-400 max-w-sm mb-8">Securely link your brokerage account via Plaid to import your active holdings and run risk intelligence.</p>

                        <button
                            onClick={handleConnectPlaid}
                            disabled={connecting}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition disabled:opacity-50"
                        >
                            {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                            Simulate Plaid Connection
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Input Section */}
                        <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-indigo-100">Live Connection Active</h3>
                                    <p className="text-indigo-300 text-sm">Brokerage sync successful. 3 assets imported.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Holdings Column */}
                            <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
                                <h3 className="text-lg font-bold mb-4">Current Holdings</h3>
                                <div className="space-y-4">
                                    {portfolio.map(asset => (
                                        <div key={asset.id} className="flex justify-between border-b border-slate-800 pb-2">
                                            <span className="font-semibold">{asset.ticker}</span>
                                            <span className="text-slate-400 text-sm">{asset.quantity.toFixed(2)} shares</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Analytics Grid */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="text-slate-400 text-sm mb-1">Annual Return</div>
                                    <div className="text-2xl font-bold text-emerald-400">24.50%</div>
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="text-slate-400 text-sm mb-1">Sharpe Ratio</div>
                                    <div className="text-2xl font-bold text-indigo-400">1.45</div>
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="text-slate-400 text-sm mb-1">Value at Risk (95%)</div>
                                    <div className="text-2xl font-bold">-2.10%</div>
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="text-slate-400 text-sm mb-1">Risk Classification</div>
                                    <div className="text-2xl font-bold text-yellow-500">Medium Risk</div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
