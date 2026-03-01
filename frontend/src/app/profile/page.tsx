"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, updateProfile, User, signOut } from 'firebase/auth'
import { Camera, Save, X, LogOut, User as UserIcon, Keyboard, Fingerprint, Settings2, Target, Clock, ShieldAlert, Cpu } from 'lucide-react'
import axios from 'axios'

interface UserPreferences {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    investmentHorizon: "short" | "medium" | "long";
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    // Form States
    const [displayName, setDisplayName] = useState("")
    const [prefs, setPrefs] = useState<UserPreferences>({
        riskTolerance: "moderate",
        investmentHorizon: "medium"
    })
    const [savedPortfolios, setSavedPortfolios] = useState<any[]>([])

    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login')
            } else {
                setUser(currentUser)
                setDisplayName(currentUser.displayName || "")

                // Fetch existing preferences from our new SQL Database
                try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const res = await axios.get(`${API_URL}/api/users/${currentUser.uid}`, { timeout: 4000 });
                    if (res.data.success && res.data.data) {
                        setPrefs({
                            riskTolerance: res.data.data.riskTolerance || "moderate",
                            investmentHorizon: res.data.data.investmentHorizon || "medium"
                        });
                    }

                    // Fetch saved AI portfolios
                    const savedRes = await axios.get(`${API_URL}/api/saved/${currentUser.uid}`);
                    if (savedRes.data.success) {
                        setSavedPortfolios(savedRes.data.data);
                    }
                } catch (e) {
                    console.warn("Could not load SQL user preferences (offline or timed out), defaulting to moderate risk: ", e)
                }

                setLoading(false)
            }
        })
        return () => unsub()
    }, [router])

    const handleSave = async () => {
        if (!user) return
        try {
            await updateProfile(user, { displayName })

            // Update SQL Database Preferences
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.post(`${API_URL}/api/users`, {
                uid: user.uid,
                displayName: displayName,
                riskTolerance: prefs.riskTolerance,
                investmentHorizon: prefs.investmentHorizon
            });

            setIsEditing(false)
        } catch (error) {
            console.error("Error updating profile", error)
            alert("Failed to save profile changes to SQL Database.")
        }
    }

    const deletePortfolio = async (id: number) => {
        if (!user) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.delete(`${API_URL}/api/saved/${id}`, { data: { uid: user.uid } });
            setSavedPortfolios(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error("Failed to delete", e);
            alert("Failed to delete portfolio.")
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        localStorage.removeItem('backend_user')
        router.push('/')
    }

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">Loading Profile Data...</div>

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shadow-inner shadow-rose-500/20">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-fuchsia-400">Account Configurations</h1>
                            <p className="text-neutral-400 text-sm">Manage your operational identity and institutional risk limits.</p>
                        </div>
                    </div>

                    <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-3xl overflow-hidden relative shadow-2xl shadow-rose-500/5">
                        {/* Generic Profile Banner */}
                        <div className="h-40 bg-gradient-to-r from-rose-900/40 via-fuchsia-900/40 to-amber-900/30 relative border-b border-neutral-800">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-8 pb-8">

                            {/* Avatar */}
                            <div className="relative -mt-16 mb-8 flex items-end justify-between">
                                <div className="relative group cursor-pointer inline-block">
                                    <div className="w-32 h-32 rounded-full border-4 border-neutral-950 bg-neutral-800 overflow-hidden flex items-center justify-center relative shadow-xl">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-12 h-12 text-neutral-500" />
                                        )}
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="w-6 h-6 text-white mb-1" />
                                                <span className="text-[10px] uppercase tracking-wider font-bold">Update</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium transition"
                                    >
                                        Edit Parameters
                                    </button>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6 max-w-xl"
                                    >
                                        {/* Identity Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold border-b border-neutral-800 pb-2">Identity Details</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-400 mb-2">Display Name</label>
                                                <div className="relative">
                                                    <Keyboard className="absolute top-3 left-4 w-5 h-5 text-neutral-500" />
                                                    <input
                                                        type="text"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address (Read-only)</label>
                                                <div className="relative">
                                                    <Fingerprint className="absolute top-3 left-4 w-5 h-5 text-neutral-600" />
                                                    <input
                                                        type="text"
                                                        value={user?.email || ""}
                                                        disabled
                                                        className="w-full bg-neutral-950/50 text-neutral-400 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Institutional Preferences */}
                                        <div className="space-y-4 pt-4">
                                            <h3 className="text-lg font-bold border-b border-neutral-800 pb-2">Risk Parameters</h3>

                                            <div>
                                                <label className="block text-sm font-medium text-neutral-400 mb-2">Portfolio Risk Tolerance</label>
                                                <div className="relative">
                                                    <ShieldAlert className="absolute top-3 left-4 w-5 h-5 text-neutral-500" />
                                                    <select
                                                        value={prefs.riskTolerance}
                                                        onChange={(e) => setPrefs({ ...prefs, riskTolerance: e.target.value as any })}
                                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                                                    >
                                                        <option value="conservative">Conservative (Capital Preservation)</option>
                                                        <option value="moderate">Moderate (Balanced Yield)</option>
                                                        <option value="aggressive">Aggressive (Maximum Alpha)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-neutral-400 mb-2">Time Horizon Strategy</label>
                                                <div className="relative">
                                                    <Clock className="absolute top-3 left-4 w-5 h-5 text-neutral-500" />
                                                    <select
                                                        value={prefs.investmentHorizon}
                                                        onChange={(e) => setPrefs({ ...prefs, investmentHorizon: e.target.value as any })}
                                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                                                    >
                                                        <option value="short">Short Term (0 - 2 Years)</option>
                                                        <option value="medium">Medium Term (3 - 7 Years)</option>
                                                        <option value="long">Long Term (10+ Years)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 flex gap-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                                            >
                                                <Save className="w-5 h-5" /> Commit Changes
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition flex items-center gap-2"
                                            >
                                                <X className="w-5 h-5" /> Discard
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-8"
                                    >
                                        {/* View Identity */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-neutral-800/50">
                                            <div>
                                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Display Name</h3>
                                                <p className="text-xl font-medium">{user?.displayName || "Stock Investor"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Primary Email</h3>
                                                <p className="text-xl font-medium text-neutral-300">{user?.email}</p>
                                            </div>
                                        </div>

                                        {/* View Risk Prefs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4" /> Risk Tolerance
                                                </h3>
                                                <div className="inline-flex px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-rose-300 font-medium capitalize">
                                                    {prefs.riskTolerance}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> Investment Horizon
                                                </h3>
                                                <div className="inline-flex px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-fuchsia-300 font-medium capitalize">
                                                    {prefs.investmentHorizon} Term
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Saved Portfolios from SQL */}
                                        <div className="pt-8 border-t border-neutral-800">
                                            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Cpu className="w-4 h-4" /> AI Generated Portfolios
                                            </h3>

                                            {savedPortfolios.length === 0 ? (
                                                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl text-center text-sm text-neutral-500">
                                                    No portfolios saved to the SQL database yet. Run an analysis on the Dashboard!
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {savedPortfolios.map(p => (
                                                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col justify-between">
                                                            <div>
                                                                <div className="text-xs text-fuchsia-400 font-bold mb-1">{new Date(p.createdAt).toLocaleDateString()}</div>
                                                                <h4 className="font-bold mb-2">{p.portfolioName}</h4>
                                                                <div className="text-sm text-neutral-400">
                                                                    {p.allocationData.map((a: any) => a.symbol).join(', ')}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 flex gap-2">
                                                                <button onClick={() => deletePortfolio(p.id)} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition font-medium">Delete</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="pt-8 mt-8 border-t border-neutral-800">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition"
                                            >
                                                <LogOut className="w-5 h-5" /> Sign Out Session
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
