'use client';

import React from 'react';
import Link from 'next/link';
import { Bike } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import { ArrowUpRight, Battery } from 'lucide-react';

interface RangeTableProps {
  bikes: Bike[];
}

export default function RangeTable({ bikes }: RangeTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-black flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5" />
            Performance Benchmark Matrix
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Battery Range & Speed Comparison Table
          </h3>
        </div>
        <Link
          href="/compare"
          className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-bold"
        >
          Compare Full Specs Side-by-Side <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">AIMIT Model</th>
              <th className="py-3.5 px-4 font-bold text-center">Category</th>
              <th className="py-3.5 px-4 font-bold text-center">Range / Charge</th>
              <th className="py-3.5 px-4 font-bold text-center">Top Speed</th>
              <th className="py-3.5 px-4 font-bold text-center">Motor</th>
              <th className="py-3.5 px-4 font-bold text-center">Charge Time</th>
              <th className="py-3.5 px-4 font-bold text-right">Price (GHS)</th>
              <th className="py-3.5 px-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bikes.map((bike) => {
              const effectivePrice = bike.promo_price || bike.price;
              return (
                <tr key={bike.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={bike.images[0]}
                        alt={bike.model_name}
                        className="w-12 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <Link
                          href={`/bikes/${bike.slug}`}
                          className="font-black text-slate-900 hover:text-emerald-600 transition-colors block"
                        >
                          {bike.model_name}
                        </Link>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                          {bike.battery_type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-md border border-slate-200 capitalize font-medium">
                      {bike.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold">
                    <span className="text-emerald-600 text-base">{bike.range_km} km</span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-900">
                    {bike.max_speed_kmh} km/h
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-slate-700">
                    {bike.motor_watts}W
                  </td>
                  <td className="py-4 px-4 text-center text-slate-500">
                    {bike.charge_time_hrs} hrs
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-black text-emerald-600 text-base">
                      {formatGHS(effectivePrice)}
                    </div>
                    {bike.promo_price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatGHS(bike.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/bikes/${bike.slug}`}
                      className="inline-flex items-center bg-slate-100 hover:bg-emerald-600 text-slate-800 hover:text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 hover:border-emerald-600 transition-all shadow-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
