'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  BookOpen,
  TrendingUp,
  Bot,
  Compass,
  Landmark,
  Package,
  FolderLock,
  CalendarDays,
  FileSpreadsheet,
  FileBarChart,
  Settings,
  LogOut,
  X,
  Sprout,
  Sparkles,
} from 'lucide-react';
import { clearSession } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/my-business', label: 'My Business', icon: Store },
  { href: '/khata-book', label: 'Khata Book', icon: BookOpen },
  { href: '/financial-health', label: 'Financial Health', icon: TrendingUp },
  { href: '/advisor', label: 'AI Business Advisor', icon: Bot, highlight: true },
  { href: '/market', label: 'Local Market', icon: Compass },
  { href: '/schemes', label: 'Schemes & Loans', icon: Landmark },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/vault', label: 'Digital Vault', icon: FolderLock },
  { href: '/festivals', label: 'Festival Calendar', icon: CalendarDays },
  { href: '/business-plan', label: 'Business Plan', icon: FileSpreadsheet },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest text-white flex flex-col border-r border-forest-light transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-forest-light">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center text-lime group-hover:scale-105 transition-transform shadow-md">
              <Sprout className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">GramVikas</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-lime/20 text-lime font-semibold">AI</span>
              </div>
              <p className="text-[10px] text-white/60 -mt-0.5">Your Business. Your Growth.</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-white/70 hover:bg-forest-light hover:text-white'
                } ${item.highlight ? 'relative group' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lime' : 'text-white/60 group-hover:text-lime'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <Sparkles className="w-3.5 h-3.5 text-lime ml-auto animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* SIH Hackathon Banner & Logout */}
        <div className="p-4 border-t border-forest-light bg-forest-dark/40 space-y-3">
          <div className="px-3 py-2 rounded-lg bg-forest-light/60 border border-forest-light text-[11px] text-white/80">
            <p className="font-semibold text-lime">SIH 2026 • PS 10091</p>
            <p className="text-white/60 text-[10px]">Team 6-ByTES • Team ID 178837</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
