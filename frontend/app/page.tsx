'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Bot,
  BookOpen,
  Landmark,
  ArrowRight,
  Package,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getSession } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session && session.token) {
      setHasSession(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-lime selection:text-forest">
      {/* Top Navigation Bar */}
      <nav className="h-20 border-b border-stroke bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-md">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-forest tracking-tight">GramVikas</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest text-lime font-bold">AI</span>
              </div>
              <p className="text-[10px] text-ink-secondary -mt-0.5 font-medium">Your Business. Your Growth.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-sage/10 text-sage border border-sage/20">
              SIH 2026 • PS 10091 • Team 6-ByTES
            </span>

            {hasSession ? (
              <Link
                href="/overview"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs md:text-sm font-semibold shadow-sm transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-lime" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-canvas rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs md:text-sm font-semibold shadow-sm transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-lime" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-stroke text-xs font-semibold text-sage shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Hyper-Local Business Advisory for Rural Micro-Entrepreneurs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-forest tracking-tight leading-[1.15]">
            Empowering Every Rural Vendor to{' '}
            <span className="text-sage underline decoration-lime decoration-4 underline-offset-8">
              Grow & Thrive
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Eliminate predatory moneylenders, track daily cash sales, monitor true profit margins, and unlock government schemes (MUDRA, PM SVANidhi) with India's dedicated AI business co-pilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-white text-sm font-semibold shadow-md transition-all group"
            >
              <span>Create Free Business Profile</span>
              <ArrowRight className="w-4 h-4 text-lime group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-canvas border border-stroke text-ink-primary text-sm font-semibold shadow-2xs transition-all"
            >
              Live Demo Sign In
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-forest tracking-tight">
              Comprehensive Financial Operating System
            </h2>
            <p className="text-xs md:text-sm text-ink-secondary mt-1">
              Engineered specifically for the Indian rural commerce environment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">Digital Khata Book</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Log cash, UPI, customer credit (udhaar), and supplier purchases in seconds. Export certified CSV reports with date filtering.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">Financial Health Engine</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Server-side financial calculations: Gross/Net Profit, Cash Flow vs Profit distinction, daily break-even turnover, and PDF reports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">AI Business Advisor</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                24/7 hyper-local assistant powered by Gemini API with deterministic fallback. Contextualized with your business profile and Khata records.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">Schemes & Loans Guidance</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Discover verified schemes (PM SVANidhi, MUDRA, PM Vishwakarma) with interactive eligibility checks and official portal links.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">Smart Inventory & Alerts</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Track products, calculate margins, protect against negative stock, and receive automatic replenishment warnings before shortages hit.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-xs space-y-3 hover:border-sage/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink-primary">12-Section Business Plan</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Generate bank-ready 3-year expansion proposals and download formatted PDFs for priority sector bank loan applications.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stroke py-8 px-4 sm:px-8 bg-surface text-xs text-ink-secondary">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-sage" />
            <span className="font-bold text-ink-primary">GramVikas AI</span>
            <span>— Smart India Hackathon 2026 (PS 10091)</span>
          </div>

          <div className="flex items-center gap-4 text-ink-secondary">
            <span>Team 6-ByTES</span>
            <span>•</span>
            <span>Team ID: 178837</span>
            <span>•</span>
            <span>Theme: AI Financial Advisor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
