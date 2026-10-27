'use client';

import React, { useState } from 'react';
import { TrendingUp, Fuel, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatGHS } from '@/lib/utils';
import Link from 'next/link';

export default function FuelCalculator() {
  const [dailyKm, setDailyKm] = useState<number>(35);
  const [currentMode, setCurrentMode] = useState<'trotro' | 'okada' | 'petrol'>('trotro');

  // Daily cost estimates in Ghana Cedis (GHS)
  const getModeCostPerKm = () => {
    switch (currentMode) {
      case 'trotro':
        return 0.85;
      case 'okada':
        return 1.50;
      case 'petrol':
        return 1.80;
    }
  };

  const eBikeCostPerKm = 0.025;

  const currentDailyCost = dailyKm * getModeCostPerKm();
  const eBikeDailyCost = dailyKm * eBikeCostPerKm;
  const dailySaving = Math.max(0, currentDailyCost - eBikeDailyCost);

  const monthlyWorkingDays = 26; // 6 days a week
  const monthlySaving = Math.round(dailySaving * monthlyWorkingDays);
  const annualSaving = Math.round(monthlySaving * 12);

  const avgBikePrice = 11500;
  const paybackMonths = Math.max(1, Math.round((avgBikePrice / (monthlySaving || 1)) * 10) / 10);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-600 font-black flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" />
              Ghana Fuel & Transport Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Calculate Your Monthly Savings
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              See how much you save by replacing daily trotro, okada, or petrol transport with an AIMIT Electric Bicycle.
            </p>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-2">
              Your Current Mode of Daily Transport:
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'trotro', label: 'Trotro Commute', tag: '~GHS 30/day' },
                { id: 'okada', label: 'Okada Rides', tag: '~GHS 55/day' },
                { id: 'petrol', label: 'Petrol Bike/Car', tag: '~GHS 75/day' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCurrentMode(mode.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentMode === mode.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-black">{mode.label}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{mode.tag}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Distance Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                Daily Travel Distance:
              </label>
              <span className="text-lg font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-lg">
                {dailyKm} km / day
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={dailyKm}
              onChange={(e) => setDailyKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>10 km (Local commute)</span>
              <span>50 km (Across Accra/Kumasi)</span>
              <span>100 km (Inter-town)</span>
            </div>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Full charge on ECG grid costs only <strong>~GHS 1.80</strong></span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Zero engine oil changes, no fuel queues, no trotro waiting</span>
            </div>
          </div>
        </div>

        {/* Right: Big Savings Display Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200 p-6 sm:p-8 relative shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-emerald-200/60">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Estimated Monthly Fuel Saving</p>
              <h3 className="text-4xl sm:text-5xl font-black text-emerald-700 mt-1">
                {formatGHS(monthlySaving)}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Annual Savings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatGHS(annualSaving)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Retained in your pocket</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Payoff Time</p>
              <p className="text-2xl font-black text-slate-900 mt-1">~{paybackMonths} Months</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Bike pays for itself completely</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1 mb-6 shadow-sm">
            <div className="flex justify-between">
              <span>Your current daily transport:</span>
              <span className="font-bold text-red-600">{formatGHS(currentDailyCost)} / day</span>
            </div>
            <div className="flex justify-between">
              <span>AIMIT e-bike electricity cost:</span>
              <span className="font-bold text-emerald-600">{formatGHS(eBikeDailyCost)} / day</span>
            </div>
          </div>

          <Link
            href="/bikes"
            className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md uppercase tracking-wider transition-all hover:shadow-lg"
          >
            Switch to Electric - View Bikes <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
