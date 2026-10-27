'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { Bike, Order, TestRideBooking, ActivityLog } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import {
  Bike as BikeIcon,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testRides, setTestRides] = useState<TestRideBooking[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [b, o, tr, l] = await Promise.all([
          dbService.getBikes(),
          dbService.getOrders(),
          dbService.getTestRides(),
          dbService.getActivityLogs(),
        ]);
        setBikes(b);
        setOrders(o);
        setTestRides(tr);
        setLogs(l);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalBikes = bikes.length;
  const lowStockBikes = bikes.filter((b) => b.stock_qty <= 2 || b.stock_status === 'low');
  
  // Orders today
  const todayStr = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter((o) => o.created_at.startsWith(todayStr)).length;
  
  // Gross Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);

  const pendingTestRides = testRides.filter((tr) => tr.status === 'pending').length;

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    await dbService.updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs">Loading M.Sniff metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-white">M.Sniff Command Center</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time inventory status, Hub dispatch logistics, and automated Hubtel SMS triggers.
          </p>
        </div>

        {/* 5 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Bikes */}
          <div className="bg-[#141414] border border-[#242424] p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Fleet</span>
              <BikeIcon className="w-4 h-4 text-electric" />
            </div>
            <p className="text-2xl font-black text-white">{totalBikes}</p>
            <p className="text-[10px] text-gray-400 mt-1">AIMIT models listed</p>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-[#141414] border border-[#242424] p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock (≤ 2)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{lowStockBikes.length}</p>
            <p className="text-[10px] text-gray-400 mt-1">SMS alert sent to owner</p>
          </div>

          {/* New Orders Today */}
          <div className="bg-[#141414] border border-[#242424] p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Orders Today</span>
              <ShoppingBag className="w-4 h-4 text-electric" />
            </div>
            <p className="text-2xl font-black text-white">{ordersToday || orders.length}</p>
            <p className="text-[10px] text-gray-400 mt-1">{orders.length} all-time orders</p>
          </div>

          {/* New Test Rides */}
          <div className="bg-[#141414] border border-[#242424] p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Test Rides</span>
              <Calendar className="w-4 h-4 text-electric" />
            </div>
            <p className="text-2xl font-black text-white">{pendingTestRides}</p>
            <p className="text-[10px] text-gray-400 mt-1">Pending hub appointments</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-[#141414] border border-electric/30 p-5 rounded-2xl shadow-electric">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-electric" />
            </div>
            <p className="text-xl font-black text-electric">{formatGHS(totalRevenue)}</p>
            <p className="text-[10px] text-gray-400 mt-1">From orders table</p>
          </div>
        </div>

        {/* Low Stock Warning Banner if any */}
        {lowStockBikes.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Immediate Restock Recommended
              </h3>
              <Link href="/admin/bikes" className="text-xs text-amber-400 underline">
                Manage Stock
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lowStockBikes.map((bike) => (
                <div key={bike.id} className="bg-[#181818] p-3 rounded-xl border border-[#2A2A2A] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{bike.model_name}</p>
                    <p className="text-[10px] text-gray-400">Status: {bike.stock_status}</p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded">
                    {bike.stock_qty} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#222]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders</h3>
              <p className="text-xs text-gray-400">Incoming dispatch orders across all 4 hubs</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-electric hover:underline flex items-center gap-1 font-bold"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#242424]">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Delivery Hub</th>
                  <th className="py-2.5 px-3">Total (GHS)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#161616]">
                    <td className="py-3 px-3 font-mono font-bold text-electric">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{order.customer_phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-[#1C1C1C] px-2 py-0.5 rounded text-[11px] text-gray-200">
                        {order.delivery_hub}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {formatGHS(order.total_price)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          order.status === 'delivered'
                            ? 'bg-electric/20 text-electric'
                            : order.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="bg-electric/20 hover:bg-electric text-electric hover:text-black px-2 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Columns: Recent Test Rides + Activity Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Rides */}
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Test Ride Requests</h3>
              <Link href="/admin/test-rides" className="text-xs text-electric hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2.5">
              {testRides.slice(0, 4).map((tr) => (
                <div key={tr.id} className="bg-[#181818] p-3 rounded-xl border border-[#282828] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{tr.name} ({tr.phone})</p>
                    <p className="text-[10px] text-gray-400">{tr.preferred_hub} • {tr.preferred_date}</p>
                    <p className="text-[10px] text-electric">{tr.bike_interest}</p>
                  </div>
                  <span className="bg-[#222] text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                    {tr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity & SMS Logs</h3>
              <Link href="/admin/activity" className="text-xs text-electric hover:underline">
                Audit Trail
              </Link>
            </div>
            <div className="space-y-2.5">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-[#181818] p-3 rounded-xl border border-[#282828] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{log.item_name}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
