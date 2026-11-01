'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileCheck,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Scheme, SchemeEligibilityMatch } from '@/types';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Eligibility Wizard Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardForm, setWizardForm] = useState({
    business_category: 'Kirana Store',
    business_type: 'Shop',
    annual_turnover: 350000,
    experience_years: 2.5,
    has_udyam_registration: false,
    gender: 'All',
    social_category: 'General',
  });
  const [matches, setMatches] = useState<SchemeEligibilityMatch[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api
      .getSchemes()
      .then((data) => setSchemes(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await api.checkSchemeEligibility(wizardForm);
      setMatches(res.matches);
    } catch (err: any) {
      alert(err.message || 'Failed to check eligibility.');
    } finally {
      setChecking(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      s.business_categories.toLowerCase().includes(search.toLowerCase()) ||
      s.intended_beneficiaries.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Government Schemes & Institutional Financing
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Verified Central & State Government programmes to replace predatory moneylenders
          </p>
        </div>

        <button
          onClick={() => {
            setMatches(null);
            setWizardOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-lime" />
          <span>Check My Eligibility</span>
        </button>
      </div>

      <Alert
        type="info"
        title="Official Verification Notice"
        message="All scheme details, subsidy calculations, and eligibility requirements displayed on GramVikas are strictly cross-verified with official government portals (MSME, MoHUA, JanSamarth, DFS). GramVikas does not guarantee loan sanctions or take commissions."
      />

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by scheme name or enterprise category..."
          className="w-full pl-10 pr-4 py-2 bg-surface border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage shadow-xs"
        />
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-ink-secondary text-sm">
            Loading verified government schemes directory...
          </div>
        ) : (
          filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm hover:border-sage/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
                      {scheme.issuing_authority}
                    </span>
                    <h3 className="font-bold text-base text-ink-primary mt-0.5 leading-snug">
                      {scheme.scheme_name}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-canvas flex items-center justify-center text-sage flex-shrink-0 border border-stroke">
                    <Landmark className="w-4 h-4" />
                  </div>
                </div>

                {scheme.max_loan_subsidy_info && (
                  <div className="p-2.5 rounded-xl bg-lime/20 border border-lime/40 text-xs font-semibold text-forest">
                    {scheme.max_loan_subsidy_info}
                  </div>
                )}

                <div className="text-xs space-y-1.5 text-ink-secondary">
                  <p>
                    <strong className="text-ink-primary">Beneficiaries:</strong> {scheme.intended_beneficiaries}
                  </p>
                  <p>
                    <strong className="text-ink-primary">Categories:</strong> {scheme.business_categories}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-stroke text-xs space-y-2">
                  <p className="font-semibold text-ink-primary">Key Eligibility Conditions:</p>
                  <p className="text-ink-secondary whitespace-pre-line text-[11px] leading-relaxed">
                    {scheme.eligibility_conditions}
                  </p>

                  <p className="font-semibold text-ink-primary pt-1">Required Documents:</p>
                  <p className="text-ink-secondary whitespace-pre-line text-[11px] leading-relaxed">
                    {scheme.required_documents}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stroke flex items-center justify-between text-xs">
                <span className="text-[10px] text-ink-secondary">
                  Verified: {scheme.last_verified_date}
                </span>

                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-light text-white font-semibold transition-colors shadow-2xs"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-lime" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guided Eligibility Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Preliminary Scheme Eligibility Check"
        maxWidth="max-w-2xl"
      >
        {!matches ? (
          <form onSubmit={handleRunEligibility} className="space-y-4">
            <p className="text-xs text-ink-secondary">
              Answer these 4 quick questions about your enterprise scale to discover matched financing programmes:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Business Category
                </label>
                <select
                  value={wizardForm.business_category}
                  onChange={(e) => setWizardForm({ ...wizardForm, business_category: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  <option value="Kirana Store">Kirana / Retail Store</option>
                  <option value="Street Vending">Street Vendor / Food Cart</option>
                  <option value="Carpentry / Woodcraft">Carpentry / Traditional Artisan</option>
                  <option value="Handicrafts">Handicraft & Weaving</option>
                  <option value="Agri Allied">Agri-Processing & Allied</option>
                  <option value="Service">Repair Workshop / Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Format
                </label>
                <select
                  value={wizardForm.business_type}
                  onChange={(e) => setWizardForm({ ...wizardForm, business_type: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  <option value="Shop">Permanent Shop</option>
                  <option value="Street Vendor / Food Cart">Street Vendor / Hawkers Cart</option>
                  <option value="Home-based Workshop">Home-based Workshop</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Approx. Annual Turnover (₹)
                </label>
                <input
                  type="number"
                  required
                  value={wizardForm.annual_turnover}
                  onChange={(e) => setWizardForm({ ...wizardForm, annual_turnover: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Operating Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={wizardForm.experience_years}
                  onChange={(e) => setWizardForm({ ...wizardForm, experience_years: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Gender
                </label>
                <select
                  value={wizardForm.gender}
                  onChange={(e) => setWizardForm({ ...wizardForm, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female (Eligible for Stand-Up India)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Social Category
                </label>
                <select
                  value={wizardForm.social_category}
                  onChange={(e) => setWizardForm({ ...wizardForm, social_category: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="Minority">Minority</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="udyam"
                checked={wizardForm.has_udyam_registration}
                onChange={(e) => setWizardForm({ ...wizardForm, has_udyam_registration: e.target.checked })}
                className="w-4 h-4 rounded text-sage focus:ring-sage"
              />
              <label htmlFor="udyam" className="text-xs text-ink-primary">
                I already possess an official Udyam Registration Certificate
              </label>
            </div>

            <div className="pt-4 border-t border-stroke flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={checking}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                {checking ? 'Analyzing...' : 'Evaluate Eligibility'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stroke">
              <span className="text-xs font-bold text-ink-primary">
                Matched Schemes for Your Profile:
              </span>
              <button
                onClick={() => setMatches(null)}
                className="text-xs text-sage font-semibold hover:underline"
              >
                Change Answers
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {matches.map((m) => (
                <div
                  key={m.scheme_id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    m.status === 'Potentially relevant'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : m.status === 'More information required'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-canvas border-stroke opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-ink-primary">{m.scheme_name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        m.status === 'Potentially relevant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'More information required'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <p className="text-ink-secondary text-[11px]">{m.issuing_authority}</p>

                  <div className="space-y-1">
                    {m.relevance_reasons.map((r, idx) => (
                      <p key={idx} className="text-ink-primary text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
                        <span>{r}</span>
                      </p>
                    ))}
                  </div>

                  {m.missing_criteria_or_next_steps.length > 0 && (
                    <div className="pt-1 text-[11px] text-ink-secondary">
                      <strong>Next Action:</strong> {m.missing_criteria_or_next_steps.join(' ')}
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={m.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Visit Scheme Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-ink-secondary pt-2 border-t border-stroke">
              Disclaimer: Preliminary guided match based on official guidelines. Final sanction is subject to lender verification.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
