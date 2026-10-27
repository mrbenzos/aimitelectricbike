'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bike, DELIVERY_HUBS, DeliveryHubId } from '@/lib/types';
import { formatGHS, calculateInstallment, createWhatsAppLink } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Video as VideoIcon,
  Shield,
  Zap,
  Battery,
  Gauge,
  Truck,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react';

interface BikeInspectionModalProps {
  bike: Bike | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BikeInspectionModal({
  bike,
  isOpen,
  onClose,
}: BikeInspectionModalProps) {
  const { addItem } = useCart();

  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState<DeliveryHubId>('amasaman');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedPhotoIndex(0);
      setActiveMediaTab('photos');
      setIsPlaying(false);
    }
  }, [isOpen, bike]);

  if (!isOpen || !bike) return null;

  const effectivePrice = bike.promo_price || bike.price;
  const installment = calculateInstallment(effectivePrice, 40);
  const selectedHub = DELIVERY_HUBS.find((h) => h.id === selectedHubId) || DELIVERY_HUBS[0];
  const totalPriceWithHub = effectivePrice + selectedHub.fee;

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Pre-filled WhatsApp checkout message indicating full inspection was reviewed
  const inspectedWhatsAppMsg = `Hello M.Sniff Business Hub,\n\nI have inspected the specifications, multi-angle photos, and road test video for the *${bike.model_name}* on your website.\n\n- Model: ${bike.model_name}\n- Category: ${bike.category.toUpperCase()}\n- Unit Price: ${formatGHS(effectivePrice)}\n- Range: ${bike.range_km} km per charge\n- Selected Delivery Hub: ${selectedHub.name} (${selectedHub.fee === 0 ? 'FREE' : '+' + formatGHS(selectedHub.fee)})\n- Total Estimated: ${formatGHS(totalPriceWithHub)}\n\nI am satisfied with the inspection details and ready to confirm my order. Please send payment/delivery instructions.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative">
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shrink-0">
              <img
                src="/images/aimit-bike-emerald.png"
                alt="AIMIT"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{bike.model_name}</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Inspected & Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                AIMIT Electric Bicycle • Calibrated for Ghana Roads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Media Stage: Tab Switcher (Photos vs Video) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaTab('photos');
                    if (videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeMediaTab === 'photos'
                      ? 'bg-electric text-black shadow-electric'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>4-Angle Photos ({bike.images.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaTab('video');
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }, 100);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeMediaTab === 'video'
                      ? 'bg-electric text-black shadow-electric'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Action Road Video</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:block">
                Inspect components & video before WhatsApp order
              </span>
            </div>

            {/* Media Screen Area */}
            <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {activeMediaTab === 'photos' ? (
                /* Photo stage */
                <div className="relative w-full h-full">
                  <img
                    src={
                      bike.images[selectedPhotoIndex] && !bike.images[selectedPhotoIndex].startsWith('blob:')
                        ? bike.images[selectedPhotoIndex]
                        : bike.images[0] && !bike.images[0].startsWith('blob:')
                        ? bike.images[0]
                        : 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop'
                    }
                    alt={bike.model_name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs text-gray-200">
                    {['Side Profile', 'Digital Cockpit', 'Lithium Battery Pack', 'Suspension & Brakes'][selectedPhotoIndex] || `View ${selectedPhotoIndex + 1}`}
                  </div>
                </div>
              ) : (
                /* Video Player Stage */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={bike.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    playsInline
                    loop
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Video Title Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                      {bike.video_title || `${bike.model_name} — Ghana Road Demonstration`}
                    </span>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="p-1.5 rounded-lg bg-electric text-black font-bold hover:bg-electric-dark transition-all flex items-center gap-1 text-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                      <span>{isPlaying ? 'Pause' : 'Play Footage'}</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="p-1.5 rounded-lg bg-[#222] text-gray-300 hover:text-white transition-all"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-electric" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Thumbnails if Photos tab is active */}
            {activeMediaTab === 'photos' && (
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                {bike.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(i)}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === i
                        ? 'border-electric ring-2 ring-electric/30 scale-102'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-slate-100 py-0.5 text-center truncate">
                      {['Side', 'Cockpit', 'Battery', 'Brakes'][i] || `Angle ${i + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4-Point Ghana Road Rating Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Ghana Road Condition Inspection Checklist
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Pothole Resistance</p>
                <p className="text-sm font-black text-electric-dark mt-0.5">
                  {bike.terrain_rating?.pothole_score || 9.8} / 10
                </p>
                <span className="text-[9px] text-slate-400">Dual Hydraulic Shocks</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Water Resistance</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {bike.terrain_rating?.water_rating || 'IP65 Sealed'}
                </p>
                <span className="text-[9px] text-slate-400">Tropical Heavy Rain</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Hill Climb Ability</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {bike.terrain_rating?.hill_climb || 'Up to 35°'}
                </p>
                <span className="text-[9px] text-slate-400">{bike.motor_watts}W High Torque</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Tested Range</p>
                <p className="text-sm font-black text-electric-dark mt-0.5">
                  {bike.range_km} km / charge
                </p>
                <span className="text-[9px] text-slate-400">~GHS 1.80 ECG Power</span>
              </div>
            </div>
          </div>

          {/* Key Specifications Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery Chemistry
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate">{bike.battery_type}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" /> Max Speed
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">{bike.max_speed_kmh} km/h</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Motor Power
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">{bike.motor_watts} Watts</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Warranty
              </span>
              <p className="text-xs font-bold text-emerald-700 mt-1">{bike.warranty_months} Months Official</p>
            </div>
          </div>

          {/* Delivery Hub & Pricing Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-electric-dark">
                  {formatGHS(effectivePrice)}
                </span>
                {bike.promo_price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatGHS(bike.price)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                40% Initial Downpayment: <strong className="text-slate-900">{formatGHS(installment.downPayment)}</strong>, then {formatGHS(installment.monthlyOver3Months)}/mo
              </p>
            </div>

            <div className="sm:w-60">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Delivery Hub Transit:
              </label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value as DeliveryHubId)}
                className="w-full bg-white border border-slate-200 focus:border-electric rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none cursor-pointer"
              >
                {DELIVERY_HUBS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name.split('(')[0]} — {h.fee === 0 ? 'FREE' : formatGHS(h.fee)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/bikes/${bike.slug}`}
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold underline"
          >
            Open Full Product Specification Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                addItem(bike, 1, selectedHubId);
                onClose();
              }}
              disabled={bike.stock_status === 'sold_out' || bike.stock_qty <= 0}
              className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-5 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Add to Cart
            </button>

            <a
              href={createWhatsAppLink(inspectedWhatsAppMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
