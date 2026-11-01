'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BusinessPlan } from '@/types';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { formatINR } from '@/lib/formatters';

export default function BusinessPlanPage() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Generator modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [fundingTarget, setFundingTarget] = useState('50000');
  const [expansionVision, setExpansionVision] = useState(
    'Procure modern display rack, stock high-margin festive inventory, and obtain working capital line.'
  );
  const [generating, setGenerating] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getBusinessPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newPlan = await api.generateBusinessPlan({
        title: `GramVikas 3-Year Enterprise Expansion Plan (₹${Number(fundingTarget).toLocaleString('en-IN')})`,
        target_funding_inr: parseFloat(fundingTarget) || 50000,
        expansion_vision: expansionVision,
      });
      setIsGenerateOpen(false);
      await fetchPlans();
      setSelectedPlan(newPlan);
    } catch (err: any) {
      alert(err.message || 'Failed to generate business plan.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = (planId: string) => {
    window.open(api.getBusinessPlanPdfUrl(planId), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            12-Section Micro-Enterprise Business Plan
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Bank-ready credit proposal synthesized from your authenticated profile & transaction telemetry
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-4 h-4 text-lime" />
          <span>Generate New Business Plan</span>
        </button>
      </div>

      <Alert
        type="info"
        title="Institutional Credit Proposal Standard"
        message="This 12-section plan follows guidelines from the Ministry of MSME, JanSamarth, and RBI Priority Sector Lending. Projected figures are structured estimates based on your recorded performance; not a statutory audit."
      />

      {loading ? (
        <div className="text-center py-16 text-ink-secondary text-sm">
          Loading business plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-stroke shadow-sm space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-sage mx-auto" />
          <div>
            <h3 className="font-bold text-base text-ink-primary">No Business Plans Created Yet</h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto mt-1">
              Generate a structured 12-section plan to apply for bank loans (PMMY MUDRA, PM SVANidhi) or evaluate your 3-year expansion strategy.
            </p>
          </div>
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold shadow-sm hover:bg-forest-light"
          >
            Create First Business Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Previous Plans List */}
          <div className="lg:col-span-1 bg-surface rounded-2xl p-4 border border-stroke shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
              Saved Business Plans ({plans.length})
            </h4>

            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedPlan?.id === p.id
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-canvas text-ink-primary border-stroke hover:border-sage'
                }`}
              >
                <p className="font-bold truncate">{p.title}</p>
                <p className={`text-[11px] mt-0.5 ${selectedPlan?.id === p.id ? 'text-white/70' : 'text-ink-secondary'}`}>
                  Generated: {p.plan_data.date_generated}
                </p>
              </button>
            ))}
          </div>

          {/* Right: Selected Plan Full 12-Section Preview */}
          {selectedPlan && (
            <div className="lg:col-span-3 bg-surface rounded-2xl p-6 sm:p-8 border border-stroke shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stroke">
                <div>
                  <h3 className="text-xl font-bold text-ink-primary">{selectedPlan.title}</h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    {selectedPlan.plan_data.business_name} • {selectedPlan.plan_data.locality} • {selectedPlan.plan_data.date_generated}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadPDF(selectedPlan.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formal PDF</span>
                </button>
              </div>

              {/* 12 Sections Content */}
              <div className="space-y-6 divide-y divide-stroke">
                {selectedPlan.plan_data.sections.map((sec) => (
                  <div key={sec.section_number} className="pt-5 first:pt-0 space-y-3">
                    <h4 className="text-sm md:text-base font-bold text-forest flex items-baseline gap-2">
                      <span className="w-5 h-5 rounded-full bg-forest text-lime text-xs flex items-center justify-center font-bold">
                        {sec.section_number}
                      </span>
                      <span>{sec.title}</span>
                    </h4>

                    <p className="text-xs md:text-sm text-ink-secondary leading-relaxed whitespace-pre-line pl-7">
                      {sec.content}
                    </p>

                    {/* Metric Cards if available */}
                    {sec.key_metrics && Object.keys(sec.key_metrics).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7 pt-1">
                        {Object.entries(sec.key_metrics).map(([k, v], idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-canvas border border-stroke text-xs">
                            <span className="text-[10px] text-ink-secondary block font-semibold">{k}</span>
                            <span className="font-bold text-forest">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generator Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Micro-Enterprise Growth Plan"
      >
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Target Expansion Funding (INR ₹) *
            </label>
            <input
              type="number"
              step="5000"
              required
              value={fundingTarget}
              onChange={(e) => setFundingTarget(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full text-lg font-bold px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
            <p className="text-[11px] text-ink-secondary mt-1">
              MUDRA Shishu supports up to ₹50,000; MUDRA Kishore supports up to ₹5,00,000.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Expansion Vision / Intended Use of Funds *
            </label>
            <textarea
              rows={3}
              required
              value={expansionVision}
              onChange={(e) => setExpansionVision(e.target.value)}
              placeholder="e.g. Upgrade inventory with packaged goods, purchase modern display racks, install UPI soundbox"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>{generating ? 'Synthesizing...' : 'Generate 12-Section Plan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
