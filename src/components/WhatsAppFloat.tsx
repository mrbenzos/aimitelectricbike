'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Zap, ChevronRight } from 'lucide-react';
import { createWhatsAppLink } from '@/lib/utils';

export default function WhatsAppFloat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Do not render floating WhatsApp on admin portal routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const quickOptions = [
    {
      title: 'Order AIMIT E-Bike',
      desc: 'Send bike model & get instant invoice',
      msg: 'Hello M.Sniff Hub, I am interested in purchasing an AIMIT Electric Bicycle. Please send me your current stock availability and pricing.',
    },
    {
      title: 'Check Delivery to My Hub',
      desc: 'Amasaman, Tamale, Bolga, Bawku transit',
      msg: 'Hello M.Sniff Hub, I want to inquire about bike delivery to my location in Ghana. How long does transit take?',
    },
    {
      title: 'Book a Free Test Ride',
      desc: 'Try the bike at nearest hub',
      msg: 'Hello M.Sniff Hub, I would like to schedule a free test ride for an AIMIT electric bike.',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div 
          className="mb-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-slate-800"
          role="dialog"
          aria-label="WhatsApp quick contact menu"
        >
          {/* Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm leading-tight">M.Sniff Business Hub</p>
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Online • Typically replies in 5 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp menu"
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick options */}
          <div className="p-3 space-y-2">
            <p className="text-xs text-slate-500 px-1 font-medium">How can we help you today?</p>
            {quickOptions.map((opt, i) => (
              <a
                key={i}
                href={createWhatsAppLink(opt.msg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {opt.title}
                    </p>
                    <p className="text-[10px] text-slate-500">{opt.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </a>
            ))}
          </div>

          {/* Bottom custom chat */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <a
              href={createWhatsAppLink('Hello M.Sniff Business Hub, I want to inquire about AIMIT Electric Bicycles.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm"
            >
              Open Direct WhatsApp Chat
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-black shadow-lg shadow-black/20 hover:scale-105 transition-all focus:outline-none"
        aria-expanded={isOpen}
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping opacity-60 pointer-events-none" />
        {isOpen ? (
          <X className="w-7 h-7 text-black stroke-[2.5]" />
        ) : (
          <MessageCircle className="w-7 h-7 text-black fill-black" />
        )}
      </button>
    </div>
  );
}
