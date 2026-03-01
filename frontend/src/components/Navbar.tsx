"use client"

import Link from 'next/link'
import { Activity, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, signOut } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [language, setLanguage] = useState("en")
    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })

        // Load saved language
        const savedLang = localStorage.getItem('marketplay_lang')
        if (savedLang) {
            setLanguage(savedLang)
        }

        return () => unsub()
    }, [])

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value
        setLanguage(newLang)
        localStorage.setItem('marketplay_lang', newLang)

        // Clear existing cookies
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;

        if (newLang !== 'en') {
            // Set the Google Translate cookie
            document.cookie = `googtrans=/en/${newLang}; path=/;`;
            document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
        }

        // Attempt instant dynamic translation
        const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (gtCombo) {
            gtCombo.value = newLang === 'en' ? '' : newLang;
            gtCombo.dispatchEvent(new Event('change'));
        } else {
            window.location.reload();
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        localStorage.removeItem('backend_user')
        setUser(null)
        router.push('/')
    }

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-rose-500 p-1.5 rounded-lg group-hover:bg-rose-400 transition shadow-lg shadow-rose-500/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white group-hover:text-rose-100 transition-colors">MarketPlay</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Localization Selector */}
                    <div className="relative group flex items-center bg-neutral-900/50 border border-neutral-800 rounded-full px-3 py-1.5 transition hover:border-fuchsia-500/50">
                        <Globe className="w-4 h-4 text-neutral-400 mr-2" />
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-transparent text-xs font-bold text-neutral-300 focus:outline-none appearance-none pr-4 cursor-pointer"
                        >
                            <option value="en" className="bg-neutral-900">English</option>
                            <option value="es" className="bg-neutral-900">Español</option>
                            <option value="fr" className="bg-neutral-900">Français</option>
                            <option value="de" className="bg-neutral-900">Deutsch</option>
                            <option value="zh-CN" className="bg-neutral-900">中文 (Chinese)</option>
                            <option value="ja" className="bg-neutral-900">日本語 (Japanese)</option>
                            <option value="hi" className="bg-neutral-900">हिन्दी (Hindi)</option>
                            <option value="ar" className="bg-neutral-900">العربية (Arabic)</option>
                            <option value="pt" className="bg-neutral-900">Português</option>
                            <option value="ru" className="bg-neutral-900">Русский</option>
                        </select>
                    </div>

                    {user ? (
                        <>
                            <Link href="/dashboard">
                                <button className="text-sm font-medium px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-full transition">
                                    Dashboard
                                </button>
                            </Link>
                            <Link href="/profile">
                                <button className="text-sm font-medium px-4 py-2 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-full border border-transparent hover:border-rose-500/20 transition">
                                    Profile
                                </button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="text-sm font-medium px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-full transition shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
