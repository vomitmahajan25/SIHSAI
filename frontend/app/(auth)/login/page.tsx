'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      saveSession({
        token: res.access_token,
        userId: res.user_id,
        email: res.email,
        fullName: res.full_name,
        isOnboarded: res.is_onboarded,
      });

      if (res.is_onboarded) {
        router.push('/overview');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('direct@gramvikas.in');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-lg">
            <Sprout className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-ink-primary tracking-tight">
          GramVikas AI
        </h2>
        <p className="mt-1 text-center text-sm text-ink-secondary">
          AI Financial & Business Advisor for Rural Micro-Entrepreneurs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 sm:px-10 shadow-sm border border-stroke rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs md:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@gramvikas.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-forest hover:bg-forest-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In to My Business'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill for Hackathon Judges */}
          <div className="mt-6 pt-5 border-t border-stroke text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sage hover:text-sage-hover px-3 py-1.5 rounded-lg bg-sage/10 hover:bg-sage/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Verified Demo Credentials</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-ink-secondary">
              First time here?{' '}
              <Link href="/register" className="font-semibold text-sage hover:underline">
                Create new business profile
              </Link>
            </p>
          </div>
        </div>

        {/* Hackathon Badge */}
        <p className="text-center text-[11px] text-ink-secondary mt-6">
          Smart India Hackathon 2026 • PS 10091 • Team 6-ByTES
        </p>
      </div>
    </div>
  );
}
