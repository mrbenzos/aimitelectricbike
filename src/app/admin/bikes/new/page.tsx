'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { dbService, supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { alertLowStock } from '@/lib/hubtel';
import { BikeCategory, StockStatus } from '@/lib/types';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function NewBikePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [modelName, setModelName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BikeCategory>('offroad');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [price, setPrice] = useState<number>(12000);
  const [promoPrice, setPromoPrice] = useState<string>('');
  const [batteryType, setBatteryType] = useState('48V 15Ah LG Removable Lithium-Ion');
  const [rangeKm, setRangeKm] = useState<number>(85);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(45);
  const [chargeTimeHrs, setChargeTimeHrs] = useState<number>(5.0);
  const [motorWatts, setMotorWatts] = useState<number>(750);
  const [weightKg, setWeightKg] = useState<number>(26.0);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [stockQty, setStockQty] = useState<number>(5);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [featured, setFeatured] = useState<boolean>(false);

  // Images state (array of URLs or uploaded storage links)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-generate slug when modelName changes
  const handleModelNameChange = (val: string) => {
    setModelName(val);
    setSlug(slugify(val));
  };

  // Permanent Image file upload to /api/upload with Base64 fallback
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
      if (images.length === 0) {
        throw new Error('Please add at least 1 image for the bike.');
      }

      // Calculate stock status automatically based on quantity
      let determinedStatus: StockStatus = stockStatus;
      if (stockQty <= 0) {
        determinedStatus = 'sold_out';
      } else if (stockQty <= 2) {
        determinedStatus = 'low';
      }

      const newBike = await dbService.createBike({
        slug: slug || slugify(modelName),
        model_name: modelName,
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
        images,
      });

      // Safe non-blocking activity log
      try {
        await dbService.logActivity(
          'bike_created',
          modelName,
          `Added new model to inventory (GHS ${price}, Stock: ${stockQty})`
        );
      } catch (e) {}

      // Safe non-blocking SMS alert
      if (Number(stockQty) <= 2) {
        try {
          await alertLowStock(modelName, Number(stockQty));
        } catch (e) {}
      }

      router.push('/admin/bikes');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create bike');
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-xs text-electric font-bold uppercase tracking-wider">
            Supabase Storage & Catalog Sync
          </span>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-black text-white mb-2">Add New AIMIT Electric Bicycle</h1>
          <p className="text-xs text-gray-400 mb-6">
            Enter detailed specifications, upload multi-angle photos to Supabase Storage, and set inventory thresholds.
          </p>

          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Model Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIMIT Sahara Pro 750"
                  value={modelName}
                  onChange={(e) => handleModelNameChange(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Auto-Generated URL Slug:
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

            {/* Category, Price, Promo Price */}
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
                  Price (GHS):
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Promo Price (GHS, optional):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 11200"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Short Description (for cards):
              </label>
              <input
                type="text"
                required
                placeholder="One sentence summary of the bike..."
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
                placeholder="Detailed description of components, frame, weather resistance, and capabilities for Ghana roads..."
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Specifications Matrix */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#242424] space-y-4">
              <h3 className="text-xs font-bold text-electric uppercase tracking-wider">
                Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Battery Type:</label>
                  <input
                    type="text"
                    required
                    value={batteryType}
                    onChange={(e) => setBatteryType(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Range Per Charge (km):</label>
                  <input
                    type="number"
                    required
                    value={rangeKm}
                    onChange={(e) => setRangeKm(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Max Speed (km/h):</label>
                  <input
                    type="number"
                    required
                    value={maxSpeedKmh}
                    onChange={(e) => setMaxSpeedKmh(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Motor Power (Watts):</label>
                  <input
                    type="number"
                    required
                    value={motorWatts}
                    onChange={(e) => setMotorWatts(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Charge Time (Hours):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={chargeTimeHrs}
                    onChange={(e) => setChargeTimeHrs(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Net Weight (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Warranty (Months):</label>
                  <input
                    type="number"
                    required
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-electric rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-electric w-4 h-4 rounded"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images Management & Supabase Upload */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#242424] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-electric uppercase tracking-wider">
                  Product Images (Multi-Angle)
                </h3>
                <span className="text-[11px] text-gray-400">
                  Supabase Bucket: <code className="text-electric">bike-images</code>
                </span>
              </div>

              {/* Upload file input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="cursor-pointer bg-[#222] hover:bg-[#2C2C2C] text-gray-200 border border-[#333] hover:border-electric px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-electric" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Photos (Local / Device)'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#282828] hover:bg-[#333] text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Thumbnails of current images */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#333] group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-4 rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving Bike to Supabase...' : 'Save & Publish AIMIT E-Bike'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
