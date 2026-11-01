'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { FinancialSummary } from '@/types';
import { formatINR } from '@/lib/formatters';

export default function ReportsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.getFinancialSummary(params);
      setSummary(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  const handleDownloadPDF = () => {
    let url = api.getFinancePdfUrl();
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleDownloadCSV = () => {
    let url = api.getExportCsvUrl();
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Financial Statements & Export Hub
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Download certified Profit & Loss statements, Cash Flow summaries, and CSV data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-stroke text-ink-primary text-xs font-semibold hover:bg-canvas transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-sage" />
            <span>Export Transactions CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-lime" />
            <span>Generate PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
        <span className="font-semibold text-ink-primary flex items-center gap-1">
          <Calendar className="w-4 h-4 text-sage" /> Statement Period:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-1.5 bg-canvas border border-stroke rounded-xl text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-1.5 bg-canvas border border-stroke rounded-xl text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage"
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-sage font-semibold hover:underline ml-auto"
          >
            Reset to Current Month
          </button>
        )}
      </div>

      {/* Statement Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit & Loss Statement */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke">
            <h3 className="font-bold text-sm text-ink-primary">Statement of Profit & Loss</h3>
            <span className="text-xs text-ink-secondary font-medium">All values in INR (₹)</span>
          </div>

          <div className="space-y-2.5 text-xs md:text-sm">
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Recorded Gross Revenue / Sales</span>
              <span className="font-bold text-forest">{formatINR(summary?.total_revenue)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Cost of Goods Sold (Inventory Purchases)</span>
              <span className="font-medium text-ink-secondary">{formatINR(summary?.cogs)}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-canvas px-3 rounded-xl font-bold">
              <span className="text-forest">Gross Profit</span>
              <span className="text-forest">{formatINR(summary?.gross_profit)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Operating Expenses (Rent, Utilities, Wages)</span>
              <span className="font-medium text-rose-700">{formatINR(summary?.operating_expenses)}</span>
            </div>
            <div className="flex justify-between py-3 bg-forest px-3.5 rounded-xl font-bold text-white text-sm">
              <span>Net Profit (PAT)</span>
              <span className="text-lime">{formatINR(summary?.net_profit)}</span>
            </div>
            <div className="flex justify-between py-1 text-xs text-ink-secondary">
              <span>Net Profit Margin (%)</span>
              <span className="font-bold text-forest">{summary?.net_profit_margin_pct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Balance & Cash Flow Summary */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke">
            <h3 className="font-bold text-sm text-ink-primary">Cash Flow & Capital Structure</h3>
            <span className="text-xs text-ink-secondary font-medium">Current Position</span>
          </div>

          <div className="space-y-2.5 text-xs md:text-sm">
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Total Cash Inflows</span>
              <span className="font-bold text-emerald-700">{formatINR(summary?.cash_inflows)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Total Cash Outflows</span>
              <span className="font-bold text-rose-700">{formatINR(summary?.cash_outflows)}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-canvas px-3 rounded-xl font-bold">
              <span className="text-ink-primary">Net Cash Flow</span>
              <span className={summary?.net_cash_flow! >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {formatINR(summary?.net_cash_flow)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Current Stock / Inventory Valuation</span>
              <span className="font-bold text-forest">{formatINR(summary?.inventory_valuation)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stroke/60">
              <span className="text-ink-secondary">Recorded Outstanding Business Debt</span>
              <span className="font-bold text-amber-900">{formatINR(summary?.total_debt_outstanding)}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-canvas px-3 rounded-xl">
              <span className="text-ink-secondary">Monthly Break-Even Turnover Needed</span>
              <span className="font-bold text-forest">{formatINR(summary?.break_even_monthly_revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
