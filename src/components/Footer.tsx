'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, MapPin, Phone, Mail, Clock, Shield, BatteryCharging, ArrowUpRight } from 'lucide-react';

/* ── Inline SVG social icons (no extra package needed) ── */
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.86a8.17 8.17 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
import { createWhatsAppLink } from '@/lib/utils';
import AimitLogo from '@/components/AimitLogo';

export default function Footer() {
  const pathname = usePathname();
  const quickWhatsAppUrl = createWhatsAppLink('Hello M.Sniff Business Hub, I have an inquiry about AIMIT Electric Bicycles.');

  // Do not render storefront footer on admin dashboard routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Columns Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Info */}
          <div className="space-y-4">
            <AimitLogo variant="footer" showTagline={false} />
            <p className="text-sm text-slate-600 leading-relaxed">
              Ghana's premier distributor of authentic <strong>AIMIT Electric Bicycles</strong>. Built tough for Ghana roads, potholes, savanna trails, and zero trotro fuel stress.
            </p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-600">
              <p className="flex items-center">
                <Shield className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                12-Month Official Warranty & Spare Parts
              </p>
              <p className="flex items-center">
                <BatteryCharging className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                Grade-A Lithium Smart BMS Cells
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-4">Explore AIMIT</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/bikes" className="hover:text-emerald-600 transition-colors">
                  All Electric Bicycles
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-600 transition-colors">
                  Compare Models Side-by-Side
                </Link>
              </li>
              <li>
                <Link href="/why-electric" className="hover:text-emerald-600 transition-colors">
                  Fuel Savings Calculator (Trotro vs E-Bike)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                  Book a Free Test Ride
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-600 transition-colors">
                  Shopping Cart & Hub Transit
                </Link>
              </li>
            </ul>
          </div>

          {/* Hub Logistics & Hours */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-4">Operations & Hours</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start">
                <Clock className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Monday - Saturday</p>
                  <p>7:30 AM - 6:30 PM (All Hubs)</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Sunday</p>
                  <p>12:00 PM - 5:00 PM (Amasaman HQ Only)</p>
                </div>
              </li>
              <li className="pt-2">
                <p className="text-emerald-700 font-semibold">Payment Methods:</p>
                <p>MTN Mobile Money, Telecel Cash, Bank Wire, Pay on Hub Pickup</p>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-4">Direct Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <Phone className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" />
                <a href="tel:+233242365706" className="hover:text-emerald-600 font-mono text-slate-800 font-medium">
                  +233 24 236 5706
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" />
                <a href="mailto:msniffbusinesshub@gmail.com" className="hover:text-emerald-600 text-slate-800">
                  msniffbusinesshub@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={quickWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm"
                >
                  Chat on WhatsApp Now
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-col gap-3">
            <p>© {new Date().getFullYear()} M.SNIFF BUSINESS HUB. All rights reserved. AIMIT Electric Mobility Ghana.</p>
            {/* Social media links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.tiktok.com/@msniff1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on TikTok"
                className="text-slate-500 hover:text-black transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://www.facebook.com/p/MSniff-Business-Hub-Electric-Bikes-Ghana-61583070550639/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="text-slate-500 hover:text-[#1877F2] transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/msniffbusinesshub/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="text-slate-500 hover:text-[#E1306C] transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center space-x-6">
              <Link href="/legal/privacy" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/legal/terms" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/legal/refund" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Refund Policy</Link>
              <span>•</span>
              <Link href="/legal/cookies" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Cookies Policy</Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/why-electric" className="hover:text-emerald-600 transition-colors">
                Battery Care Guide
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                Nationwide Logistics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
