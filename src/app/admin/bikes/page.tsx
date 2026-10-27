'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { Bike } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import { alertBikeAction, alertLowStock } from '@/lib/hubtel';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Ban,
  Sparkles,
  ExternalLink,
  Search,
} from 'lucide-react';

export default function AdminBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    setLoading(true);
    try {
      const data = await dbService.getBikes();
      setBikes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBike = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}? This will trigger an SMS alert to the owner.`)) {
      return;
    }

    try {
      await dbService.deleteBike(id);
      // Trigger Hubtel SMS Alert:
      await alertBikeAction(modelName, 'deleted');
      await dbService.logActivity('deleted', modelName, `Bike deleted by admin. Hubtel SMS fired.`);
      setActionFeedback(`Deleted ${modelName}. SMS alert sent to owner.`);
      loadBikes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete bike');
    }
  };

  const handleMarkSoldOut = async (bike: Bike) => {
    try {
      await dbService.updateBike(bike.id, {
        stock_status: 'sold_out',
        stock_qty: 0,
      });
      // Trigger Hubtel SMS Alert:
      await alertBikeAction(bike.model_name, 'sold_out');
      await dbService.logActivity('sold', bike.model_name, `Marked sold out by admin. SMS alert fired.`);
      setActionFeedback(`Marked ${bike.model_name} as Sold Out. SMS alert sent to owner.`);
      loadBikes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkMarkSoldOut = async () => {
    if (!confirm('Mark all bikes with stock <= 0 or current low stock as Sold Out?')) return;
    for (const b of bikes.filter((item) => item.stock_qty <= 2)) {
      await dbService.updateBike(b.id, { stock_status: 'sold_out' });
      await alertBikeAction(b.model_name, 'sold_out');
    }
    setActionFeedback('Bulk marked low/zero stock bikes as Sold Out. Hubtel alerts fired.');
    loadBikes();
  };

  const filteredBikes = bikes.filter(
    (b) =>
      b.model_name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">AIMIT Fleet Management</h1>
            <p className="text-xs text-gray-400 mt-1">
              Add, update, or delete electric bicycle models, configure pricing, and manage stock quantities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkSoldOut}
              className="bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-300 hover:text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-[#333] transition-all"
            >
              Bulk Mark Sold Out
            </button>
            <Link
              href="/admin/bikes/new"
              className="bg-electric hover:bg-electric-dark text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-electric uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Bike
            </Link>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-electric/10 border border-electric/40 text-electric text-xs p-3 rounded-xl flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bike inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#262626] focus:border-electric rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        {/* Bikes Table */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#242424]">
                <tr>
                  <th className="py-3 px-4">Bike Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (GHS)</th>
                  <th className="py-3 px-4">Range & Speed</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredBikes.map((bike) => {
                  const effectivePrice = bike.promo_price || bike.price;
                  return (
                    <tr key={bike.id} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              bike.images && bike.images.length > 0 && !bike.images[0].startsWith('blob:')
                                ? bike.images[0]
                                : 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop'
                            }
                            alt={bike.model_name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop';
                            }}
                            className="w-12 h-9 object-cover rounded-lg bg-[#222] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">{bike.model_name}</p>
                            <span className="text-[10px] text-gray-500 font-mono">slug: {bike.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-medium">{bike.category}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-electric text-sm">{formatGHS(effectivePrice)}</span>
                        {bike.promo_price && (
                          <span className="block text-[10px] text-gray-500 line-through">
                            {formatGHS(bike.price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{bike.range_km} km</p>
                        <p className="text-[10px] text-gray-400">{bike.max_speed_kmh} km/h • {bike.motor_watts}W</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              bike.stock_status === 'sold_out' || bike.stock_qty <= 0
                                ? 'bg-red-500/20 text-red-400'
                                : bike.stock_status === 'low' || bike.stock_qty <= 2
                                ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                : 'bg-electric/20 text-electric'
                            }`}
                          >
                            {bike.stock_status.replace('_', ' ')}
                          </span>
                          <p className="text-[10px] text-gray-400 font-mono">
                            Qty: <strong className="text-white">{bike.stock_qty}</strong>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {bike.featured ? (
                          <span className="text-electric font-bold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/bikes/${bike.slug}`}
                          target="_blank"
                          className="p-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-gray-400 hover:text-white rounded-lg inline-block"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/bikes/${bike.id}`}
                          className="p-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg inline-block"
                          title="Edit Model"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        {bike.stock_status !== 'sold_out' && (
                          <button
                            onClick={() => handleMarkSoldOut(bike)}
                            className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg inline-block"
                            title="Mark Sold Out & Trigger SMS"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBike(bike.id, bike.model_name)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg inline-block"
                          title="Delete Bike & Trigger SMS"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
