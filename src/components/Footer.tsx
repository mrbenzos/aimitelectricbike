'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, MapPin, Phone, Mail, Clock, Shield, BatteryCharging, ArrowUpRight } from 'lucide-react';
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
                <a href="mailto:info@msniffhub.com" className="hover:text-emerald-600 text-slate-800">
                  info@msniffhub.com
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
          <p>© {new Date().getFullYear()} M.SNIFF BUSINESS HUB. All rights reserved. AIMIT Electric Mobility Ghana.</p>
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
