'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/supabaseClient';
import { Bike } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ArrowLeftRight, Check, Zap, ShoppingBag, Battery, Gauge, Shield, Clock } from 'lucide-react';

export default function ComparePage() {
  const [allBikes, setAllBikes] = useState<Bike[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();

  useEffect(() => {
    async function fetchBikes() {
      try {
        const data = await dbService.getBikes();
        setAllBikes(data);
        if (data.length >= 2) {
          // Pre-select first 2-3 bikes for instant comparison
          setSelectedIds([data[0].id, data[1].id, data[2]?.id].filter(Boolean));
        }
      } catch (err) {
        console.error('Error fetching bikes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBikes();
  }, []);

  const handleSelectBike = (index: number, bikeId: string) => {
    const updated = [...selectedIds];
    updated[index] = bikeId;
    setSelectedIds(updated);
  };

  const comparedBikes = selectedIds
    .map((id) => allBikes.find((b) => b.id === id))
    .filter(Boolean) as Bike[];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading AIMIT comparison matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-black flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            Decision Helper
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
            Compare AIMIT Electric Bicycles
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Compare battery chemistry, range per charge, motor wattage, and price side-by-side to find the ideal match for your daily commute or business logistics.
          </p>
        </div>

        {/* Slot Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
          {[0, 1, 2].map((slotIdx) => (
            <div key={slotIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Compare Slot {slotIdx + 1}:
              </label>
              <select
                value={selectedIds[slotIdx] || ''}
                onChange={(e) => handleSelectBike(slotIdx, e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-electric rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose an AIMIT model --</option>
                {allBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.model_name} ({formatGHS(bike.promo_price || bike.price)})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {comparedBikes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Please select at least one bike model to compare.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              {/* Table Header / Sticky Bike Cards */}
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 w-1/4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                    Model & Aesthetics
                  </th>
                  {comparedBikes.map((bike) => (
                    <th key={bike.id} className="p-6 w-1/4 text-center align-top">
                      <div className="space-y-3">
                        <img
                          src={bike.images[0]}
                          alt={bike.model_name}
                          className="w-full aspect-[4/3] object-cover rounded-xl bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <Link
                            href={`/bikes/${bike.slug}`}
                            className="text-base font-black text-slate-900 hover:text-emerald-700 transition-colors"
                          >
                            {bike.model_name}
                          </Link>
                          <p className="text-xs text-emerald-700 font-bold mt-1">
                            {formatGHS(bike.promo_price || bike.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => addItem(bike, 1)}
                          disabled={bike.stock_status === 'sold_out' || bike.stock_qty <= 0}
                          className="w-full inline-flex items-center justify-center bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-2 px-3 rounded-lg shadow-electric transition-all disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                          {bike.stock_status === 'sold_out' ? 'Sold Out' : 'Add to Cart'}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-slate-100">
                {/* Category */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Category</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center capitalize text-slate-900 font-medium">
                      {bike.category}
                    </td>
                  ))}
                </tr>

                {/* Range */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Range Per Charge</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center font-black text-electric-dark text-base">
                      {bike.range_km} km
                    </td>
                  ))}
                </tr>

                {/* Speed */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Max Top Speed</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center font-bold text-slate-900">
                      {bike.max_speed_kmh} km/h
                    </td>
                  ))}
                </tr>

                {/* Motor */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Motor Power</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center font-bold text-slate-900">
                      {bike.motor_watts} Watts
                    </td>
                  ))}
                </tr>

                {/* Battery Type */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Battery Chemistry</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center text-xs text-slate-600">
                      {bike.battery_type}
                    </td>
                  ))}
                </tr>

                {/* Charge Time */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Charging Duration</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center text-slate-900">
                      {bike.charge_time_hrs} Hours
                    </td>
                  ))}
                </tr>

                {/* Weight */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Total Weight</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center text-slate-900">
                      {bike.weight_kg} kg
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Warranty</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center text-emerald-700 font-semibold">
                      {bike.warranty_months} Months
                    </td>
                  ))}
                </tr>

                {/* Stock Status */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-500">Availability</td>
                  {comparedBikes.map((bike) => (
                    <td key={bike.id} className="p-4 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          bike.stock_status === 'sold_out'
                            ? 'bg-red-500/10 text-red-600 border border-red-200'
                            : bike.stock_status === 'low'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {bike.stock_status.replace('_', ' ')} ({bike.stock_qty})
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
