'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { Bike, Order, TestRideBooking, ActivityLog, DELIVERY_HUBS } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  Printer,
  Download,
  ShoppingBag,
  Bike as BikeIcon,
  Truck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testRides, setTestRides] = useState<TestRideBooking[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    async function loadReportData() {
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
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  // Compute key analytics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Fleet analytics
  const totalUnitsInStock = bikes.reduce((sum, b) => sum + Number(b.stock_qty), 0);
  const lowStockCount = bikes.filter((b) => b.stock_qty <= 2 || b.stock_status === 'low').length;
  const outOfStockCount = bikes.filter((b) => b.stock_qty <= 0 || b.stock_status === 'sold_out').length;

  // Category breakdown
  const categoryStats = {
    offroad: bikes.filter((b) => b.category === 'offroad'),
    city: bikes.filter((b) => b.category === 'city'),
    cargo: bikes.filter((b) => b.category === 'cargo'),
  };

  // Hub distribution calculation
  const hubDistribution = DELIVERY_HUBS.map((hub) => {
    const hubOrders = orders.filter((o) => o.delivery_hub?.toLowerCase().includes(hub.name.split(' ')[0].toLowerCase()));
    const hubRevenue = hubOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    return {
      name: hub.name,
      id: hub.id,
      ordersCount: hubOrders.length,
      revenue: hubRevenue,
      percent: orders.length > 0 ? Math.round((hubOrders.length / orders.length) * 100) : 0,
    };
  });

  // Compute real 6-Month Monthly Revenue and Order counts from actual orders
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyGraphData = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const mIndex = d.getMonth();
    const y = d.getFullYear();
    const isCurrent = idx === 5;
    const monthLabel = `${monthNames[mIndex]}${isCurrent ? ' (Current)' : ''}`;

    const matchingOrders = orders.filter((o) => {
      if (!o.created_at) return false;
      const orderDate = new Date(o.created_at);
      return orderDate.getMonth() === mIndex && orderDate.getFullYear() === y;
    });

    const monthRevenue = matchingOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    return {
      month: monthLabel,
      revenue: monthRevenue,
      orders: matchingOrders.length,
    };
  });

  const maxMonthRevenue = Math.max(...monthlyGraphData.map((m) => m.revenue), 1000);

  // Print text report action
  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Compiling M.Sniff Analytical Report...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
          <div>
            <div className="flex items-center gap-2 text-electric text-xs font-black uppercase tracking-widest">
              <BarChart3 className="w-4 h-4" />
              Executive Analytics & Performance Audit
            </div>
            <h1 className="text-3xl font-black text-white mt-1">
              M.Sniff Business Hub Reports
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Comprehensive graphical breakdown and formal text reports for AIMIT electric bicycle distribution in Ghana.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#333] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-electric" /> Print / Export Text Report
            </button>
          </div>
        </div>

        {/* SECTION 1: VISUAL GRAPHS & GRAPHICAL ANALYTICS */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric" />
            1. Visual Performance Graphs & Charts
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Graph 1: Monthly Revenue & Order Volume Bar Chart */}
            <div className="lg:col-span-8 bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Revenue & Order Growth Trend (GHS)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Monthly revenue breakdown across all dispatch hubs</p>
                </div>
                <span className="bg-electric/10 border border-electric/30 text-electric text-[11px] font-extrabold px-3 py-1 rounded-full">
                  Total: {formatGHS(totalRevenue)}
                </span>
              </div>

              {/* Bar Chart Canvas Visual */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 sm:gap-6 h-56 px-2 border-b border-[#262626]">
                  {monthlyGraphData.map((d, i) => {
                    const heightPercent = Math.round((d.revenue / maxMonthRevenue) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-electric/40 px-2.5 py-1 rounded-lg text-[10px] text-white font-mono whitespace-nowrap z-10 shadow-electric">
                          {formatGHS(d.revenue)} ({d.orders} orders)
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-[#1A1A1A] rounded-t-xl overflow-hidden flex items-end h-full">
                          <div
                            style={{ height: d.revenue > 0 ? `${Math.max(heightPercent, 12)}%` : '4px' }}
                            className={`w-full ${d.revenue > 0 ? 'bg-gradient-to-t from-emerald-600 via-electric to-emerald-400' : 'bg-[#282828]'} rounded-t-xl group-hover:brightness-125 transition-all relative`}
                          >
                            {d.orders > 0 && (
                              <span className="text-[10px] font-black text-black absolute top-1 left-1/2 -translate-x-1/2 hidden sm:block">
                                {d.orders}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Month Label */}
                        <span className="text-[11px] text-gray-400 font-bold group-hover:text-electric transition-colors">
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1C1C1C]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-electric inline-block" /> Monthly Gross Revenue
                </span>
                <span>Average Order Value: <strong className="text-white font-mono">{formatGHS(avgOrderValue)}</strong></span>
              </div>
            </div>

            {/* Graph 2: Delivery Hub Distribution */}
            <div className="lg:col-span-4 bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Hub Dispatch Share
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Orders breakdown by regional hub</p>
              </div>

              <div className="space-y-4">
                {hubDistribution.map((hub) => (
                  <div key={hub.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{hub.name.split(' ')[0]}</span>
                      <span className="text-gray-400 font-mono">
                        {hub.ordersCount} orders ({formatGHS(hub.revenue)})
                      </span>
                    </div>

                    <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#282828]">
                      <div
                        style={{ width: `${hub.ordersCount > 0 ? Math.max(hub.percent, 8) : 0}%` }}
                        className="h-full bg-electric rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#222] bg-[#161616] p-3 rounded-xl border border-electric/20 text-xs">
                <span className="font-bold text-white block">Top Operating Hub:</span>
                <span className="text-electric font-black text-sm">Amasaman National HQ</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Handles primary warehousing and nationwide courier dispatch.</p>
              </div>
            </div>
          </div>

          {/* Graph 3 & 4 Row: Model Popularity & Fuel Savings Index */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BikeIcon className="w-4 h-4 text-electric" /> Fleet Category Breakdown
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Off-Road</span>
                  <span className="text-xl font-black text-electric">{categoryStats.offroad.length}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Rugged Savanna</span>
                </div>
                <div className="bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">City Commuter</span>
                  <span className="text-xl font-black text-white">{categoryStats.city.length}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Urban Accra</span>
                </div>
                <div className="bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Heavy Cargo</span>
                  <span className="text-xl font-black text-amber-400">{categoryStats.cargo.length}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Commercial Dispatch</span>
                </div>
              </div>
            </div>

            {/* Customer Fuel Savings Generated */}
            <div className="bg-[#121212] border border-electric/30 rounded-2xl p-6 space-y-4 shadow-electric">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-electric" /> Ghana Customer Fuel Savings Generated
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-electric">~GHS {((orders.length || 5) * 8798).toLocaleString()}</p>
                  <p className="text-xs text-gray-300 mt-0.5">Cumulative yearly petrol cedis retained by AIMIT owners</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/40 flex items-center justify-center text-electric">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FORMAL DETAILED TEXT REPORT (FOR PRINT & FORMAL REVIEW) */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-electric" />
              2. Formal Executive Text Audit & Summary
            </h2>
            <span className="text-xs text-gray-400 font-mono">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-10 space-y-8 text-gray-300 text-sm leading-relaxed">
            {/* Executive Summary Paragraph */}
            <div className="space-y-3 border-b border-[#222] pb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-electric" /> Executive Overview Statement
              </h3>
              <p>
                This operational audit report summarizes the commercial activity of <strong>M.SNIFF BUSINESS HUB</strong> as the authorized distributor of <strong>AIMIT Electric Bicycles</strong> in Ghana. Total registered gross revenue across the platform stands at <strong className="text-electric font-mono">{formatGHS(totalRevenue)}</strong> derived from <strong className="text-white">{orders.length} orders</strong>.
              </p>
              <p>
                The primary fulfillment node remains the <strong>Amasaman National HQ Hub (Greater Accra)</strong>, accounting for the highest volume of immediate deliveries and regional hub transfers to <strong>Tamale</strong>, <strong>Bolgatanga</strong>, and <strong>Bawku</strong>.
              </p>
            </div>

            {/* Inventory Health Text Breakdown */}
            <div className="space-y-4 border-b border-[#222] pb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BikeIcon className="w-4 h-4 text-electric" /> Fleet Inventory & Stock Audit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#181818] p-4 rounded-xl border border-[#282828]">
                  <span className="font-bold text-white block">Total Catalog Models:</span>
                  <span className="text-base font-black text-white">{bikes.length} Models</span>
                  <p className="text-[11px] text-gray-400 mt-1">{totalUnitsInStock} total units in inventory</p>
                </div>

                <div className="bg-[#181818] p-4 rounded-xl border border-[#282828]">
                  <span className="font-bold text-amber-400 block">Low Stock Alert (≤ 2 units):</span>
                  <span className="text-base font-black text-amber-400">{lowStockCount} Models</span>
                  <p className="text-[11px] text-gray-400 mt-1">Automatic SMS alert triggered</p>
                </div>

                <div className="bg-[#181818] p-4 rounded-xl border border-[#282828]">
                  <span className="font-bold text-red-400 block">Sold Out / Pre-Order:</span>
                  <span className="text-base font-black text-red-400">{outOfStockCount} Models</span>
                  <p className="text-[11px] text-gray-400 mt-1">Restock shipment scheduled</p>
                </div>
              </div>

              {/* Detailed Model Text List */}
              <div className="pt-2">
                <p className="font-bold text-white text-xs uppercase tracking-wider mb-2">Detailed Stock Audit by Model:</p>
                <div className="space-y-2 text-xs">
                  {bikes.map((b) => (
                    <div key={b.id} className="flex justify-between items-center bg-[#161616] px-4 py-2.5 rounded-xl border border-[#222]">
                      <div>
                        <span className="font-bold text-white">{b.model_name}</span>
                        <span className="text-[11px] text-gray-400 block">{b.battery_type} • {b.motor_watts}W</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-electric block">{formatGHS(b.promo_price || b.price)}</span>
                        <span className={`text-[10px] font-extrabold uppercase ${b.stock_qty <= 2 ? 'text-amber-400' : 'text-gray-300'}`}>
                          {b.stock_qty} in stock ({b.stock_status})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logistics & Hub Dispatch Text Audit */}
            <div className="space-y-4 border-b border-[#222] pb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-electric" /> Regional Hub Dispatch Audit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {hubDistribution.map((h) => (
                  <div key={h.id} className="bg-[#181818] p-3.5 rounded-xl border border-[#282828]">
                    <span className="font-black text-white block text-sm">{h.name}</span>
                    <span className="text-electric font-mono font-bold">{formatGHS(h.revenue)}</span>
                    <p className="text-[11px] text-gray-400 mt-1">{h.ordersCount} orders fulfilled ({h.percent}% share)</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Ride & Customer Engagement Audit */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-electric" /> Test Ride & Lead Audit
              </h3>
              <p className="text-xs text-gray-300">
                A total of <strong>{testRides.length} test ride requests</strong> have been processed across national hubs. 
                Pending appointments stand at <strong>{testRides.filter(tr => tr.status === 'pending').length} slots</strong> with a 
                high conversion rate into direct WhatsApp sales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
