'use client';

import React, { useState } from 'react';
import { MapPin, Truck, Phone, User, Clock } from 'lucide-react';
import { DELIVERY_HUBS } from '@/lib/types';
import { formatGHS, createWhatsAppLink } from '@/lib/utils';

export default function GhanaHubsMap() {
  const [selectedHubId, setSelectedHubId] = useState<string>('amasaman');

  const hubs = DELIVERY_HUBS.filter((h) => h.id !== 'other');
  const activeHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-emerald-600 font-black flex items-center justify-center gap-1.5">
          <Truck className="w-4 h-4" />
          Nationwide Ghana Logistics Backbone
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          4 Strategic Delivery & Service Hubs
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          From Greater Accra to the Northern and Upper East borders, your AIMIT electric bicycle is delivered safely, assembled, and road-tested by certified technicians.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Ghana Map Canvas */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative aspect-square sm:aspect-[4/3] flex items-center justify-center overflow-hidden shadow-inner">
          {/* Stylized Ghana SVG outline */}
          <svg
            viewBox="0 0 400 500"
            className="w-full h-full max-h-[420px] drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ghana territory path approximation */}
            <path
              d="M170 30 L260 25 L290 55 L310 100 L300 160 L320 220 L300 300 L270 360 L280 410 L230 460 L180 470 L140 450 L110 390 L100 320 L80 260 L90 190 L120 130 L130 70 Z"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="2"
            />

            {/* Lake Volta accent */}
            <path
              d="M240 220 Q260 270 250 330 Q240 350 230 380"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.5"
            />

            {/* Hub Dispatches lines from Amasaman HQ */}
            <line x1="200" y1="440" x2="205" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            <line x1="205" y1="200" x2="225" y2="105" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            <line x1="225" y1="105" x2="270" y2="70" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

            {/* Hub Node: Bawku */}
            <g
              onClick={() => setSelectedHubId('bawku')}
              className="cursor-pointer group"
              transform="translate(270, 70)"
            >
              <circle r={selectedHubId === 'bawku' ? 12 : 8} fill={selectedHubId === 'bawku' ? '#10B981' : '#FFFFFF'} stroke="#059669" strokeWidth="2.5" />
              <text x="16" y="4" fill={selectedHubId === 'bawku' ? '#059669' : '#1E293B'} fontSize="11" fontWeight="bold">Bawku</text>
            </g>

            {/* Hub Node: Bolga */}
            <g
              onClick={() => setSelectedHubId('bolga')}
              className="cursor-pointer group"
              transform="translate(225, 105)"
            >
              <circle r={selectedHubId === 'bolga' ? 12 : 8} fill={selectedHubId === 'bolga' ? '#10B981' : '#FFFFFF'} stroke="#059669" strokeWidth="2.5" />
              <text x="-55" y="4" fill={selectedHubId === 'bolga' ? '#059669' : '#1E293B'} fontSize="11" fontWeight="bold">Bolga</text>
            </g>

            {/* Hub Node: Tamale */}
            <g
              onClick={() => setSelectedHubId('tamale')}
              className="cursor-pointer group"
              transform="translate(205, 200)"
            >
              <circle r={selectedHubId === 'tamale' ? 12 : 8} fill={selectedHubId === 'tamale' ? '#10B981' : '#FFFFFF'} stroke="#059669" strokeWidth="2.5" />
              <text x="16" y="4" fill={selectedHubId === 'tamale' ? '#059669' : '#1E293B'} fontSize="12" fontWeight="bold">Tamale</text>
            </g>

            {/* Hub Node: Amasaman (HQ) */}
            <g
              onClick={() => setSelectedHubId('amasaman')}
              className="cursor-pointer group"
              transform="translate(200, 440)"
            >
              <circle r={selectedHubId === 'amasaman' ? 14 : 10} fill={selectedHubId === 'amasaman' ? '#10B981' : '#FFFFFF'} stroke="#059669" strokeWidth="3" />
              <text x="18" y="5" fill={selectedHubId === 'amasaman' ? '#059669' : '#0F172A'} fontSize="12" fontWeight="900">Amasaman (HQ)</text>
            </g>
          </svg>

          {/* Interactive Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-700 flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Click any hub to inspect details</span>
          </div>
        </div>

        {/* Right: Selected Hub Details Card */}
        <div className="lg:col-span-6 space-y-4">
          {/* Tab buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {hubs.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => setSelectedHubId(hub.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedHubId === hub.id
                    ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs block truncate">{hub.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-90 block">{hub.id === 'amasaman' ? 'Free (HQ)' : formatGHS(hub.fee)}</span>
              </button>
            ))}
          </div>

          {/* Detailed Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{activeHub.name}</h3>
                  {activeHub.isHQ && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      National HQ
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">{activeHub.region}</p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Hub Transit Fee</span>
                <span className="text-lg font-black text-slate-900">
                  {activeHub.fee === 0 ? 'FREE (HQ Pickup)' : formatGHS(activeHub.fee)}
                </span>
              </div>
            </div>

            <div className="space-y-3 py-4 text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500">Physical Address / Pickup Location:</p>
                  <p className="text-slate-900 font-medium text-xs sm:text-sm">{activeHub.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500">Transit & Delivery Schedule:</p>
                  <p className="text-slate-900 font-medium text-xs sm:text-sm">{activeHub.estimatedDays}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500">Hub Manager / Technician Lead:</p>
                  <p className="text-slate-900 font-medium text-xs sm:text-sm">{activeHub.manager}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500">Direct Hub Contact:</p>
                  <p className="text-emerald-700 font-mono font-bold text-sm">{activeHub.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <a
                href={createWhatsAppLink(`Hello M.Sniff, I want to arrange pickup or delivery through the *${activeHub.name}*.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-sm"
              >
                Inquire on WhatsApp
              </a>
              <a
                href={`tel:${activeHub.phone.replace(/[^0-9]/g, '')}`}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center border border-slate-200"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
