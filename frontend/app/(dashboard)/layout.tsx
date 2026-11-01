'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import Modal from '@/components/ui/Modal';
import { getSession } from '@/lib/auth';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickModal, setQuickModal] = useState<'sale' | 'expense' | null>(null);

  // Quick transaction form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Direct Sale');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [counterparty, setCounterparty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.token) {
      router.push('/login');
    }
  }, [router]);

  const handleOpenQuick = (type: 'sale' | 'expense' | 'product') => {
    if (type === 'sale') {
      setQuickModal('sale');
      setCategory('Direct Sale');
      setDescription('Daily counter sale');
    } else if (type === 'expense') {
      setQuickModal('expense');
      setCategory('Inventory Purchase');
      setDescription('Wholesale supplies procurement');
    } else {
      router.push('/inventory');
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.createTransaction({
        transaction_type: quickModal === 'sale' ? 'sale' : 'operating_expense',
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        category,
        description,
        payment_method: paymentMethod,
        counterparty: counterparty || undefined,
      });

      setQuickModal(null);
      setAmount('');
      setDescription('');
      setCounterparty('');
      // Trigger refresh on active page
      window.dispatchEvent(new CustomEvent('gramvikas:transaction_created'));
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title="GramVikas AI"
          onOpenSidebar={() => setSidebarOpen(true)}
          onQuickAdd={handleOpenQuick}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={quickModal !== null}
        onClose={() => setQuickModal(null)}
        title={quickModal === 'sale' ? 'Record New Sale (Bikri)' : 'Record New Expense (Kharch)'}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Amount (INR ₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 850"
              className="w-full text-lg font-bold px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                <option value="Cash">Cash (Galla)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Bank Transfer">Bank Transfer</option>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Items or services description"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Customer / Supplier Name (Optional)
            </label>
            <input
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Sharma ji / APMC Wholesale"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickModal(null)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to Khata'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
