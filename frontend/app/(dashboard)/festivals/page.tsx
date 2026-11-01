'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';
import { FestivalEvent } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatDateIndian } from '@/lib/formatters';

export default function FestivalsPage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    date: '',
    region: 'National',
    category: 'Cultural',
    suggested_preparation: '',
    inventory_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getFestivals();
      setEvents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) return;

    setSubmitting(true);
    try {
      await api.createFestival(form);
      setIsModalOpen(false);
      setForm({
        name: '',
        date: '',
        region: 'National',
        category: 'Cultural',
        suggested_preparation: '',
        inventory_notes: '',
      });
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to create event.');
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
            Festival Calendar & Seasonal Demand Advisory
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Plan your stock, cash reserves, and festive discount bundles in advance of regional spikes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Add Business Reminder</span>
        </button>
      </div>

      {/* Grid of Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-ink-secondary text-sm">
            Loading seasonal festival advisories...
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm hover:border-sage/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage/10 text-sage uppercase tracking-wider">
                      {ev.region}
                    </span>
                    {ev.is_user_event && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Custom Reminder
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-ink-primary mt-1">
                    {ev.name}
                  </h3>
                </div>

                <div className="p-2.5 rounded-xl bg-canvas border border-stroke text-center min-w-[70px]">
                  <Calendar className="w-4 h-4 mx-auto text-sage mb-0.5" />
                  <span className="text-[11px] font-bold text-ink-primary block leading-tight">
                    {formatDateIndian(ev.date)}
                  </span>
                </div>
              </div>

              {/* Advisory Box */}
              <div className="p-3.5 rounded-xl bg-canvas border border-stroke text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-forest text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-sage" />
                  <span>Business Preparation Advisory</span>
                </div>
                <p className="text-ink-secondary leading-relaxed">
                  {ev.suggested_preparation}
                </p>
              </div>

              {ev.inventory_notes && (
                <div className="p-3 rounded-xl bg-lime/10 border border-lime/30 text-xs flex items-start gap-2 text-forest">
                  <ShoppingBag className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Stock Procurement Strategy:</span>
                    <span className="text-ink-primary text-[11px]">{ev.inventory_notes}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Custom Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Business Event or Haat Day"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Event or Reminder Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Weekly Saturday Haat / Village Jatra"
              className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Region / Market
              </label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="e.g. Local Taluka"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Preparation Notes *
            </label>
            <textarea
              rows={2}
              required
              value={form.suggested_preparation}
              onChange={(e) => setForm({ ...form, suggested_preparation: e.target.value })}
              placeholder="e.g. Arrange extra cash change of ₹2,000 in ₹10 and ₹20 notes; restock snack packets."
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
              {submitting ? 'Saving...' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
