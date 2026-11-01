'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Globe, Plus, User, Bell } from 'lucide-react';
import { getSession } from '@/lib/auth';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onQuickAdd?: (type: 'sale' | 'expense' | 'product') => void;
}

export default function Header({ title, onOpenSidebar, onQuickAdd }: HeaderProps) {
  const [userName, setUserName] = useState<string>('Entrepreneur');
  const [language, setLanguage] = useState<string>('English');

  useEffect(() => {
    const session = getSession();
    if (session && session.fullName) {
      setUserName(session.fullName);
    }
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-stroke sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-canvas lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg md:text-xl text-ink-primary tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Quick actions, Language, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Add Menu */}
        {onQuickAdd && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => onQuickAdd('sale')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sage hover:bg-sage-hover text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
            <button
              onClick={() => onQuickAdd('expense')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-canvas hover:bg-stroke text-ink-primary border border-stroke text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        )}

        {/* Language Selector */}
        <div className="relative flex items-center bg-canvas border border-stroke rounded-lg px-2.5 py-1 text-xs font-medium text-ink-secondary">
          <Globe className="w-3.5 h-3.5 mr-1.5 text-sage" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer text-ink-primary text-xs"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Profile Pill */}
        <Link
          href="/my-business"
          className="flex items-center gap-2 p-1 md:px-2.5 md:py-1 rounded-lg hover:bg-canvas border border-transparent hover:border-stroke transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-sage/10 text-sage flex items-center justify-center font-bold text-xs border border-sage/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-ink-primary max-w-[120px] truncate">
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}
