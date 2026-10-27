'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ShoppingBag, Menu, X, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import AimitLogo from '@/components/AimitLogo';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount, subtotal } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render storefront header on admin dashboard routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/bikes', label: 'E-Bikes Shop' },
    { href: '/compare', label: 'Compare Models' },
    { href: '/why-electric', label: 'Fuel Calculator' },
    { href: '/contact', label: 'Nationwide Hubs' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Brand Logo */}
          <AimitLogo variant="navbar" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all py-1 border-b-2 ${
                  isActive(link.href)
                    ? 'text-emerald-600 border-emerald-500 font-bold'
                    : 'text-slate-600 border-transparent hover:text-emerald-600 hover:border-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Right: Cart & Quick Order */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative flex items-center bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl transition-all group shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div className="hidden sm:block ml-2 text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">Cart</p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {subtotal > 0 ? formatGHS(subtotal) : '0 items'}
                </p>
              </div>
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
            >
              Test Ride
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-lg uppercase tracking-wider shadow-sm"
            >
              Book a Test Ride (Free)
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-emerald-600 py-2 flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              M.SNIFF Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
