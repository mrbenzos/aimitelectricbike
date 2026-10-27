'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { ActivityLog, ActivityAction } from '@/lib/types';
import { History, Zap, AlertTriangle, ShoppingBag, Calendar, Trash2, Tag, RefreshCw } from 'lucide-react';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await dbService.getActivityLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'new_order':
        return (
          <span className="bg-electric/20 text-electric border border-electric/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <ShoppingBag className="w-3 h-3" /> New Order
          </span>
        );
      case 'stock_low':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" /> Low Stock Alert
          </span>
        );
      case 'sold':
        return (
          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            Sold Out
          </span>
        );
      case 'price_changed':
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <Tag className="w-3 h-3" /> Price Change
          </span>
        );
      case 'deleted':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <Trash2 className="w-3 h-3" /> Bike Deleted
          </span>
        );
      case 'new_test_ride':
        return (
          <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <Calendar className="w-3 h-3" /> Test Ride
          </span>
        );
      default:
        return (
          <span className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">
            {action}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">System Activity & SMS Audit Trail</h1>
            <p className="text-xs text-gray-400 mt-1">
              Complete chronological ledger of inventory updates, price adjustments, new hub dispatches, and automated SMS triggers (Vynfy).
            </p>
          </div>

          <button
            onClick={loadLogs}
            className="bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-[#333] flex items-center gap-1.5 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit Trail
          </button>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#242424]">
                <tr>
                  <th className="py-3 px-4 w-40">Timestamp</th>
                  <th className="py-3 px-4 w-44">Action Type</th>
                  <th className="py-3 px-4 w-56">Item / Reference</th>
                  <th className="py-3 px-4">Event Details & Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No activity logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        {log.item_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 text-xs leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
