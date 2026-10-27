'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { Order, OrderStatus, DELIVERY_HUBS } from '@/lib/types';
import { formatGHS, createWhatsAppLink } from '@/lib/utils';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedHub, setSelectedHub] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dbService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await dbService.updateOrderStatus(id, newStatus);
      await dbService.logActivity(
        'new_order',
        `Order #${id.slice(0, 8)}`,
        `Status updated to ${newStatus.toUpperCase()}`
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Phone or name search
    if (searchPhone.trim()) {
      const query = searchPhone.trim().toLowerCase();
      const matchPhone = order.customer_phone.toLowerCase().includes(query);
      const matchName = order.customer_name.toLowerCase().includes(query);
      if (!matchPhone && !matchName) return false;
    }

    // Hub filter
    if (selectedHub !== 'all' && !order.delivery_hub.toLowerCase().includes(selectedHub.toLowerCase())) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Hub Orders Dispatch</h1>
            <p className="text-xs text-gray-400 mt-1">
              Track customer orders filtered by regional hubs (Amasaman, Tamale, Bolga, Bawku) and update fulfillment statuses.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-[#333] flex items-center gap-1.5 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search by Phone */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Filter by Hub */}
          <div className="sm:col-span-4">
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Delivery Hubs</option>
              <option value="amasaman">Amasaman (HQ)</option>
              <option value="tamale">Tamale Hub</option>
              <option value="bolga">Bolgatanga Hub</option>
              <option value="bawku">Bawku Hub</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="sm:col-span-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#242424]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Info</th>
                  <th className="py-3 px-4">Delivery Hub</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const whatsAppCustomerUrl = createWhatsAppLink(
                      `Hello ${order.customer_name}, this is M.Sniff Business Hub regarding your order #${order.id.slice(0, 8)}.`,
                      order.customer_phone
                    );

                    return (
                      <tr key={order.id} className="hover:bg-[#161616] transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-electric">#{order.id.slice(0, 8)}</span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{order.customer_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-gray-400 font-mono text-[11px]">
                              {order.customer_phone}
                            </span>
                            <a
                              href={whatsAppCustomerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric hover:underline text-[10px] flex items-center"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate max-w-xs">{order.customer_location}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="bg-[#1C1C1C] border border-[#2A2A2A] text-gray-200 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 w-fit">
                            <MapPin className="w-3 h-3 text-electric shrink-0" />
                            {order.delivery_hub}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-electric text-sm">
                          {formatGHS(order.total_price)}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-gray-400">
                          {order.payment_type}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-electric/20 text-electric'
                                : order.status === 'confirmed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : order.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                              className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="bg-electric/20 hover:bg-electric text-electric hover:text-black px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Delivered
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
