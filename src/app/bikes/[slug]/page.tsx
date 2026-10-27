'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { dbService } from '@/lib/supabaseClient';
import { Bike, DELIVERY_HUBS, DeliveryHubId } from '@/lib/types';
import { formatGHS, calculateInstallment, createWhatsAppLink } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import ProductZoomGallery from '@/components/ProductZoomGallery';
import BikeCard from '@/components/BikeCard';
import {
  Zap,
  Battery,
  Gauge,
  Clock,
  Weight,
  Shield,
  Truck,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Calendar,
  Star,
} from 'lucide-react';

export default function SingleBikePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [bike, setBike] = useState<Bike | null>(null);
  const [relatedBikes, setRelatedBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Purchase configuration states
  const [quantity, setQuantity] = useState(1);
  const [selectedHubId, setSelectedHubId] = useState<DeliveryHubId>('amasaman');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'battery_care' | 'reviews'>('description');
  const [isTestRideModalOpen, setIsTestRideModalOpen] = useState(false);
  const [testRideSubmitting, setTestRideSubmitting] = useState(false);
  const [testRideSuccess, setTestRideSuccess] = useState(false);
  const [testRideForm, setTestRideForm] = useState({
    name: '',
    phone: '',
    hub: 'Amasaman Hub (National HQ)',
    date: '',
  });

  const { addItem } = useCart();

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const foundBike = await dbService.getBikeBySlug(slug);
        if (foundBike) {
          setBike(foundBike);
          const allBikes = await dbService.getBikes();
          const related = allBikes
            .filter((b) => b.id !== foundBike.id)
            .slice(0, 2);
          setRelatedBikes(related);
        }
      } catch (err) {
        console.error('Error fetching bike details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">Loading AIMIT model specifications...</p>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-black text-white">Bike Model Not Found</h2>
        <p className="text-gray-400 mt-2">The requested AIMIT electric bicycle could not be located in inventory.</p>
        <Link
          href="/bikes"
          className="inline-block mt-6 bg-electric text-black font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-electric"
        >
          Browse All Bikes
        </Link>
      </div>
    );
  }

  const effectivePrice = bike.promo_price || bike.price;
  const installment = calculateInstallment(effectivePrice, 40);
  const selectedHub = DELIVERY_HUBS.find((h) => h.id === selectedHubId) || DELIVERY_HUBS[0];
  const totalPriceWithDelivery = effectivePrice * quantity + selectedHub.fee;

  // Formatted WhatsApp message for direct purchase with inspection acknowledgment
  const whatsAppBuyNowMessage = `Hello M.Sniff Business Hub,\n\nI have inspected the specifications, multi-angle photos, and road test video for the *${bike.model_name}* on your website.\n\n- Model: ${bike.model_name}\n- Quantity: ${quantity}\n- Unit Price: ${formatGHS(effectivePrice)}\n- Delivery Hub: ${selectedHub.name} (${selectedHub.fee === 0 ? 'FREE' : '+' + formatGHS(selectedHub.fee)})\n- Total Estimated: ${formatGHS(totalPriceWithDelivery)}\n\nI am ready to proceed with payment and hub delivery. Please send me instructions.`;

  const handleTestRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestRideSubmitting(true);
    try {
      await dbService.createTestRide({
        name: testRideForm.name,
        phone: testRideForm.phone,
        preferred_hub: testRideForm.hub,
        preferred_date: testRideForm.date || new Date().toISOString().split('T')[0],
        bike_interest: bike.model_name,
        status: 'pending',
      });
      await dbService.logActivity(
        'new_test_ride',
        `Test Ride: ${testRideForm.name}`,
        `Booked for ${bike.model_name} at ${testRideForm.hub}`
      );
      setTestRideSuccess(true);
    } catch (err) {
      console.error('Test ride submit error:', err);
    } finally {
      setTestRideSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/bikes" className="hover:text-slate-900 transition-colors">E-Bikes Fleet</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-electric-dark font-bold truncate max-w-[200px] sm:max-w-none">{bike.model_name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left: Interactive Image & Video Stage with Zoom */}
        <div className="lg:col-span-7">
          <ProductZoomGallery
            images={bike.images}
            modelName={bike.model_name}
            videoUrl={bike.video_url}
            videoTitle={bike.video_title}
          />

          {/* Guarantee Badges Row below gallery */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
              <Shield className="w-5 h-5 text-electric mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">{bike.warranty_months} Months Warranty</p>
              <p className="text-[9px] text-slate-500">Official Parts & Labor</p>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
              <Truck className="w-5 h-5 text-electric mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">4 Nationwide Hubs</p>
              <p className="text-[9px] text-slate-500">Pre-Assembled & Tested</p>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
              <Zap className="w-5 h-5 text-electric mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">100% Electric</p>
              <p className="text-[9px] text-slate-500">~GHS 1.80 per 80km charge</p>
            </div>
          </div>

          {/* Ghana Road Inspection Checklist Card */}
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-electric" /> Pre-Purchase Ghana Road Inspection
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Photos & Video Verified</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-bold uppercase">Potholes</span>
                <span className="text-xs font-black text-electric-dark">{bike.terrain_rating?.pothole_score || 9.8}/10</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-bold uppercase">Rain Seal</span>
                <span className="text-xs font-black text-slate-900">{bike.terrain_rating?.water_rating || 'IP65'}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-bold uppercase">Hill Climb</span>
                <span className="text-xs font-black text-slate-900">{bike.terrain_rating?.hill_climb || '35°'}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-bold uppercase">ECG Charge</span>
                <span className="text-xs font-black text-electric-dark">GHS 1.80</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Pricing, Hub Delivery & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category & Stock Pill */}
          <div className="flex items-center justify-between">
            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {bike.category === 'offroad' ? 'Rugged Mountain / Savanna' : bike.category === 'cargo' ? 'Commercial Heavy Cargo' : 'Urban City Commuter'}
            </span>

            {bike.stock_status === 'sold_out' || bike.stock_qty <= 0 ? (
              <span className="bg-red-500/10 text-red-600 border border-red-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                Sold Out
              </span>
            ) : bike.stock_status === 'low' || bike.stock_qty <= 2 ? (
              <span className="bg-amber-500/10 text-amber-700 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase animate-pulse">
                Low Stock (Only {bike.stock_qty} left)
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                In Stock ({bike.stock_qty} units ready)
              </span>
            )}
          </div>

          {/* Title & Short Description */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {bike.model_name}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {bike.short_desc}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-electric-dark">
                {formatGHS(effectivePrice)}
              </span>
              {bike.promo_price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatGHS(bike.price)}
                </span>
              )}
              {bike.promo_price && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Save {formatGHS(bike.price - bike.promo_price)}
                </span>
              )}
            </div>

            {/* Installment Plan Banner */}
            <div className="mt-4 pt-4 border-t border-slate-200 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Flexible M.Sniff Installment
                </span>
                <span className="text-emerald-700 font-black">Pay 40% First</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-normal">
                Initial deposit: <strong className="text-slate-900 font-mono">{formatGHS(installment.downPayment)}</strong>, 
                followed by 3 convenient monthly installments of <strong className="text-emerald-700 font-mono">{formatGHS(installment.monthlyOver3Months)}</strong>.
              </p>
            </div>
          </div>

          {/* Delivery Hub Selection Dropdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" /> Select Delivery Hub (Ghana):
              </span>
              <span className="text-[11px] text-emerald-700 lowercase font-medium">nationwide dispatch</span>
            </label>
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value as DeliveryHubId)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none cursor-pointer"
            >
              {DELIVERY_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} — {hub.fee === 0 ? 'FREE (HQ Pickup/Delivery)' : `+${formatGHS(hub.fee)} transit`} ({hub.estimatedDays})
                </option>
              ))}
            </select>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Transit Time: <strong className="text-slate-800">{selectedHub.estimatedDays}</strong></span>
              <span>Hub Fee: <strong className="text-emerald-700">{selectedHub.fee === 0 ? 'FREE' : formatGHS(selectedHub.fee)}</strong></span>
            </div>
          </div>

          {/* Quantity & Stock Check */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-bold text-sm"
              >
                -
              </button>
              <span className="px-4 py-2 font-mono font-bold text-sm text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  const maxStock = bike.stock_qty > 0 ? bike.stock_qty : 99;
                  setQuantity((q) => Math.min(maxStock, q + 1));
                }}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-bold text-sm"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Total: <strong className="text-slate-900 font-mono">{formatGHS(totalPriceWithDelivery)}</strong>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            {bike.stock_status === 'sold_out' || bike.stock_qty <= 0 ? (
              <a
                href={createWhatsAppLink(`Hello M.Sniff Hub, I would like to pre-order or be notified when ${bike.model_name} is restocked.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm py-4 rounded-xl transition-all uppercase tracking-wider"
              >
                Pre-Order On WhatsApp (Restock Alert)
              </a>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => addItem(bike, quantity, selectedHubId)}
                  className="w-full flex items-center justify-center bg-electric hover:bg-electric-dark text-black font-extrabold text-sm py-4 rounded-xl shadow-electric uppercase tracking-wider transition-all"
                >
                  <ShoppingBag className="w-5 h-5 mr-2 text-black" />
                  Add to Cart ({quantity})
                </button>

                <a
                  href={createWhatsAppLink(whatsAppBuyNowMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Buy Now via WhatsApp Direct
                </a>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsTestRideModalOpen(true)}
              className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-electric text-xs font-bold py-3 rounded-xl uppercase tracking-wider transition-all"
            >
              <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
              Book Free Test Ride at Nearest Hub
            </button>
          </div>
        </div>
      </div>

      {/* TABS SECTION: Description / Specs / Battery Care Tips / Reviews */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-6 pb-2">
          {[
            { id: 'description', label: 'Detailed Description' },
            { id: 'specs', label: 'Full Technical Specs' },
            { id: 'battery_care', label: 'Ghana Battery Care Tips' },
            { id: 'reviews', label: 'Rider Reviews & Ratings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-electric text-black shadow-electric'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-8">
          {/* 1. Description */}
          {activeTab === 'description' && (
            <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Engineered for Ghana's Toughest Commutes
                </h3>
                <p>{bike.full_desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Pothole & Red Mud Protection
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed with reinforced aircraft-grade alloy frame, water-resistant IP65 wiring, and heavy-duty front suspension fork designed to absorb severe shocks from unpaved roads and potholes in Accra, Kumasi, and northern regions.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Ultra-Low Operating Expense
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Charging the removable lithium pack overnight costs less than GHS 2.00 on Ghana Grid electricity, giving you up to {bike.range_km}km of travel. Say goodbye to volatile fuel pumps and trotro fare increases.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Specs Table */}
          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                <tbody>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500 w-1/3">Model Name</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.model_name}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Battery Type</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{bike.battery_type}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Range Per Full Charge</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.range_km} Kilometers</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Maximum Speed</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.max_speed_kmh} km/h</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Motor Power</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.motor_watts} Watts High-Torque Brushless</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Charging Duration</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.charge_time_hrs} Hours (Standard 220V Plug)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Bike Net Weight</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{bike.weight_kg} kg</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Warranty Coverage</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{bike.warranty_months} Months Warranty (Frame, Motor, Controller & Battery)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Frame Material</td>
                    <td className="py-3 px-4 text-slate-900">6061 Heat-Treated Aluminum Alloy</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">Braking System</td>
                    <td className="py-3 px-4 text-slate-900">Front & Rear Dual Hydraulic / Mechanical Disc Brakes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Battery Care Tips */}
          {activeTab === 'battery_care' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
                  <Battery className="w-5 h-5 text-emerald-600" />
                  How to Maximize Lithium Battery Life in Ghana's Climate
                </h3>
                <p className="text-xs text-slate-600">
                  Follow these certified guidelines from M.Sniff Hub to ensure your AIMIT battery lasts 4-6+ years with peak range.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">1. Avoid Charging Under Direct Midday Sun</h4>
                  <p className="text-slate-600">
                    Always charge the removable battery indoors or in a shaded, well-ventilated room. Extreme heat above 40°C reduces lithium cycle life.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">2. Do Not Leave Empty for Long Periods</h4>
                  <p className="text-slate-600">
                    If you are traveling or not riding for more than 2 weeks, keep the battery charged between 50% and 80% rather than completely drained.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">3. Use Only the Official AIMIT Smart Charger</h4>
                  <p className="text-slate-600">
                    AIMIT chargers feature auto-cutoff when full to protect from voltage fluctuations. Never use unbranded laptop or generic adapters.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">4. Rain & Cleaning Precaution</h4>
                  <p className="text-slate-600">
                    AIMIT bikes are IP65 water-resistant and safe in heavy tropical rain. However, do NOT use high-pressure car-wash jet spray directly into battery contact pins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Owner Reviews for {bike.model_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-bold">5.0 / 5.0 (Ghana Verified Riders)</span>
                  </div>
                </div>

                <a
                  href={createWhatsAppLink(`Hello M.Sniff Hub, I want to submit a rider review for ${bike.model_name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-electric text-slate-800 hover:text-black text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-200"
                >
                  Write Review
                </a>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Kwabena Mensah</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">Verified Buyer</span>
                    </div>
                    <span className="text-xs text-slate-400">2 weeks ago</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    "Hands down the best purchase I made this year. I ride from Amasaman through Pokuase interchange to Achimota every single morning. Never get stuck in traffic again and charging is dirt cheap."
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Yakubu Alhassan</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">Tamale Hub Rider</span>
                    </div>
                    <span className="text-xs text-slate-400">1 month ago</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    "Fast delivery to Tamale Sports Stadium hub. Bike was fully assembled and ready to ride out of the box. Battery easily lasts 2 days of regular work runs."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RELATED BIKES (2) */}
      {relatedBikes.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-black">Compare Alternatives</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Related AIMIT Models</h3>
            </div>
            <Link href="/bikes" className="text-xs text-emerald-700 hover:underline font-bold">
              View All Fleet
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedBikes.map((related) => (
              <BikeCard key={related.id} bike={related} />
            ))}
          </div>
        </section>
      )}

      {/* BOOK TEST RIDE MODAL */}
      {isTestRideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Free Experience</span>
                <h3 className="text-xl font-black text-slate-900">Book Test Ride</h3>
                <p className="text-xs text-slate-500 mt-0.5">Model: {bike.model_name}</p>
              </div>
              <button
                onClick={() => {
                  setIsTestRideModalOpen(false);
                  setTestRideSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {testRideSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Test Ride Scheduled!</h4>
                <p className="text-xs text-slate-600">
                  Thanks <strong>{testRideForm.name}</strong>! Our hub coordinator at <strong>{testRideForm.hub}</strong> will contact you via phone ({testRideForm.phone}) shortly.
                </p>
                <button
                  onClick={() => {
                    setIsTestRideModalOpen(false);
                    setTestRideSuccess(false);
                  }}
                  className="mt-4 bg-electric text-black font-extrabold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-electric"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTestRideSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Your Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah"
                    value={testRideForm.name}
                    onChange={(e) => setTestRideForm({ ...testRideForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Phone Number (Ghana):</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0244123456"
                    value={testRideForm.phone}
                    onChange={(e) => setTestRideForm({ ...testRideForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Preferred Hub Location:</label>
                  <select
                    value={testRideForm.hub}
                    onChange={(e) => setTestRideForm({ ...testRideForm, hub: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Amasaman Hub (National HQ)">Amasaman Hub (National HQ - Greater Accra)</option>
                    <option value="Tamale Regional Hub">Tamale Regional Hub (Northern Region)</option>
                    <option value="Bolgatanga Hub">Bolgatanga Hub (Upper East Region)</option>
                    <option value="Bawku Hub">Bawku Hub (Upper East Region)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Preferred Date:</label>
                  <input
                    type="date"
                    required
                    value={testRideForm.date}
                    onChange={(e) => setTestRideForm({ ...testRideForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={testRideSubmitting}
                    className="w-full bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50"
                  >
                    {testRideSubmitting ? 'Confirming...' : 'Confirm Test Ride Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
