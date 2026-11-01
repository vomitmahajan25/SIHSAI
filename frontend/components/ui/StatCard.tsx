import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  highlight?: boolean;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  isPositive = true,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        highlight
          ? 'bg-forest text-white border-forest shadow-md'
          : 'bg-surface text-ink-primary border-stroke hover:border-sage/40 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            highlight ? 'text-lime/90' : 'text-ink-secondary'
          }`}
        >
          {label}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              highlight ? 'bg-white/10 text-lime' : 'bg-canvas text-sage'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                isPositive
                  ? highlight
                    ? 'bg-lime/20 text-lime'
                    : 'bg-emerald-50 text-emerald-700'
                  : highlight
                  ? 'bg-red-400/20 text-red-300'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className={highlight ? 'text-white/60' : 'text-ink-secondary'}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
