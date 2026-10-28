import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, BatteryCharging, Truck, Award, ArrowRight, Flame } from 'lucide-react';
import { dbService } from '@/lib/supabaseClient';
import BikeCard from '@/components/BikeCard';
import FuelCalculator from '@/components/FuelCalculator';
import RangeTable from '@/components/RangeTable';
import GhanaHubsMap from '@/components/GhanaHubsMap';
import { createWhatsAppLink } from '@/lib/utils';
import CollapsibleSection from '@/components/CollapsibleSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic, always fresh

export default async function HomePage() {
  const bikes = await dbService.getBikes();
  const featuredBikes = bikes.filter((b) => b.featured);
  const remainingBikes = bikes.filter((b) => !b.featured);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION — Bright & Vibrant */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-slate-200 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2000&auto=format&fit=crop"
            alt="AIMIT Electric Bicycle on a rugged terrain path in Ghana"
            className="w-full h-full object-cover object-center opacity-15 scale-105 transform filter brightness-105 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 uppercase leading-none font-sans">
            Save Fuel. Beat Traffic. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
              Ride Electric Ghana.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Heavy-duty <strong>AIMIT Electric Bicycles</strong> for Accra gridlocks and rough savanna paths. 
            Pothole-ready suspension, reduced fuel costs, nationwide delivery from 4 hubs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/bikes"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all uppercase tracking-wider"
            >
              View All E-Bikes <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-emerald-500 font-bold text-sm px-8 py-4 rounded-xl shadow-sm transition-all uppercase tracking-wider"
            >
              Book Free Test Ride
            </Link>
          </div>

          {/* Compact value props — single row */}
          <div className="mt-14 flex flex-wrap justify-center gap-4 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
              <Flame className="w-3.5 h-3.5 text-emerald-600" /> Save on Fuel Costs
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Up to 120 km Range
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 12-Month Warranty
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
              <Truck className="w-3.5 h-3.5 text-emerald-600" /> 4 Nationwide Hubs
            </span>
          </div>
        </div>
      </section>

      {/* 2. TOP 2 FEATURED BIKES — Side by side, clean focus */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs uppercase tracking-widest font-black">
              <Award className="w-4 h-4" />
              Top Picks
            </div>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              Featured AIMIT Models
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Our most popular bikes, tested on Ghana terrain.
            </p>
          </div>
          <Link
            href="/bikes"
            className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider group"
          >
            Browse Full Fleet ({bikes.length} Models) 
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </div>
      </section>

      {/* 3. EXPLORE MORE — Collapsible sections to reduce clutter */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Explore More</h2>
          <p className="text-sm text-slate-600 mt-1">
            Tap any section below to expand.
          </p>
        </div>

        {/* More Bikes */}
        {remainingBikes.length > 0 && (
          <CollapsibleSection
            title="More AIMIT Models"
            subtitle={`${remainingBikes.length} more bikes available`}
            icon="bike"
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {remainingBikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
            <div className="text-center pt-4">
              <Link
                href="/bikes"
                className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
              >
                View All {bikes.length} Bikes in Full Shop <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </CollapsibleSection>
        )}

        {/* Fuel Calculator */}
        <CollapsibleSection
          title="Fuel Savings Calculator"
          subtitle="See how much you could save vs. Trotro, Okada & Petrol"
          icon="calculator"
          defaultOpen={false}
        >
          <div className="pt-4">
            <FuelCalculator />
          </div>
        </CollapsibleSection>

        {/* Battery Range Table */}
        <CollapsibleSection
          title="Battery Range Comparison"
          subtitle="Compare all models side-by-side"
          icon="chart"
          defaultOpen={false}
        >
          <div className="pt-4">
            <RangeTable bikes={bikes} />
          </div>
        </CollapsibleSection>

        {/* Delivery Hubs Map */}
        <CollapsibleSection
          title="Nationwide Delivery Hubs"
          subtitle="Amasaman (HQ), Tamale, Bolga, Bawku"
          icon="map"
          defaultOpen={false}
        >
          <div className="pt-4">
            <GhanaHubsMap />
          </div>
        </CollapsibleSection>
      </section>

      {/* 4. BOTTOM CTA — Clean and vibrant */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <span className="text-xs uppercase tracking-widest text-emerald-100 font-black">
            Ready to Reduce Your Fuel Costs?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Get Your AIMIT Electric Bicycle Delivered This Week
          </h2>
          <p className="text-emerald-50 text-sm mt-2 max-w-xl mx-auto">
            Order via WhatsApp for fastest confirmation, or pick up same-day at Amasaman HQ.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={createWhatsAppLink('Hello M.Sniff Business Hub, I want to order an AIMIT bike now!')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-emerald-950 font-extrabold text-sm px-8 py-4 rounded-xl uppercase tracking-wider shadow-md transition-all hover:scale-105"
            >
              Order on WhatsApp Now
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-300/40 font-bold text-sm px-8 py-4 rounded-xl uppercase tracking-wider transition-all"
            >
              Find Nearest Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
