import React from 'react';
import FuelCalculator from '@/components/FuelCalculator';
import { Zap, ShieldCheck, BatteryCharging, Leaf, PiggyBank, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function WhyElectricPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight font-sans">
          Stop Fueling Trotro & Okada Queues. <br />
          <span className="text-emerald-600">Ride Electric & Keep Your Money.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Fuel prices at Ghana pumps continue to surge, impacting everyday commuting budgets and business delivery profits. 
          Discover how switching to an <strong>AIMIT Electric Bicycle</strong> from M.Sniff Business Hub puts thousands of Ghana Cedis back in your pocket every single year.
        </p>
      </div>

      {/* Embedded Fuel Calculator */}
      <FuelCalculator />

      {/* 3 Pillars of E-Mobility in Ghana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Unbeatable Transport Economics</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A full 80km - 100km charge on standard domestic ECG prepaid power costs between <strong>GHS 1.50 and GHS 2.20</strong>. 
            Equivalent trotro journeys cost over GHS 50 - GHS 70, meaning your AIMIT bike pays for its purchase price in 8-12 months.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Beat Rush-Hour Gridlocks</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traffic choke points at Pokuase, Kasoa, Spintex, Circle, and Tamale central market cost Ghanaian workers an average of 3.5 lost hours every day. 
            Glide smoothly on bike shoulders and arrive on time with zero sweat.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Zero Engine Headaches</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No spark plugs, no engine oil changes, no carburetor repairs, and no exhaust fumes. 
            AIMIT brushless motors are maintenance-free and sealed against dust and rain (IP65 rating).
          </p>
        </div>
      </div>

      {/* Trotro vs Okada vs AIMIT Detailed Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-6">
          Ghana Commute Comparison (35km Daily Commute)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Cost Factor</th>
                <th className="py-3.5 px-4 text-center">Trotro</th>
                <th className="py-3.5 px-4 text-center">Okada / Bolt Ride</th>
                <th className="py-3.5 px-4 text-center text-emerald-700 font-bold">AIMIT Electric Bike</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Daily Cost</td>
                <td className="py-3 px-4 text-center">~GHS 30.00</td>
                <td className="py-3 px-4 text-center">~GHS 55.00</td>
                <td className="py-3 px-4 text-center font-black text-emerald-700">~GHS 1.80 (ECG Power)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Monthly Expense (26 Days)</td>
                <td className="py-3 px-4 text-center">GHS 780.00</td>
                <td className="py-3 px-4 text-center">GHS 1,430.00</td>
                <td className="py-3 px-4 text-center font-black text-emerald-700">GHS 46.80</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Annual Expense</td>
                <td className="py-3 px-4 text-center">GHS 9,360.00</td>
                <td className="py-3 px-4 text-center">GHS 17,160.00</td>
                <td className="py-3 px-4 text-center font-black text-emerald-700">GHS 561.60</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Annual Money Retained</td>
                <td className="py-3 px-4 text-center text-slate-400">None</td>
                <td className="py-3 px-4 text-center text-slate-400">None</td>
                <td className="py-3 px-4 text-center font-black text-emerald-700 text-base">+ GHS 8,798 to + GHS 16,598</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Commute Reliability</td>
                <td className="py-3 px-4 text-center text-rose-600 font-medium">Long queues & delays</td>
                <td className="py-3 px-4 text-center text-amber-600 font-medium">Weather & fare surges</td>
                <td className="py-3 px-4 text-center font-bold text-slate-900">100% On-Demand Freedom</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/bikes"
            className="inline-flex items-center bg-electric hover:bg-electric-dark text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider shadow-electric"
          >
            Start Saving Today - Explore AIMIT Fleet <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
