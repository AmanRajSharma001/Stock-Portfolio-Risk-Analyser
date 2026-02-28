"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { auth, signOut } from '@/lib/firebase'
import { onAuthStateChanged, updateProfile, User } from 'firebase/auth'
import { Camera, Save, X, LogOut, User as UserIcon, Keyboard, Fingerprint, Settings2 } from 'lucide-react'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [displayName, setDisplayName] = useState("")
    const [theme, setTheme] = useState<"dark" | "system">("dark")
    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login')
            } else {
                setUser(currentUser)
                setDisplayName(currentUser.displayName || "")
                setLoading(false)
            }
        })
        return () => unsub()
    }, [router])

    const handleSave = async () => {
        if (!user) return
        try {
            await updateProfile(user, { displayName })
            setIsEditing(false)
            // Force a rough UI refresh
            location.reload()
        } catch (error) {
            console.error("Error updating profile", error)
            alert("Failed to update profile out of rate limits.")
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        localStorage.removeItem('backend_user')
        router.push('/')
    }

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Profile Data...</div>

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Account Settings</h1>
                            <p className="text-slate-400 text-sm">Manage your risk profile and general preferences.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden relative">
                        {/* Generic Profile Banner */}
                        <div className="h-40 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 relative border-b border-slate-800">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-8 pb-8">

                            {/* Avatar */}
                            <div className="relative -mt-16 mb-8 flex items-end justify-between">
                                <div className="relative group cursor-pointer inline-block">
                                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center relative">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-12 h-12 text-slate-500" />
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
                                        className="px-6 py-2.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-medium transition"
                                    >
                                        Edit Profile
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
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                                            <div className="relative">
                                                <Keyboard className="absolute top-3 left-4 w-5 h-5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address (Read-only)</label>
                                            <div className="relative">
                                                <Fingerprint className="absolute top-3 left-4 w-5 h-5 text-slate-600" />
                                                <input
                                                    type="text"
                                                    value={user?.email || ""}
                                                    disabled
                                                    className="w-full bg-slate-950/50 text-slate-400 border border-slate-800 rounded-xl py-3 pl-12 pr-4 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">Contact enterprise support to migrate your institutional email.</p>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
                                            >
                                                <Save className="w-5 h-5" /> Save Changes
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-2"
                                            >
                                                <X className="w-5 h-5" /> Cancel
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Display Name</h3>
                                                <p className="text-xl font-medium">{user?.displayName || "Stock Investor"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Email</h3>
                                                <p className="text-xl font-medium">{user?.email}</p>
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="pt-8 mt-8 border-t border-slate-800/50">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition"
                                            >
                                                <LogOut className="w-5 h-5" /> Sign Out Device
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
