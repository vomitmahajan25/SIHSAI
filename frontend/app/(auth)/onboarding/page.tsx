'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  User,
  Store,
  IndianRupee,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getSession, updateOnboardedStatus } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: '',
    preferred_language: 'English',
    district: '',
    state: '',
    pin_code: '',
    phone_number: '',

    // Step 2: Business
    business_name: '',
    business_category: 'Kirana Store',
    business_type: 'Shop',
    experience_years: 2.0,
    locality: '',
    market_area: '',
    num_employees: 0,
    operating_days: 'Monday to Saturday',
    main_products: '',

    // Step 3: Financial
    avg_daily_sales: 3000,
    avg_daily_expenses: 600,
    inventory_investment: 30000,
    outstanding_debt: 0,
    working_capital: 15000,
    supplier_terms: 'Cash on Delivery (7-day credit on staples)',
    business_goals: 'Expand inventory with high-margin items and reduce informal borrowing.',
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    // Prefill from current profile
    api
      .getProfile()
      .then((p) => {
        setFormData((prev) => ({
          ...prev,
          full_name: p.full_name || prev.full_name,
          district: p.district || prev.district,
          state: p.state || prev.state,
          preferred_language: p.preferred_language || prev.preferred_language,
        }));
      })
      .catch(() => {});
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.full_name || !formData.district || !formData.state) {
        setError('Please complete the required personal profile fields.');
        return;
      }
    } else if (step === 2) {
      if (!formData.business_name || !formData.locality) {
        setError('Please enter your business name and market locality.');
        return;
      }
    }
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await api.completeOnboarding(formData);
      updateOnboardedStatus(true);
      router.push('/overview');
    } catch (err: any) {
      setError(err.message || 'Failed to save business profile.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-lime">
            <Sprout className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-xl text-ink-primary">GramVikas AI</span>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="mb-8 bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className={`p-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold ${
                step >= 1 ? 'bg-forest text-white' : 'text-ink-secondary bg-canvas'
              }`}
            >
              <User className="w-4 h-4" />
              <span>1. Entrepreneur</span>
            </div>
            <div
              className={`p-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold ${
                step >= 2 ? 'bg-forest text-white' : 'text-ink-secondary bg-canvas'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>2. Business</span>
            </div>
            <div
              className={`p-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold ${
                step >= 3 ? 'bg-forest text-white' : 'text-ink-secondary bg-canvas'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>3. Financials</span>
            </div>
          </div>
        </div>

        {/* Main Step Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-stroke shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs md:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink-primary">Step 1: Entrepreneur Profile</h3>
                <p className="text-xs text-ink-secondary">
                  Your identity details allow GramVikas to tailor regional schemes and advisory language.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Solapur"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    PIN Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="pin_code"
                    value={formData.pin_code}
                    onChange={handleChange}
                    placeholder="413001"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink-primary">Step 2: Business Profile</h3>
                <p className="text-xs text-ink-secondary">
                  Specify your enterprise type and local market context for hyper-local intelligence.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Provision & General Store"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Category *
                  </label>
                  <select
                    name="business_category"
                    value={formData.business_category}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  >
                    <option value="Kirana Store">Kirana / Grocery Store</option>
                    <option value="Street Vending">Street Vending / Food Cart</option>
                    <option value="Apparel & Tailoring">Apparel, Footwear & Tailoring</option>
                    <option value="Handicrafts & Artisanal">Handicrafts & Traditional Artisanal</option>
                    <option value="Agricultural Trade & Inputs">Agri-Inputs & Produce Trade</option>
                    <option value="Services & Repair">Mobile, Electronics & Bike Repair</option>
                    <option value="Other">Other Micro-Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Operating Format *
                  </label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  >
                    <option value="Shop">Permanent Shop</option>
                    <option value="Street Vending">Street Vending / Cart</option>
                    <option value="Home-based">Home-based Enterprise</option>
                    <option value="Service">Service Workshop</option>
                    <option value="Manufacturing">Small Manufacturing / Processing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Market Area / Locality *
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    placeholder="e.g. Shivaji Chowk Bazaar"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
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
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Main Products or Services Sold
                </label>
                <input
                  type="text"
                  name="main_products"
                  value={formData.main_products}
                  onChange={handleChange}
                  placeholder="e.g. Grains, mustard oil, packaged snacks, spices, pulses"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Financial Profile */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink-primary">Step 3: Financial Baseline</h3>
                <p className="text-xs text-ink-secondary">
                  These initial estimates calibrate your financial health scoring and AI advisor recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Avg. Daily Sales (₹)
                  </label>
                  <input
                    type="number"
                    name="avg_daily_sales"
                    value={formData.avg_daily_sales}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Avg. Daily Expenses (₹)
                  </label>
                  <input
                    type="number"
                    name="avg_daily_expenses"
                    value={formData.avg_daily_expenses}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Estimated Stock Value (₹)
                  </label>
                  <input
                    type="number"
                    name="inventory_investment"
                    value={formData.inventory_investment}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Working Capital Cash (₹)
                  </label>
                  <input
                    type="number"
                    name="working_capital"
                    value={formData.working_capital}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Existing Outstanding Business Debt (₹)
                </label>
                <input
                  type="number"
                  name="outstanding_debt"
                  value={formData.outstanding_debt}
                  onChange={handleChange}
                  placeholder="0 if none"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
                <p className="text-[11px] text-ink-secondary mt-1">
                  Private & secure: Used only to advise on debt refinancing from informal lenders to bank micro-loans.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Primary Business Goals
                </label>
                <textarea
                  rows={2}
                  name="business_goals"
                  value={formData.business_goals}
                  onChange={handleChange}
                  placeholder="e.g. Reduce informal loans, expand inventory, double customer footfall"
                  className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-stroke flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stroke text-ink-primary text-xs font-semibold hover:bg-canvas transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Finalizing Setup...' : 'Launch GramVikas AI'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
