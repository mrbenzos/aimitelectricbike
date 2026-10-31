'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bike,
  ShoppingBag,
  Calendar,
  History,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Plus,
  AlertTriangle,
  ExternalLink,
  Zap,
  BarChart3,
} from 'lucide-react';
import { dbService } from '@/lib/supabaseClient';
import AimitLogo from '@/components/AimitLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Check if user has an active admin session
    const token = typeof window !== 'undefined' ? localStorage.getItem('msniff_admin_token') : null;
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('msniff_admin_session');

    if (!token && !hasCookie) {
      setIsAuthenticated(false);
      router.replace('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function checkStock() {
      try {
        const bikes = await dbService.getBikes();
        const low = bikes.filter((b) => b.stock_qty <= 2 || b.stock_status === 'low');
        setLowStockCount(low.length);
      } catch (e) {
        console.error(e);
      }
    }
    checkStock();
  }, [pathname, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('msniff_admin_token');
    document.cookie = 'msniff_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bikes', label: 'Bikes Fleet (CRUD)', icon: Bike },
    { href: '/admin/orders', label: 'Orders by Hub', icon: ShoppingBag },
    { href: '/admin/test-rides', label: 'Test Rides', icon: Calendar },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { href: '/admin/activity', label: 'Activity Logs', icon: History },
  ];

  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-gray-400 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-electric/10 border border-electric/40 flex items-center justify-center text-electric shadow-electric animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Verifying Security Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111111] border-r border-[#222222] flex flex-col justify-between p-5 shrink-0">
        <div className="space-y-6">
          {/* Admin Brand */}
          <div className="pb-4 border-b border-[#222]">
            <AimitLogo variant="admin" />
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-electric text-black shadow-electric'
                      : 'text-gray-300 hover:bg-[#181818] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.href === '/admin/bikes' && lowStockCount > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-black text-electric' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {lowStockCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-[#222] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white px-2"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] hover:bg-[#252525] text-red-400 hover:text-red-300 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#0E0E0E] border-b border-[#202020] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {lowStockCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span><strong>{lowStockCount} AIMIT models</strong> have low stock (≤ 2). SMS alert fired.</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/bikes/new"
              className="bg-electric hover:bg-electric-dark text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-electric uppercase tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Bike
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
