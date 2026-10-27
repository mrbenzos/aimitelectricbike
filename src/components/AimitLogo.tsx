'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AimitLogoProps {
  variant?: 'navbar' | 'footer' | 'admin' | 'badge' | 'hero';
  className?: string;
  showTagline?: boolean;
}

export default function AimitLogo({
  variant = 'navbar',
  className = '',
  showTagline = true,
}: AimitLogoProps) {
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 bg-slate-100 border border-emerald-500/30 px-3 py-1.5 rounded-xl ${className}`}>
        <div className="w-8 h-8 relative shrink-0">
          <img
            src="/images/aimit-bike-emerald.png"
            alt="AIMIT Official Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-left">
          <span className="block text-xs font-black text-slate-900 leading-none">AIMIT</span>
          <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-tight">
            Electric Bikes
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/40 p-1.5 flex items-center justify-center shadow-sm">
          <img
            src="/images/aimit-bike-emerald.png"
            alt="AIMIT Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-black text-white leading-none tracking-wide">
              M.SNIFF
            </span>
            <span className="bg-emerald-500 text-black font-black text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wider">
              AIMIT
            </span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5">
            Electric Bikes Console
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-emerald-500/40 p-1.5 flex items-center justify-center shadow-md">
            <img
              src="/images/aimit-bike-emerald.png"
              alt="AIMIT Official Electric Bike Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-slate-900 tracking-wider">
                M.SNIFF
              </span>
              <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase">
                AIMIT
              </span>
            </div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Official Electric Bikes Ghana
            </p>
          </div>
        </div>
        {showTagline && (
          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
            "Save Fuel. Beat Traffic. Ride Electric." — Powered by AIMIT high-torque lithium electric mobility.
          </p>
        )}
      </div>
    );
  }

  // Default: Navbar
  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      {/* Official Bike Icon Box */}
      <div className="w-12 h-11 rounded-xl bg-slate-950 border border-emerald-500/40 p-1 flex items-center justify-center shadow-md group-hover:border-emerald-500 transition-all shrink-0">
        <img
          src="/images/aimit-bike-emerald.png"
          alt="AIMIT Official Electric Bike Logo"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
        />
      </div>

      <div>
        <div className="flex items-center space-x-1.5">
          <span className="text-lg sm:text-xl font-black tracking-wider text-slate-900 font-sans">
            M.SNIFF
          </span>
          <span className="bg-emerald-500 text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded tracking-wider uppercase">
            AIMIT
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold tracking-wide leading-tight">
          AIMIT Electric Bikes Ghana
        </p>
        {showTagline && (
          <p className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5">
            Save Fuel. Beat Traffic. Ride Electric.
          </p>
        )}
      </div>
    </Link>
  );
}
