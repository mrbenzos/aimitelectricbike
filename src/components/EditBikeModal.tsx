'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/supabaseClient';
import { Bike, BikeCategory, StockStatus } from '@/lib/types';
import { alertLowStock, alertBikeAction } from '@/lib/hubtel';
import {
  X,
  Upload,
  Trash2,
  Zap,
  Battery,
  Shield,
  Video,
  Award,
  Activity,
  ExternalLink,
  Check,
} from 'lucide-react';

interface EditBikeModalProps {
  bike: Bike | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Bike) => void;
}

export default function EditBikeModal({
  bike,
  isOpen,
  onClose,
  onSaved,
}: EditBikeModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'media' | 'terrain'>('specs');

  // Form Fields
  const [modelName, setModelName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BikeCategory>('offroad');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [price, setPrice] = useState<number>(12000);
  const [promoPrice, setPromoPrice] = useState<string>('');

  // Technical Specs
  const [batteryType, setBatteryType] = useState('48V 15Ah LG Removable Lithium-Ion');
  const [rangeKm, setRangeKm] = useState<number>(85);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(45);
  const [chargeTimeHrs, setChargeTimeHrs] = useState<number>(5.0);
  const [motorWatts, setMotorWatts] = useState<number>(750);
  const [weightKg, setWeightKg] = useState<number>(26.0);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);

  // Stock & Status
  const [stockQty, setStockQty] = useState<number>(5);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [featured, setFeatured] = useState<boolean>(false);

  // Video & Media
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('');

  // Terrain Ratings
  const [potholeScore, setPotholeScore] = useState<number>(9);
  const [hillClimb, setHillClimb] = useState<string>('Up to 25° Incline');
  const [waterRating, setWaterRating] = useState<string>('IP65 Weatherproof / Heavy Rain');

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (bike) {
      setModelName(bike.model_name || '');
      setSlug(bike.slug || '');
      setCategory(bike.category || 'offroad');
      setShortDesc(bike.short_desc || '');
      setFullDesc(bike.full_desc || '');
      setPrice(bike.price || 0);
      setPromoPrice(bike.promo_price ? String(bike.promo_price) : '');
      setBatteryType(bike.battery_type || '48V 15Ah LG Removable Lithium-Ion');
      setRangeKm(bike.range_km ?? 85);
      setMaxSpeedKmh(bike.max_speed_kmh ?? 45);
      setChargeTimeHrs(bike.charge_time_hrs ?? 5.0);
      setMotorWatts(bike.motor_watts ?? 750);
      setWeightKg(bike.weight_kg ?? 26.0);
      setWarrantyMonths(bike.warranty_months ?? 12);
      setStockQty(bike.stock_qty ?? 5);
      setStockStatus(bike.stock_status || 'in_stock');
      setFeatured(Boolean(bike.featured));
      setVideoUrl(bike.video_url || '');
      setVideoTitle(bike.video_title || '');
      setVideoDuration(bike.video_duration || '');
      if (bike.terrain_rating) {
        setPotholeScore(bike.terrain_rating.pothole_score ?? 9);
        setHillClimb(bike.terrain_rating.hill_climb || 'Up to 25° Incline');
        setWaterRating(bike.terrain_rating.water_rating || 'IP65 Weatherproof / Heavy Rain');
      } else {
        setPotholeScore(9);
        setHillClimb('Up to 25° Incline');
        setWaterRating('IP65 Weatherproof / Heavy Rain');
      }
      setImages(bike.images || []);
      setErrorMsg(null);
    }
  }, [bike]);

  if (!isOpen || !bike) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.urls && data.urls.length > 0) {
          setImages((prev) => [...data.urls, ...prev]);
          return;
        }
      }

      // Base64 fallback if upload fails
      const base64Urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        base64Urls.push(base64);
      }
      setImages((prev) => [...base64Urls, ...prev]);
    } catch (err: any) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (customImageUrl.trim()) {
      setImages((prev) => [customImageUrl.trim(), ...prev]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let determinedStatus: StockStatus = stockStatus;
      if (stockQty <= 0) {
        determinedStatus = 'sold_out';
      } else if (stockQty <= 2) {
        determinedStatus = 'low';
      }

      const payload: Partial<Bike> = {
        model_name: modelName,
        slug,
        category,
        short_desc: shortDesc,
        full_desc: fullDesc,
        price: Number(price),
        promo_price: promoPrice ? Number(promoPrice) : null,
        battery_type: batteryType,
        range_km: Number(rangeKm),
        max_speed_kmh: Number(maxSpeedKmh),
        charge_time_hrs: Number(chargeTimeHrs),
        motor_watts: Number(motorWatts),
        weight_kg: Number(weightKg),
        warranty_months: Number(warrantyMonths),
        stock_qty: Number(stockQty),
        stock_status: determinedStatus,
        featured,
        video_url: videoUrl.trim() || undefined,
        video_title: videoTitle.trim() || undefined,
        video_duration: videoDuration.trim() || undefined,
        terrain_rating: {
          pothole_score: Number(potholeScore),
          hill_climb: hillClimb.trim(),
          water_rating: waterRating.trim(),
        },
        images,
      };

      const updated = await dbService.updateBike(bike.id, payload);

      // Safe non-blocking alerts
      try {
        if (Number(price) !== bike.price) {
          await alertBikeAction(modelName, `price changed from GHS ${bike.price} to GHS ${price}`);
          await dbService.logActivity('price_changed', modelName, `Price adjusted to GHS ${price}.`);
        }
        if (determinedStatus === 'sold_out' && bike.stock_status !== 'sold_out') {
          await alertBikeAction(modelName, 'sold_out');
          await dbService.logActivity('sold', modelName, `Bike marked sold out.`);
        }
        if (Number(stockQty) <= 2 && Number(stockQty) !== bike.stock_qty) {
          await alertLowStock(modelName, Number(stockQty));
          await dbService.logActivity('stock_low', modelName, `Stock reduced to ${stockQty}.`);
        }
      } catch (e) {}

      onSaved(updated || ({ ...bike, ...payload } as Bike));
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update bike specifications');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#121212] border border-[#2B2B2B] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242424] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric/10 border border-electric/40 flex items-center justify-center text-electric">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Edit {bike.model_name}
                <span className="text-[10px] text-electric font-mono bg-electric/10 px-2 py-0.5 rounded border border-electric/30">
                  {bike.category.toUpperCase()}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                All technical specifications, pricing, battery, video, and road ratings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/bikes/${bike.id}`}
              target="_blank"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-[#202020] px-2.5 py-1.5 rounded-lg border border-[#333] transition-colors"
              title="Open in dedicated full page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Page</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#242424] bg-[#141414] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'specs'
                ? 'border-electric text-electric bg-electric/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Specifications & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'media'
                ? 'border-electric text-electric bg-electric/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Photos & Video Showcase
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terrain')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'terrain'
                ? 'border-electric text-electric bg-electric/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Ghana Road & Weather Ratings
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: SPECS & PRICING */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Model & Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                      Model Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                      URL Slug:
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-electric font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                      Category:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BikeCategory)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="offroad">Off-Road & Mountain</option>
                      <option value="city">Urban City Commuter</option>
                      <option value="cargo">Heavy Cargo & Dispatch</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                      Standard Price (GHS):
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                      Promo Price (GHS - Optional):
                    </label>
                    <input
                      type="number"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value)}
                      placeholder="Leave blank if no promo"
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                    Short Tagline / Catchphrase:
                  </label>
                  <input
                    type="text"
                    required
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                    Full Technical Description:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Technical Specifications Matrix
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-electric" /> Battery Chemistry & Capacity:
                    </label>
                    <input
                      type="text"
                      required
                      value={batteryType}
                      onChange={(e) => setBatteryType(e.target.value)}
                      placeholder="e.g. 48V 15Ah LG Removable Lithium-Ion"
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-electric" /> Motor Power (Watts):
                    </label>
                    <input
                      type="number"
                      required
                      value={motorWatts}
                      onChange={(e) => setMotorWatts(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Range (km):</label>
                    <input
                      type="number"
                      required
                      value={rangeKm}
                      onChange={(e) => setRangeKm(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Max Speed (km/h):</label>
                    <input
                      type="number"
                      required
                      value={maxSpeedKmh}
                      onChange={(e) => setMaxSpeedKmh(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Charge Time (hrs):</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={chargeTimeHrs}
                      onChange={(e) => setChargeTimeHrs(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Weight (kg):</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Warranty (Months):</label>
                    <input
                      type="number"
                      required
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Visibility */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Inventory & Homepage Feature
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Stock Quantity:</label>
                    <input
                      type="number"
                      required
                      value={stockQty}
                      onChange={(e) => setStockQty(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Stock Status:</label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="in_stock">In Stock (Green)</option>
                      <option value="low">Low Stock (Yellow Alert)</option>
                      <option value="sold_out">Sold Out (Red Disabled)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="accent-electric w-4 h-4 rounded"
                      />
                      <span>Featured Flagship Model</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & VIDEO */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Road Test Video */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" /> Road Test Video Showcase
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Video URL (YouTube Embed / MP4):
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Video Duration:</label>
                    <input
                      type="text"
                      placeholder="e.g. 3:45 min"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">Video Display Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Accra City Commute & Pothole Absorption Road Test"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" /> Product Photo Gallery
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto bg-[#222] hover:bg-[#2C2C2C] border border-dashed border-[#444] hover:border-electric text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-electric" />
                    <span>{uploadingImage ? 'Uploading Photos...' : 'Upload Photos (Device)'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2 w-full">
                    <input
                      type="url"
                      placeholder="Or paste external image URL..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-[#282828] hover:bg-[#333] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#2E2E2E] aspect-video bg-black">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-black/80 text-electric text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GHANA TERRAIN & WEATHER */}
          {activeTab === 'terrain' && (
            <div className="space-y-6">
              <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-4">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Ghana Road & Weather Condition Ratings
                </h3>
                <p className="text-xs text-gray-400">
                  These metrics display directly on the customer inspection checklist to build buyer trust on rough roads.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Pothole Resistance (1 to 10):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={potholeScore}
                      onChange={(e) => setPotholeScore(Number(e.target.value))}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">10 = Heavy hydraulic suspension</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Hill Climbing Ability:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Up to 25° Incline (Aburi Hills Tested)"
                      value={hillClimb}
                      onChange={(e) => setHillClimb(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Water & Rain Protection:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IP65 Weatherproof / Heavy Rain"
                      value={waterRating}
                      onChange={(e) => setWaterRating(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#2E2E2E] focus:border-electric rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#242424]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-gray-400 hover:text-white bg-[#1C1C1C] hover:bg-[#252525] rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-electric hover:bg-electric-dark text-black font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save All Specifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
