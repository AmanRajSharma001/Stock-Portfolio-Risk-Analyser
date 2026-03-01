"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup } from 'firebase/auth'
import axios from 'axios'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signInWithPopup(auth, googleProvider)

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: result.user.email,
                uid: result.user.uid
            })

            if (res.data.success) {
                localStorage.setItem('backend_user', JSON.stringify(res.data.user))
                router.push('/dashboard')
            }
        } catch (error: any) {
            console.error("Detailed Auth Error:", error)
            alert(`Authentication failed: ${error.message || "Unknown error"}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">

            <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white transition">
                &larr; Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mb-4">
                        <Database className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to MarketPlay</h2>
                    <p className="text-slate-400 text-sm">Sign in to access your quantitative dashboard</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
                        Continue with Google
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
