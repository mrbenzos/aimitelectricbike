'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { TestRideBooking } from '@/lib/types';
import { createWhatsAppLink } from '@/lib/utils';
import { Calendar, MapPin, Phone, MessageCircle, CheckCircle2, Clock } from 'lucide-react';

export default function AdminTestRidesPage() {
  const [testRides, setTestRides] = useState<TestRideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hubFilter, setHubFilter] = useState('all');

  useEffect(() => {
    loadTestRides();
  }, []);

  const loadTestRides = async () => {
    setLoading(true);
    try {
      const data = await dbService.getTestRides();
      setTestRides(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = testRides.filter((tr) => {
    if (hubFilter === 'all') return true;
    return tr.preferred_hub.toLowerCase().includes(hubFilter.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Test Ride Bookings</h1>
            <p className="text-xs text-gray-400 mt-1">
              Customer test ride reservations across Amasaman HQ, Tamale, Bolga, and Bawku hubs.
            </p>
          </div>

          <div className="w-64">
            <select
              value={hubFilter}
              onChange={(e) => setHubFilter(e.target.value)}
              className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Delivery Hubs</option>
              <option value="amasaman">Amasaman HQ</option>
              <option value="tamale">Tamale Hub</option>
              <option value="bolga">Bolga Hub</option>
              <option value="bawku">Bawku Hub</option>
            </select>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#242424]">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Assigned Hub</th>
                  <th className="py-3 px-4">Preferred Date</th>
                  <th className="py-3 px-4">Bike of Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No test ride bookings found for this hub.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tr) => {
                    const whatsAppUrl = createWhatsAppLink(
                      `Hello ${tr.name}, this is M.Sniff Business Hub confirming your test ride booking for ${tr.bike_interest} on ${tr.preferred_date} at our ${tr.preferred_hub}.`,
                      tr.phone
                    );

                    return (
                      <tr key={tr.id} className="hover:bg-[#161616]">
                        <td className="py-3.5 px-4 font-bold text-white text-sm">{tr.name}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-300">{tr.phone}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-[#1C1C1C] px-2.5 py-1 rounded-lg border border-[#2E2E2E] text-[11px] text-gray-200">
                            {tr.preferred_hub}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {new Date(tr.preferred_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-electric font-semibold">
                          {tr.bike_interest || 'AIMIT E-Bike'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              tr.status === 'confirmed'
                                ? 'bg-electric/20 text-electric'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {tr.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
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
