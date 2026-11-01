import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
}

export default function Alert({ type = 'info', title, message, className = '' }: AlertProps) {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
    },
  };

  const conf = configs[type];
  const Icon = conf.icon;

  return (
    <div className={`p-4 rounded-xl border flex gap-3 text-sm ${conf.bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${conf.iconColor}`} />
      <div>
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="leading-relaxed text-xs md:text-sm">{message}</p>
      </div>
    </div>
  );
}
