"use client"

import Link from 'next/link'
import { Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, signOut } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsub()
    }, [])

    const handleLogout = async () => {
        await signOut(auth)
        localStorage.removeItem('backend_user')
        setUser(null)
        router.push('/')
    }

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-500 p-1.5 rounded-lg group-hover:bg-indigo-400 transition">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">MarketPlay</span>
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-slate-300 mr-2">{user.email}</span>
                            <Link href="/dashboard">
                                <button className="text-sm font-medium text-slate-300 hover:text-white transition">
                                    Dashboard
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="text-sm font-medium px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full transition">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
