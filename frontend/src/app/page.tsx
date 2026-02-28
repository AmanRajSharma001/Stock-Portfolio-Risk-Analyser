"use client"

import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Cpu, PieChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            MarketPlay 2.0 is Live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AI-Powered Institutional <br />
            <span className="text-indigo-400">Stock Risk Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Stop guessing with your retail portfolio. Deploy quantitative Monte Carlo simulations, AI risk classification, and deep portfolio analytics used by top hedge funds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="group px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all flex items-center gap-2 w-full justify-center">
                Start Analyzing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="#features">
              <button className="px-8 py-4 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-semibold transition-all w-full">
                View Features
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-emerald-400" />}
            title="Real-time Metrics"
            description="Live calculations for Sharpe Ratio, Beta, Volatility, and 95% Value at Risk."
            delay={0.1}
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-indigo-400" />}
            title="Monte Carlo Paths"
            description="Run thousands of simulations instantly to map your 5% worst-case future scenario."
            delay={0.2}
          />
          <FeatureCard
            icon={<Cpu className="w-8 h-8 text-purple-400" />}
            title="ML Risk Profiling"
            description="Random Forest models classify your toxic assets and flag diversification holes automatically."
            delay={0.3}
          />
          <FeatureCard
            icon={<PieChart className="w-8 h-8 text-amber-400" />}
            title="Plaid Integrations"
            description="Connect your brokerage seamlessly to import and analyze live equity holdings."
            delay={0.4}
          />
        </div>
      </section>

      {/* Dummy Pricing */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center border-t border-slate-800/50">
        <h2 className="text-3xl font-bold mb-4">Enterprise Power, Retail Price.</h2>
        <p className="text-slate-400 mb-12">Choose the intelligence tier that matches your portfolio velocity.</p>
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h3 className="text-xl font-bold mb-2">Basic Retail</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <ul className="space-y-3 text-slate-400 mb-8">
              <li>✓ Basic Analytics</li>
              <li>✓ 1 Sandbox Portfolio</li>
              <li>✓ Standard ML Analysis</li>
            </ul>
            <Link href="/login">
              <button className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition">Get Started</button>
            </Link>
          </div>
          <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
            <h3 className="text-xl font-bold mb-2">Institutional Pro</h3>
            <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <ul className="space-y-3 text-slate-400 mb-8">
              <li>✓ Real-Time Monte Carlo</li>
              <li>✓ Unlimited Portfolios</li>
              <li>✓ Advanced Plaid API Sync</li>
              <li>✓ AI Shock Scenario Slider</li>
            </ul>
            <Link href="/login">
              <button className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold transition">Upgrade to Pro</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>MarketPlay AI Risk Analyzer. Designed for the 2026 Hackathon.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors"
    >
      <div className="mb-4 bg-slate-950 inline-block p-3 rounded-xl border border-slate-800">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-slate-200">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
