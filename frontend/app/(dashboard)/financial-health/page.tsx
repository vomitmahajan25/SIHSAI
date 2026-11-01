'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  FileText,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { FinancialSummary } from '@/types';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { formatINR } from '@/lib/formatters';

export default function FinancialHealthPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFinancialSummary();
      setSummary(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial calculation summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleExportPDF = () => {
    window.open(api.getFinancePdfUrl(), '_blank');
  };

  if (loading && !summary) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sage animate-spin" />
        <p className="text-sm font-medium text-ink-secondary">Running Python calculation engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Financial Health & Calculation Engine
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Strict double-entry accounting formulas calculated securely on the server
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-lime" />
          <span>Download PDF Financial Report</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Health Score Hero Card */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-sage/10 text-sage flex items-center justify-center border border-sage/20 flex-shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sage">
                Composite Health Assessment
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary?.financial_health_score! >= 60
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {summary?.financial_health_status}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-ink-primary mt-1">
              {summary?.financial_health_score} <span className="text-base text-ink-secondary font-normal">/ 100</span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Timeframe: <span className="font-semibold text-ink-primary">{summary?.timeframe}</span>
            </p>
          </div>
        </div>

        {/* Break-Even Callout */}
        <div className="p-4 rounded-xl bg-canvas border border-stroke md:max-w-xs space-y-1">
          <p className="text-xs font-semibold text-ink-secondary">Monthly Break-Even Requirement</p>
          <p className="text-xl font-bold text-forest">{formatINR(summary?.break_even_monthly_revenue)}</p>
          <p className="text-[11px] text-ink-secondary">
            Daily sales of <span className="font-semibold text-sage">{formatINR(summary?.daily_break_even_sales)}</span> needed to cover fixed overheads.
          </p>
        </div>
      </div>

      {/* Core P&L Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatINR(summary?.total_revenue)}
          subtitle="Gross recorded sales"
          highlight={true}
        />
        <StatCard
          label="Cost of Goods (COGS)"
          value={formatINR(summary?.cogs)}
          subtitle="Inventory & supply inputs"
          isPositive={false}
        />
        <StatCard
          label="Operating Expenses"
          value={formatINR(summary?.operating_expenses)}
          subtitle="Rent, transport & utilities"
          isPositive={false}
        />
        <StatCard
          label="Net Profit"
          value={formatINR(summary?.net_profit)}
          subtitle={`${summary?.net_profit_margin_pct.toFixed(1)}% net profit margin`}
          isPositive={summary?.net_profit! >= 0}
        />
      </div>

      {/* Cash Flow vs Profit Distinction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stroke pb-3">
            <h3 className="font-bold text-sm text-ink-primary">Cash Flow Dynamics (Liquidity)</h3>
            <span className="text-xs text-ink-secondary">Inflows vs Outflows</span>
          </div>

          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex justify-between p-2.5 rounded-xl bg-canvas">
              <span className="text-ink-secondary">Total Cash Received (Sales + Loans)</span>
              <span className="font-bold text-emerald-700">{formatINR(summary?.cash_inflows)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-canvas">
              <span className="text-ink-secondary">Total Cash Paid (Stock + Expenses + EMI)</span>
              <span className="font-bold text-rose-700">{formatINR(summary?.cash_outflows)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-forest text-white font-bold">
              <span>Net Cash Flow Position</span>
              <span className="text-lime">{formatINR(summary?.net_cash_flow)}</span>
            </div>
          </div>

          <p className="text-[11px] text-ink-secondary italic">
            * Accounting Principle: Profit is not equal to cash in galla. Cash flow accounts for loan disbursements, supplier dues, and capital investments.
          </p>
        </div>

        {/* Balance Sheet Indicators */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stroke pb-3">
            <h3 className="font-bold text-sm text-ink-primary">Asset & Debt Snapshot</h3>
            <span className="text-xs text-ink-secondary">Current Balance</span>
          </div>

          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex justify-between p-2.5 rounded-xl bg-canvas">
              <span className="text-ink-secondary">Active Recorded Business Debt</span>
              <span className="font-bold text-amber-900">{formatINR(summary?.total_debt_outstanding)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-canvas">
              <span className="text-ink-secondary">Current Inventory Valuation</span>
              <span className="font-bold text-forest">{formatINR(summary?.inventory_valuation)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-canvas">
              <span className="text-ink-secondary">Estimated Working Capital Runway</span>
              <span className="font-bold text-ink-primary">
                {summary?.working_capital_runway_days?.toFixed(0)} Days
              </span>
            </div>
          </div>

          <p className="text-[11px] text-ink-secondary">
            Daily operational burn rate stands at <span className="font-semibold text-ink-primary">{formatINR(summary?.burn_rate_daily)}</span>/day.
          </p>
        </div>
      </div>

      {/* Key Strategic Recommendations */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-sage" />
          <h3 className="font-bold text-sm md:text-base text-ink-primary">
            Server Financial Engine Recommendations
          </h3>
        </div>

        <div className="space-y-2.5">
          {summary?.key_recommendations && summary.key_recommendations.length > 0 ? (
            summary.key_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-canvas border border-stroke flex items-start gap-3 text-xs md:text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                <span className="text-ink-primary leading-relaxed">{rec}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-ink-secondary">
              Record daily transactions to unlock customized financial recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
