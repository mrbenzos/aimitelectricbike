'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { dbService } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { alertLowStock, alertBikeAction } from '@/lib/hubtel';
import { Bike, BikeCategory, StockStatus } from '@/lib/types';
import {
  ArrowLeft,
  Upload,
  Trash2,
  CheckCircle2,
  Zap,
  Battery,
  Gauge,
  Video,
  Shield,
  Activity,
  Award,
} from 'lucide-react';

export default function EditBikePage() {
  const router = useRouter();
  const params = useParams();
  const bikeId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Original bike for change detection
  const [originalBike, setOriginalBike] = useState<Bike | null>(null);

  // Form Fields - Basic Info
  const [modelName, setModelName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BikeCategory>('offroad');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [price, setPrice] = useState<number>(12000);
  const [promoPrice, setPromoPrice] = useState<string>('');

  // Form Fields - Technical Specifications
  const [batteryType, setBatteryType] = useState('48V 15Ah LG Removable Lithium-Ion');
  const [rangeKm, setRangeKm] = useState<number>(85);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(45);
  const [chargeTimeHrs, setChargeTimeHrs] = useState<number>(5.0);
  const [motorWatts, setMotorWatts] = useState<number>(750);
  const [weightKg, setWeightKg] = useState<number>(26.0);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);

  // Form Fields - Inventory & Visibility
  const [stockQty, setStockQty] = useState<number>(5);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [featured, setFeatured] = useState<boolean>(false);

  // Form Fields - Video & Media
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('');

  // Form Fields - Ghana Road & Terrain Ratings
  const [potholeScore, setPotholeScore] = useState<number>(9);
  const [hillClimb, setHillClimb] = useState<string>('Up to 25° Incline');
  const [waterRating, setWaterRating] = useState<string>('IP65 Weatherproof / Heavy Rain');

  // Form Fields - Gallery Images
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    async function loadBike() {
      if (!bikeId) return;
      try {
        const bikes = await dbService.getBikes();
        const found = bikes.find((b) => b.id === bikeId || b.slug === bikeId);
        if (found) {
          setOriginalBike(found);
          setModelName(found.model_name || '');
          setSlug(found.slug || '');
          setCategory(found.category || 'offroad');
          setShortDesc(found.short_desc || '');
          setFullDesc(found.full_desc || '');
          setPrice(found.price || 0);
          setPromoPrice(found.promo_price ? String(found.promo_price) : '');
          setBatteryType(found.battery_type || '48V 15Ah LG Removable Lithium-Ion');
          setRangeKm(found.range_km ?? 85);
          setMaxSpeedKmh(found.max_speed_kmh ?? 45);
          setChargeTimeHrs(found.charge_time_hrs ?? 5.0);
          setMotorWatts(found.motor_watts ?? 750);
          setWeightKg(found.weight_kg ?? 26.0);
          setWarrantyMonths(found.warranty_months ?? 12);
          setStockQty(found.stock_qty ?? 5);
          setStockStatus(found.stock_status || 'in_stock');
          setFeatured(Boolean(found.featured));
          setVideoUrl(found.video_url || '');
          setVideoTitle(found.video_title || '');
          setVideoDuration(found.video_duration || '');
          if (found.terrain_rating) {
            setPotholeScore(found.terrain_rating.pothole_score ?? 9);
            setHillClimb(found.terrain_rating.hill_climb || 'Up to 25° Incline');
            setWaterRating(found.terrain_rating.water_rating || 'IP65 Weatherproof / Heavy Rain');
          }
          setImages(found.images || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBike();
  }, [bikeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalBike) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let determinedStatus: StockStatus = stockStatus;
      if (stockQty <= 0) {
        determinedStatus = 'sold_out';
      } else if (stockQty <= 2) {
        determinedStatus = 'low';
      }

      await dbService.updateBike(originalBike.id, {
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
      });

      // Safe non-blocking alerts
      try {
        if (Number(price) !== originalBike.price) {
          await alertBikeAction(modelName, `price changed from GHS ${originalBike.price} to GHS ${price}`);
          await dbService.logActivity(
            'price_changed',
            modelName,
            `Price adjusted to GHS ${price}.`
          );
        }

        if (determinedStatus === 'sold_out' && originalBike.stock_status !== 'sold_out') {
          await alertBikeAction(modelName, 'sold_out');
          await dbService.logActivity('sold', modelName, `Bike marked sold out.`);
        }

        if (Number(stockQty) <= 2 && Number(stockQty) !== originalBike.stock_qty) {
          await alertLowStock(modelName, Number(stockQty));
          await dbService.logActivity('stock_low', modelName, `Stock reduced to ${stockQty}.`);
        }
      } catch (alertErr) {
        console.warn('Non-blocking inventory alert skipped:', alertErr);
      }

      router.push('/admin/bikes');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update bike');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs">Loading bike specifications...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/bikes"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Fleet List
          </Link>
          <span className="text-xs text-electric font-mono">Editing ID: {bikeId}</span>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-black text-white mb-2">Edit {modelName}</h1>
          <p className="text-xs text-gray-400 mb-6">
            Update technical specifications, pricing, media, Ghana road ratings, and stock status. Changes update both storefront and inventory immediately.
          </p>

          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. General & Pricing */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> General Information & Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Model Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Slug / URL Key:
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-electric font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BikeCategory)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="offroad">Off-Road & Mountain</option>
                    <option value="city">Urban City Commuter</option>
                    <option value="cargo">Heavy Cargo & Dispatch</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Standard Price (GHS):
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Promo Price (GHS - Optional):
                  </label>
                  <input
                    type="number"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    placeholder="Leave blank if no promo"
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Short Tagline / Summary:
                </label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Full Technical Description:
                </label>
                <textarea
                  rows={4}
                  required
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Technical Specifications Matrix */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" /> Technical Specifications Matrix
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-electric" /> Battery Chemistry & Capacity:
                  </label>
                  <input
                    type="text"
                    required
                    value={batteryType}
                    onChange={(e) => setBatteryType(e.target.value)}
                    placeholder="e.g. 48V 15Ah LG Removable Lithium-Ion"
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-electric" /> Motor Power (Watts):
                  </label>
                  <input
                    type="number"
                    required
                    value={motorWatts}
                    onChange={(e) => setMotorWatts(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Range (km):</label>
                  <input
                    type="number"
                    required
                    value={rangeKm}
                    onChange={(e) => setRangeKm(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Max Speed (km/h):</label>
                  <input
                    type="number"
                    required
                    value={maxSpeedKmh}
                    onChange={(e) => setMaxSpeedKmh(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Charge Time (hrs):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={chargeTimeHrs}
                    onChange={(e) => setChargeTimeHrs(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Weight (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Warranty (Months):</label>
                  <input
                    type="number"
                    required
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Inventory & Visibility */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" /> Stock & Storefront Visibility
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Stock Status:</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
                    <span>Featured Flagship on Homepage</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Road Test Video Showcase */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4" /> Road Test Video Showcase
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">
                    Video URL (YouTube Embed / MP4 / Cloud):
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Video Duration:</label>
                  <input
                    type="text"
                    placeholder="e.g. 3:45 min"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Video Display Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Accra City Commute & Pothole Absorption Road Test"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* 5. Ghana Road & Terrain Ratings */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" /> Ghana Road & Weather Condition Ratings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">
                    Pothole Resistance (1 to 10):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={potholeScore}
                    onChange={(e) => setPotholeScore(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Hill Climbing Ability:</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 25° Incline (Aburi Hills Tested)"
                    value={hillClimb}
                    onChange={(e) => setHillClimb(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Water & Rain Protection:</label>
                  <input
                    type="text"
                    placeholder="e.g. IP65 Weatherproof / Heavy Rain"
                    value={waterRating}
                    onChange={(e) => setWaterRating(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 6. Multi-Angle Gallery Images & Cloud Upload */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4" /> Product Photo Gallery
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto bg-[#1C1C1C] hover:bg-[#252525] border border-dashed border-[#444] hover:border-electric text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-electric" />
                  <span>{uploadingImage ? 'Uploading Photos...' : 'Upload Photos (Device / Storage)'}</span>
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
                    className="flex-1 bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#222] hover:bg-[#333] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#262626] aspect-video bg-black">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-electric text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Cover Photo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-4 rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving Specifications...' : 'Save All Specifications & Update Bike'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
