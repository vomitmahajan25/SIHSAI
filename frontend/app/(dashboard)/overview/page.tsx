'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Package,
  Calendar,
  AlertTriangle,
  Bot,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import RevenueExpenseChart from '@/components/charts/RevenueExpenseChart';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { DashboardSummary } from '@/types';
import { formatINR, formatDateIndian } from '@/lib/formatters';

export default function OverviewPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, trend] = await Promise.all([
        api.getDashboardSummary(),
        api.getFinanceTrend(6),
      ]);
      setData(summary);
      setTrendData(trend);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleCreated = () => fetchDashboard();
    window.addEventListener('gramvikas:transaction_created', handleCreated);
    return () => window.removeEventListener('gramvikas:transaction_created', handleCreated);
  }, []);

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sage animate-spin" />
        <p className="text-sm font-medium text-ink-secondary">Computing live business metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <Alert
          type="error"
          title="Connection Error"
          message={error}
        />
        <div className="mt-4 text-center">
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-light"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Business Header Banner */}
      <div className="bg-gradient-to-r from-forest via-forest-light to-sage rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href="/my-business"
          className="block rounded-xl -m-2 p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime transition-colors"
          aria-label="Open My Business profile"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-lime">
              Rural Enterprise Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {data?.business_name || 'My Business'}
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            Proprietor: <span className="text-white font-medium">{data?.user_name}</span> • Locality: {data?.locality}
          </p>
        </Link>

        {/* Financial Health Score Pill */}
        <Link
          href="/financial-health"
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime transition-colors"
          aria-label="Open Financial Health dashboard"
        >
          <ShieldCheck className="w-6 h-6 text-lime flex-shrink-0" />
          <div>
            <div className="text-xs text-white/70 font-medium">Financial Health</div>
            <div className="text-lg font-bold text-white flex items-baseline gap-1">
              <span>{data?.health_score || 50}</span>
              <span className="text-xs text-white/50">/100</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={data?.today_sales.formatted_value || '₹0.00'}
          subtitle="Recorded today"
          icon={TrendingUp}
          highlight={true}
        />
        <StatCard
          label="Today's Expenses"
          value={data?.today_expenses.formatted_value || '₹0.00'}
          subtitle="Stock & daily costs"
          icon={TrendingDown}
          isPositive={false}
        />
        <StatCard
          label="Month's Net Profit"
          value={data?.month_net_profit.formatted_value || '₹0.00'}
          subtitle={data?.month_net_profit.subtitle}
          icon={IndianRupee}
          trend={data?.month_net_profit.trend_percentage ? `${data.month_net_profit.trend_percentage.toFixed(1)}% margin` : undefined}
          isPositive={(data?.month_net_profit.value || 0) >= 0}
        />
        <StatCard
          label="Inventory Value"
          value={data?.inventory_value.formatted_value || '₹0.00'}
          subtitle="Recorded stock"
          icon={Package}
        />
      </div>

      {/* Secondary Snapshot Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-stroke flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-secondary">Current Month Revenue</p>
            <p className="text-lg font-bold text-ink-primary">{data?.month_revenue.formatted_value}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-sage/10 text-sage rounded-lg">Sales</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-stroke flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-secondary">Current Month Costs</p>
            <p className="text-lg font-bold text-ink-primary">{data?.month_expenses.formatted_value}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-rose-50 text-rose-700 rounded-lg">Operating + COGS</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-stroke flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-secondary">Recorded Active Debt</p>
            <p className="text-lg font-bold text-ink-primary">{data?.outstanding_debt.formatted_value}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-800 rounded-lg">Total Borrowed</span>
        </div>
      </div>

      {/* Charts & AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 6-Month Financial Trend Chart */}
        <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-stroke shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-ink-primary text-base">Monthly Revenue & Profit Trend</h3>
              <p className="text-xs text-ink-secondary">Derived from verified backend transaction logs</p>
            </div>
            <Link
              href="/financial-health"
              className="text-xs font-semibold text-sage hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RevenueExpenseChart data={trendData} />
        </div>

        {/* Right: AI Advisor Quick Widget */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-lime shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-ink-primary text-base">AI Advisory</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage/10 text-sage font-semibold">
                Personalized
              </span>
            </div>

            <div className="space-y-3">
              {data?.quick_tips && data.quick_tips.length > 0 ? (
                data.quick_tips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-canvas rounded-xl border border-stroke text-xs text-ink-primary leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-secondary">Record transactions to unlock personalized insights.</p>
              )}
            </div>
          </div>

          <Link
            href="/advisor"
            className="mt-5 w-full py-2.5 px-4 bg-forest hover:bg-forest-light text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Bot className="w-4 h-4 text-lime" />
            <span>Ask Business Advisor</span>
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions, Low Stock Alerts & Upcoming Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-surface rounded-2xl p-5 border border-stroke shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-ink-primary">Recent Khata Entries</h4>
            <Link href="/khata-book" className="text-xs text-sage font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {data?.recent_transactions && data.recent_transactions.length > 0 ? (
              data.recent_transactions.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-canvas flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-ink-primary">{t.description}</p>
                    <p className="text-[11px] text-ink-secondary">
                      {formatDateIndian(t.date)} • {t.category}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      t.transaction_type === 'sale' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {t.transaction_type === 'sale' ? '+' : '-'}
                    {formatINR(t.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-ink-secondary">
                No transactions recorded yet today.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-surface rounded-2xl p-5 border border-stroke shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-ink-primary">Low-Stock Warnings</h4>
            <Link href="/inventory" className="text-xs text-sage font-semibold hover:underline">
              Inventory
            </Link>
          </div>

          <div className="space-y-2">
            {data?.low_stock_alerts && data.low_stock_alerts.length > 0 ? (
              data.low_stock_alerts.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">{p.name}</p>
                      <p className="text-[10px] text-amber-700">
                        Remaining: {p.current_stock} (Min: {p.min_stock_threshold})
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/inventory"
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    Restock
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-ink-secondary">
                All inventory items are above safety thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Festivals */}
        <div className="bg-surface rounded-2xl p-5 border border-stroke shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-ink-primary">Upcoming Festivals</h4>
            <Link href="/festivals" className="text-xs text-sage font-semibold hover:underline">
              Calendar
            </Link>
          </div>

          <div className="space-y-2">
            {data?.upcoming_festivals && data.upcoming_festivals.length > 0 ? (
              data.upcoming_festivals.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-xl bg-canvas flex items-start gap-2.5 text-xs"
                >
                  <Calendar className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink-primary">{f.name}</p>
                    <p className="text-[10px] text-ink-secondary">
                      {formatDateIndian(f.date)} • {f.region}
                    </p>
                    <p className="text-[11px] text-sage line-clamp-1 mt-0.5">
                      {f.suggested_preparation}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-ink-secondary">
                No upcoming events recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
