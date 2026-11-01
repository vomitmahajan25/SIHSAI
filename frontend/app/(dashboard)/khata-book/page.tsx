'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  IndianRupee,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatINR, formatDateIndian } from '@/lib/formatters';

const CATEGORIES = [
  'All Categories',
  'Direct Sale',
  'Inventory Purchase',
  'Shop Rent',
  'Electricity & Utilities',
  'Transport & Logistics',
  'Labor & Wages',
  'Packaging & Supplies',
  'Loan Repayment / EMI',
  'Other Adjustment',
];

export default function KhataBookPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    transaction_type: 'sale',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Direct Sale',
    description: '',
    payment_method: 'Cash',
    counterparty: '',
  });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: 25 };
      if (search) params.search = search;
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.getTransactions(params);
      setTransactions(res.items);
      setTotalCount(res.total);
      setTotalIncome(res.total_income);
      setTotalExpense(res.total_expense);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, selectedCategory, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    if (!form.description) {
      setFormError('Please enter a short description.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.createTransaction({
        ...form,
        amount: parseFloat(form.amount),
        counterparty: form.counterparty || undefined,
      });
      setIsModalOpen(false);
      setForm({
        transaction_type: 'sale',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Direct Sale',
        description: '',
        payment_method: 'Cash',
        counterparty: '',
      });
      loadTransactions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recorded transaction?')) {
      try {
        await api.deleteTransaction(id);
        loadTransactions();
      } catch (err: any) {
        alert(err.message || 'Failed to delete transaction.');
      }
    }
  };

  const handleExportCSV = () => {
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
            Digital Khata Book (खाताबही)
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Log all cash, UPI, credit, and supplier transactions with complete accounting rigor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-stroke hover:bg-canvas text-xs font-semibold text-ink-primary transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-sage" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-lime" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Filtered Inflows (Sales / Income)</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatINR(totalIncome)}</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Filtered Outflows (Purchases / Expenses)</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{formatINR(totalExpense)}</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Net Operating Cash Balance</p>
          <p
            className={`text-xl font-bold mt-1 ${
              totalIncome - totalExpense >= 0 ? 'text-forest' : 'text-rose-700'
            }`}
          >
            {formatINR(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or customer / supplier name..."
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-forest-light transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-ink-secondary">
          <span className="font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 bg-canvas border border-stroke rounded-lg text-xs"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 bg-canvas border border-stroke rounded-lg text-xs"
          />
          {(startDate || endDate || search || selectedCategory !== 'All Categories') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearch('');
                setSelectedCategory('All Categories');
                setPage(1);
              }}
              className="text-sage font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-2xl border border-stroke shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-canvas border-b border-stroke text-ink-secondary font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Description & Counterparty</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Payment Mode</th>
                <th className="px-5 py-3 text-right">Amount (₹)</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-ink-secondary">
                    Loading Khata records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ink-secondary">
                    No transactions match the selected filters. Click "New Transaction" to add your first record!
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isIncome = ['sale', 'customer_payment_received', 'debt_received'].includes(
                    t.transaction_type
                  );

                  return (
                    <tr key={t.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-ink-secondary font-medium">
                        {formatDateIndian(t.date)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {t.transaction_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink-primary">{t.description}</p>
                        {t.counterparty && (
                          <p className="text-[11px] text-ink-secondary">With: {t.counterparty}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-ink-secondary">
                        {t.category}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-ink-secondary">
                        <span className="px-2 py-0.5 rounded bg-canvas border border-stroke text-[11px]">
                          {t.payment_method}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3.5 whitespace-nowrap text-right font-bold ${
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatINR(t.amount)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-ink-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-stroke bg-canvas/30 flex items-center justify-between text-xs text-ink-secondary">
          <span>Total Records: {totalCount}</span>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-stroke bg-surface hover:bg-canvas disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-ink-primary">Page {page}</span>
            <button
              disabled={transactions.length < 25}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-stroke bg-surface hover:bg-canvas disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Khata Entry"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Transaction Type *
            </label>
            <select
              value={form.transaction_type}
              onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            >
              <option value="sale">Sale / Business Income (+)</option>
              <option value="operating_expense">Operating Expense (Rent, Power, Wages) (-)</option>
              <option value="inventory_purchase">Inventory / Stock Purchase (-)</option>
              <option value="supplier_payment">Supplier Payment Due (-)</option>
              <option value="customer_payment_received">Customer Credit Received (+)</option>
              <option value="debt_received">Loan / Borrowed Debt Received (+ Cash Inflow)</option>
              <option value="debt_repayment">Loan Repayment / EMI (- Cash Outflow)</option>
              <option value="other_adjustment">Other Business Adjustment</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Amount (INR ₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 1250"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-sm font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Staples, Rent, Transport"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Payment Method
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                <option value="Cash">Cash (Galla)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Credit">Credit (Udhaari)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Evening grocery sales or Rice bag wholesale order"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Customer or Supplier Name (Optional)
            </label>
            <input
              type="text"
              value={form.counterparty}
              onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
              placeholder="e.g. Sharma ji, Gupta wholesaler"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Add to Khata'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
