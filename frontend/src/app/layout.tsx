import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Chatbot from '@/components/Chatbot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MarketPlay - AI Stock Analyzer',
  description: 'AI-Powered Institutional Stock Risk Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-neutral-950 text-neutral-50 min-h-screen selection:bg-fuchsia-500/30 overflow-x-hidden relative`}>
        {/* Global ambient background glow - Vibrant, warmer tones */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/15 via-neutral-950 to-neutral-950 -z-50 pointer-events-none" />

        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `
        }}></script>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

        {children}
        <Chatbot />
      </body>
    </html>
  )
}
