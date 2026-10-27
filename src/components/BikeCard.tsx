'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Gauge, Battery, Shield, ShoppingBag, ArrowRight, Play, Eye } from 'lucide-react';
import { Bike } from '@/lib/types';
import { formatGHS, calculateInstallment } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import BikeInspectionModal from '@/components/BikeInspectionModal';

interface BikeCardProps {
  bike: Bike;
}

export default function BikeCard({ bike }: BikeCardProps) {
  const { addItem } = useCart();
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const effectivePrice = bike.promo_price || bike.price;
  const installment = calculateInstallment(effectivePrice, 40);

  const getStockBadge = () => {
    if (bike.stock_status === 'sold_out' || bike.stock_qty <= 0) {
      return (
        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          Sold Out
        </span>
      );
    }
    if (bike.stock_status === 'low' || bike.stock_qty <= 2) {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
          Low Stock ({bike.stock_qty} left)
        </span>
      );
    }
    return (
      <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
        In Stock ({bike.stock_qty})
      </span>
    );
  };

  const getCategoryBadge = () => {
    switch (bike.category) {
      case 'offroad':
        return 'Rugged Off-Road';
      case 'cargo':
        return 'Heavy Cargo';
      default:
        return 'Urban Commuter';
    }
  };

  const defaultBikeImage = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop';
  const rawImage = bike.images && bike.images.length > 0 ? bike.images[0] : '';
  const initialImage = rawImage && !rawImage.startsWith('blob:') ? rawImage : defaultBikeImage;
  const [displayImage, setDisplayImage] = useState(initialImage);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-lg">
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Link href={`/bikes/${bike.slug}`}>
          <img
            src={displayImage}
            alt={bike.model_name}
            onError={() => setDisplayImage(defaultBikeImage)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges Over Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider shadow-sm">
            {getCategoryBadge()}
          </span>
          {bike.promo_price && (
            <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              Save {formatGHS(bike.price - bike.promo_price)}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {getStockBadge()}
        </div>

        {/* Quick Inspection Button (Video + Photos) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsInspectOpen(true);
          }}
          className="absolute bottom-2 left-2 bg-white/90 hover:bg-emerald-600 text-slate-800 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all shadow-md group/btn cursor-pointer"
        >
          <Play className="w-3 h-3 text-emerald-600 group-hover/btn:text-white fill-current" />
          <span>Inspect Video & Photos</span>
        </button>

        {/* 12M Warranty badge bottom right */}
        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm text-[10px] text-slate-700 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 shadow-sm">
          <Shield className="w-3 h-3 text-emerald-600" />
          {bike.warranty_months}M Warranty
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <Link href={`/bikes/${bike.slug}`}>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
              {bike.model_name}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {bike.short_desc}
          </p>

          {/* Key Specs Matrix */}
          <div className="grid grid-cols-3 gap-2 my-4 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <div className="flex items-center justify-center text-emerald-600 mb-0.5">
                <Battery className="w-3.5 h-3.5 mr-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Range</span>
              </div>
              <p className="text-xs font-black text-slate-900">{bike.range_km} km</p>
            </div>
            <div className="border-x border-slate-200">
              <div className="flex items-center justify-center text-emerald-600 mb-0.5">
                <Gauge className="w-3.5 h-3.5 mr-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Speed</span>
              </div>
              <p className="text-xs font-black text-slate-900">{bike.max_speed_kmh} km/h</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-emerald-600 mb-0.5">
                <Zap className="w-3.5 h-3.5 mr-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Motor</span>
              </div>
              <p className="text-xs font-black text-slate-900">{bike.motor_watts}W</p>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <span className="text-xl font-black text-emerald-600">
                {formatGHS(effectivePrice)}
              </span>
              {bike.promo_price && (
                <span className="text-xs text-slate-400 line-through ml-2">
                  {formatGHS(bike.price)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">Incl. VAT</span>
          </div>

          <p className="text-[11px] text-slate-500 mb-4 flex items-center justify-between">
            <span>40% Down: <strong className="text-slate-700">{formatGHS(installment.downPayment)}</strong></span>
            <span>Est: {formatGHS(installment.monthlyOver3Months)}/mo (x3)</span>
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsInspectOpen(true)}
              className="w-full inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-emerald-500 text-xs font-bold py-2 px-3 rounded-xl transition-all gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspect Bike Details (Video + Specs)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/bikes/${bike.slug}`}
                className="w-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-all shadow-sm"
              >
                Specs & Zoom <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>

              {bike.stock_status === 'sold_out' || bike.stock_qty <= 0 ? (
                <button
                  type="button"
                  onClick={() => setIsInspectOpen(true)}
                  className="w-full inline-flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-bold py-2.5 px-2 rounded-xl text-center cursor-not-allowed"
                >
                  Pre-Order
                </button>
              ) : (
                <button
                  onClick={() => addItem(bike, 1)}
                  className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all uppercase tracking-wider"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1 text-white" />
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bike Inspection Modal */}
      <BikeInspectionModal
        bike={bike}
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
      />
    </div>
  );
}
