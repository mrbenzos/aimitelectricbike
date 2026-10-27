'use client';

import React, { useState } from 'react';
import { ChevronDown, Zap, Calculator, BarChart3, MapPin, Star } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  icon?: 'bike' | 'calculator' | 'chart' | 'map' | 'reviews';
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ICON_MAP = {
  bike: Zap,
  calculator: Calculator,
  chart: BarChart3,
  map: MapPin,
  reviews: Star,
};

export default function CollapsibleSection({
  title,
  subtitle,
  icon = 'bike',
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = ICON_MAP[icon] || Zap;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
