'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Lock, Mail, User, MapPin, Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    preferred_language: 'English',
    district: 'Pune',
    state: 'Maharashtra',
    pin_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.register(formData);
      saveSession({
        token: res.access_token,
        userId: res.user_id,
        email: res.email,
        fullName: res.full_name,
        isOnboarded: false,
      });
      // Redirect to 3-step onboarding wizard
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-lg">
            <Sprout className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-ink-primary tracking-tight">
          Create Your Business Profile
        </h2>
        <p className="mt-1 text-center text-sm text-ink-secondary">
          Join GramVikas AI to track finances, access government schemes & grow
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
                Full Name / Proprietor Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-3 py-2 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                />
              </div>
            </div>

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
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ramesh@gramvikas.in"
                  className="block w-full pl-10 pr-3 py-2 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
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
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-10 pr-3 py-2 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  District
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Solapur"
                    className="block w-full pl-9 pr-3 py-2 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="block w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Preferred Advisory Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary">
                  <Globe className="w-4 h-4" />
                </div>
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-canvas border border-stroke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-forest hover:bg-forest-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Continue to Business Setup'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-ink-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-sage hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
