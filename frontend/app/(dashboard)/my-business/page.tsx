'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  User,
  MapPin,
  IndianRupee,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { UserProfile, BusinessProfile } from '@/types';
import Alert from '@/components/ui/Alert';

export default function MyBusinessPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    business_name: '',
    business_category: '',
    business_type: '',
    experience_years: 0,
    locality: '',
    market_area: '',
    num_employees: 0,
    operating_days: '',
    main_products: '',
    avg_daily_sales: 0,
    avg_daily_expenses: 0,
    inventory_investment: 0,
    outstanding_debt: 0,
    working_capital: 0,
    business_goals: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, bizData] = await Promise.all([
        api.getProfile(),
        api.getBusiness(),
      ]);
      setProfile(profData);
      setBusiness(bizData);
      setFormData({
        business_name: bizData.business_name || '',
        business_category: bizData.business_category || '',
        business_type: bizData.business_type || '',
        experience_years: bizData.experience_years || 0,
        locality: bizData.locality || '',
        market_area: bizData.market_area || '',
        num_employees: bizData.num_employees || 0,
        operating_days: bizData.operating_days || '',
        main_products: bizData.main_products || '',
        avg_daily_sales: bizData.avg_daily_sales || 0,
        avg_daily_expenses: bizData.avg_daily_expenses || 0,
        inventory_investment: bizData.inventory_investment || 0,
        outstanding_debt: bizData.outstanding_debt || 0,
        working_capital: bizData.working_capital || 0,
        business_goals: bizData.business_goals || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load business profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.updateBusiness(formData);
      setMessage('Business profile successfully updated in persistent database.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update business profile.');
    } finally {
      setSaving(false);
    }
  };

  // Profile completeness calculation
  let completeness = 40;
  if (business?.business_name) completeness += 15;
  if (business?.locality) completeness += 15;
  if (business?.main_products) completeness += 15;
  if (business?.business_goals) completeness += 15;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            My Business & Entrepreneur Profile
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            View and update your verified enterprise profile, financial baseline & operational goals
          </p>
        </div>

        {/* Profile Completeness Pill */}
        <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-stroke shadow-xs">
          <Sparkles className="w-4 h-4 text-sage" />
          <div className="text-xs">
            <span className="text-ink-secondary font-medium">Completeness: </span>
            <span className="font-bold text-forest">{completeness}%</span>
          </div>
        </div>
      </div>

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Entrepreneur Information Card */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stroke">
            <User className="w-5 h-5 text-sage" />
            <h3 className="font-bold text-sm md:text-base text-ink-primary">
              Proprietor / Entrepreneur Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">Full Legal Name</span>
              <span className="font-bold text-ink-primary text-sm">{profile?.full_name}</span>
            </div>
            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">Location / District</span>
              <span className="font-bold text-ink-primary text-sm">
                {profile?.district}, {profile?.state}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">Advisory Language</span>
              <span className="font-bold text-ink-primary text-sm">{profile?.preferred_language}</span>
            </div>
          </div>
        </div>

        {/* Business Attributes Card */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stroke">
            <Store className="w-5 h-5 text-sage" />
            <h3 className="font-bold text-sm md:text-base text-ink-primary">
              Enterprise Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Business Trade Name *
              </label>
              <input
                type="text"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Market Locality / Village *
              </label>
              <input
                type="text"
                name="locality"
                required
                value={formData.locality}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Category
              </label>
              <select
                name="business_category"
                value={formData.business_category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                <option value="Kirana Store">Kirana / Retail Grocery Store</option>
                <option value="Street Vending">Street Vending / Food Cart</option>
                <option value="Apparel & Tailoring">Apparel & Tailoring</option>
                <option value="Handicrafts & Artisanal">Handicrafts & Artisanal Crafts</option>
                <option value="Agricultural Trade & Inputs">Agri-Inputs & Trade</option>
                <option value="Services & Repair">Services & Repair</option>
                <option value="Other">Other Micro-Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Format
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                <option value="Shop">Fixed Commercial Shop</option>
                <option value="Street Vending">Street Vendor / Movable Cart</option>
                <option value="Home-based">Home-based Enterprise</option>
                <option value="Service">Service Workshop</option>
                <option value="Manufacturing">Manufacturing / Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Operating Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Weekly Operating Schedule
              </label>
              <input
                type="text"
                name="operating_days"
                value={formData.operating_days}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Core Products & Services Sold
            </label>
            <textarea
              rows={2}
              name="main_products"
              value={formData.main_products}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
        </div>

        {/* Financial Assumptions & Goals */}
        <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stroke">
            <IndianRupee className="w-5 h-5 text-sage" />
            <h3 className="font-bold text-sm md:text-base text-ink-primary">
              Financial Assumptions & Growth Objectives
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Avg. Daily Sales (₹)
              </label>
              <input
                type="number"
                name="avg_daily_sales"
                value={formData.avg_daily_sales}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Avg. Daily Costs (₹)
              </label>
              <input
                type="number"
                name="avg_daily_expenses"
                value={formData.avg_daily_expenses}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Working Capital (₹)
              </label>
              <input
                type="number"
                name="working_capital"
                value={formData.working_capital}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Strategic Enterprise Goals
            </label>
            <textarea
              rows={2}
              name="business_goals"
              value={formData.business_goals}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-lime" />
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
