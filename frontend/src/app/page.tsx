"use client"

import { motion, Variants } from 'framer-motion'
import { ShieldCheck, TrendingUp, Cpu, PieChart, ArrowRight, Activity, ChevronRight, BarChart3, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Framer Motion variants for staggered reveals
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 -left-64 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
      <div className="absolute bottom-0 -right-64 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl shadow-indigo-500/10 mb-8 cursor-default group hover:border-indigo-500/40 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">MarketPlay 2.0 is Live</span>
            <span className="mx-2 h-3 w-[1px] bg-slate-700" />
            <span className="text-sm font-medium text-indigo-400 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
              Read announcement <ChevronRight className="w-3 h-3 translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform" />
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-white relative z-10">
            Institutional edge, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">democratized.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Stop guessing with your retail portfolio. Deploy quantitative Monte Carlo simulations, AI risk classification, and deep portfolio analytics used by top hedge funds.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />

            <Link href="/login" className="w-full relative">
              <button className="relative w-full px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
                Start Analyzing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full border-y border-slate-900 bg-slate-950/50 backdrop-blur-sm py-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <p className="text-sm text-slate-500 font-semibold tracking-widest uppercase mb-6">Powered by industry-leading technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-xl"><Activity className="w-6 h-6" /> STRYK</div>
            <div className="flex items-center gap-2 font-black text-xl"><BarChart3 className="w-6 h-6" /> QUONT</div>
            <div className="flex items-center gap-2 font-black text-xl"><LockKeyhole className="w-6 h-6" /> VULCAN</div>
          </div>
        </div>
      </motion.div>

      {/* Features Showcase */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Precision tools for modern markets</h2>
          <p className="text-slate-400 text-lg">Everything you need to analyze, manage, and scale your wealth.</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
            title="Real-time Metrics"
            description="Live calculations for Sharpe Ratio, Beta, Volatility, and 95% Value at Risk."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-indigo-400" />}
            title="Monte Carlo Paths"
            description="Run thousands of simulations instantly to map your 5% worst-case future scenario."
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6 text-purple-400" />}
            title="ML Risk Profiling"
            description="Random Forest models classify your toxic assets and flag diversification holes automatically."
          />
          <FeatureCard
            icon={<PieChart className="w-6 h-6 text-amber-400" />}
            title="Plaid Integrations"
            description="Connect your brokerage seamlessly to import and analyze live equity holdings."
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm relative z-10 w-full mt-24">
        <p className="font-medium">MarketPlay AI Risk Analyzer. Built with Next.js & Framer Motion.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 shadow-inner group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] transition-all">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  )
}
