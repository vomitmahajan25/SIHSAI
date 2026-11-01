'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Server,
  Shield,
  Wifi,
  Coins,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { clearSession } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  const checkServerHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({ status: 'offline', error: `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setHealthStatus({ status: 'offline', error: err.message || 'Cannot reach backend server' });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
          Application Settings & System Diagnostics
        </h2>
        <p className="text-xs text-ink-secondary mt-0.5">
          Configure business defaults, network performance modes, and check live backend services
        </p>
      </div>

      {/* Backend Connectivity Card */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stroke">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sage" />
            <h3 className="font-bold text-sm md:text-base text-ink-primary">
              Backend Service Diagnostics
            </h3>
          </div>

          <button
            onClick={checkServerHealth}
            disabled={checkingHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke text-xs font-semibold text-ink-primary hover:bg-canvas disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin text-sage' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        {healthStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">FastAPI Server</span>
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  healthStatus.status === 'online' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${healthStatus.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {healthStatus.status === 'online' ? 'Connected & Healthy' : 'Offline'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">Relational Database</span>
              <span className="font-bold text-forest capitalize">
                {healthStatus.database || 'Healthy'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-stroke">
              <span className="text-ink-secondary block mb-1">AI Engine Mode</span>
              <span className="font-bold text-sage capitalize">
                {healthStatus.ai_provider || 'Fallback Mode'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-ink-secondary">Checking server connection...</div>
        )}
      </div>

      {/* Performance & Low-Bandwidth Mode */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stroke">
          <Wifi className="w-5 h-5 text-sage" />
          <h3 className="font-bold text-sm md:text-base text-ink-primary">
            Network & Bandwidth Optimization
          </h3>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stroke">
          <div>
            <h4 className="font-semibold text-xs text-ink-primary">Low-Bandwidth (2G/3G) Mode</h4>
            <p className="text-[11px] text-ink-secondary">
              Reduces graph rendering frequency and compresses payload data for slow rural connections.
            </p>
          </div>
          <input
            type="checkbox"
            checked={lowBandwidthMode}
            onChange={(e) => setLowBandwidthMode(e.target.checked)}
            className="w-5 h-5 rounded text-sage focus:ring-sage"
          />
        </div>
      </div>

      {/* Currency & Financial Preferences */}
      <div className="bg-surface rounded-2xl p-6 border border-stroke shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stroke">
          <Coins className="w-5 h-5 text-sage" />
          <h3 className="font-bold text-sm md:text-base text-ink-primary">
            Financial & Inventory Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Base Operating Currency
            </label>
            <input
              type="text"
              disabled
              value="Indian Rupee (INR ₹)"
              className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs font-bold text-ink-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Default Low-Stock Alert Units
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
        </div>
      </div>

      {/* Account Session Logout */}
      <div className="bg-surface rounded-2xl p-6 border border-rose-200 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs md:text-sm text-ink-primary">Sign Out of Session</h4>
          <p className="text-[11px] text-ink-secondary">
            Securely clears all session tokens and local state from this browser.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
