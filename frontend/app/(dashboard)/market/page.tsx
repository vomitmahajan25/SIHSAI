'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Users,
  Store,
  Truck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MarketInsights, MarketObservation } from '@/types';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { formatINR } from '@/lib/formatters';

export default function MarketPage() {
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [observations, setObservations] = useState<MarketObservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Record observation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    state: 'Maharashtra',
    district: 'Solapur',
    city_village: 'Solapur',
    locality: 'Shivaji Chowk',
    category: 'Kirana Store',
    competitor_name: '',
    observed_product: '',
    observed_price: '',
    supplier_name: '',
    supplier_details: '',
    customer_segment_notes: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const [ins, obs] = await Promise.all([
        api.getMarketInsights(),
        api.getMarketObservations(),
      ]);
      setInsights(ins);
      setObservations(obs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  const handleRecordObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.observed_product) return;

    setSubmitting(true);
    try {
      await api.recordMarketObservation({
        ...form,
        observed_price: form.observed_price ? parseFloat(form.observed_price) : undefined,
      });
      setIsModalOpen(false);
      setForm({
        state: 'Maharashtra',
        district: 'Solapur',
        city_village: 'Solapur',
        locality: 'Shivaji Chowk',
        category: 'Kirana Store',
        competitor_name: '',
        observed_product: '',
        observed_price: '',
        supplier_name: '',
        supplier_details: '',
        customer_segment_notes: '',
        notes: '',
      });
      fetchMarket();
    } catch (err: any) {
      alert(err.message || 'Failed to record market observation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Hyper-Local Market Intelligence
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Locality benchmarking, customer segmentation, competitor observations & supplier discovery
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Record Market Observation</span>
        </button>
      </div>

      <Alert
        type="info"
        title="Telemetry Data Source Notice"
        message="Market insights combine verified rural retail benchmarks, district-level seasonal trade trends, and your recorded survey visits. Not a speculative prediction."
      />

      {/* Market Overview Card */}
      {insights && (
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
                {insights.locality}, {insights.district} ({insights.state})
              </span>
              <h3 className="text-lg font-bold text-ink-primary mt-0.5">
                {insights.category} Market Landscape
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sage/10 text-sage text-xs font-semibold">
              Live Field Intelligence
            </span>
          </div>

          <p className="text-xs md:text-sm text-ink-secondary leading-relaxed bg-canvas p-4 rounded-xl border border-stroke">
            {insights.overview}
          </p>

          {/* Grid of Segments, Competitors, Suppliers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Customer Segments */}
            <div className="p-4 rounded-xl border border-stroke bg-canvas/30 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4 text-sage" />
                <span>Customer Segments</span>
              </div>
              <ul className="text-xs text-ink-secondary space-y-1.5">
                {insights.potential_customer_segments.map((seg, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-sage font-bold">•</span>
                    <span>{seg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor Dynamics */}
            <div className="p-4 rounded-xl border border-stroke bg-canvas/30 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
                <Store className="w-4 h-4 text-sage" />
                <span>Competitor Observations</span>
              </div>
              <ul className="text-xs text-ink-secondary space-y-1.5">
                {insights.competitor_observations.map((comp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-sage font-bold">•</span>
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supplier Discovery */}
            <div className="p-4 rounded-xl border border-stroke bg-canvas/30 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
                <Truck className="w-4 h-4 text-sage" />
                <span>Supplier Discovery</span>
              </div>
              <ul className="text-xs text-ink-secondary space-y-1.5">
                {insights.supplier_discovery_tips.map((sup, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-sage font-bold">•</span>
                    <span>{sup}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="pt-3 border-t border-stroke">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-sage" />
              <span>Recommended Next Steps in this Locality:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {insights.suggested_actions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-canvas text-ink-primary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User-Logged Field Observations */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
        <h3 className="font-bold text-base text-ink-primary">
          Your Recorded Field Observations ({observations.length})
        </h3>

        {observations.length === 0 ? (
          <p className="text-xs text-ink-secondary py-4 text-center">
            No local surveys recorded yet. Record observed retail prices or wholesaler terms to build a rich competitive database.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {observations.map((obs) => (
              <div key={obs.id} className="p-4 rounded-xl bg-canvas border border-stroke text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink-primary">{obs.observed_product}</span>
                  {obs.observed_price && (
                    <span className="font-extrabold text-forest">{formatINR(obs.observed_price)}</span>
                  )}
                </div>
                {obs.competitor_name && (
                  <p className="text-ink-secondary">Observed at: {obs.competitor_name}</p>
                )}
                {obs.supplier_name && (
                  <p className="text-sage font-medium">Supplier: {obs.supplier_name}</p>
                )}
                {obs.notes && (
                  <p className="text-ink-secondary text-[11px] pt-1 border-t border-stroke/70">
                    {obs.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Observation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Local Market Observation"
      >
        <form onSubmit={handleRecordObservation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Product / Item Observed *
              </label>
              <input
                type="text"
                required
                value={form.observed_product}
                onChange={(e) => setForm({ ...form, observed_product: e.target.value })}
                placeholder="e.g. Loose Chana Dal 1kg"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Observed Retail Price (₹)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.observed_price}
                onChange={(e) => setForm({ ...form, observed_price: e.target.value })}
                placeholder="105"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Competitor Name / Location
              </label>
              <input
                type="text"
                value={form.competitor_name}
                onChange={(e) => setForm({ ...form, competitor_name: e.target.value })}
                placeholder="e.g. Village Chowk Grocer"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Wholesaler / Supplier Discovered
              </label>
              <input
                type="text"
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                placeholder="e.g. APMC Mandi Shed #4"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Field Survey Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Wholesaler offers 3% discount on purchases above 5 sacks with immediate cash payment"
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
              {submitting ? 'Saving...' : 'Save Observation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
