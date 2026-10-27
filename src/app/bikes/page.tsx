'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/supabaseClient';
import { Bike } from '@/lib/types';
import BikeCard from '@/components/BikeCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Zap, RefreshCw } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export default function ShopPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(22000);
  const [minRange, setMinRange] = useState<number>(40);
  const [minSpeed, setMinSpeed] = useState<number>(30);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadBikes() {
      try {
        const data = await dbService.getBikes();
        setBikes(data);
      } catch (err) {
        console.error('Failed to load bikes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBikes();
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStock('all');
    setMaxPrice(22000);
    setMinRange(40);
    setMinSpeed(30);
    setSortBy('featured');
  };

  // Filter logic
  const filteredBikes = bikes
    .filter((bike) => {
      // Search query filter (Multi-term fuzzy search matching all fields)
      if (searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();
        const cleanTerms = rawQ
          .replace(/[-_/]/g, ' ')
          .split(/\s+/)
          .filter(Boolean);

        const categoryAliases =
          bike.category === 'offroad'
            ? 'offroad off-road off road mountain trail savanna'
            : bike.category === 'city'
            ? 'city commuter urban street student'
            : bike.category === 'cargo'
            ? 'cargo hauler heavy dispatch utility work market'
            : '';

        const searchableDoc = [
          bike.model_name,
          bike.short_desc,
          bike.full_desc || '',
          bike.category,
          categoryAliases,
          bike.slug,
          bike.battery_type,
          `${bike.motor_watts}w ${bike.motor_watts} watts`,
          `${bike.range_km}km ${bike.range_km} kilometers`,
          `${bike.max_speed_kmh}kmh ${bike.max_speed_kmh} km/h`,
          bike.stock_status,
        ]
          .join(' ')
          .toLowerCase()
          .replace(/[-_/]/g, ' ');

        const matchesAllTerms = cleanTerms.every((term) => searchableDoc.includes(term));
        if (!matchesAllTerms) return false;
      }

      // Category
      if (selectedCategory !== 'all' && bike.category !== selectedCategory) {
        return false;
      }

      // Stock
      if (selectedStock !== 'all') {
        if (selectedStock === 'in_stock' && bike.stock_status !== 'in_stock') return false;
        if (selectedStock === 'low' && bike.stock_status !== 'low') return false;
        if (selectedStock === 'sold_out' && bike.stock_status !== 'sold_out') return false;
      }

      // Sliders
      const effectivePrice = bike.promo_price || bike.price;
      if (effectivePrice > maxPrice) return false;
      if (bike.range_km < minRange) return false;
      if (bike.max_speed_kmh < minSpeed) return false;

      return true;
    })
    .sort((a, b) => {
      const priceA = a.promo_price || a.price;
      const priceB = b.promo_price || b.price;

      switch (sortBy) {
        case 'price_low':
          return priceA - priceB;
        case 'price_high':
          return priceB - priceA;
        case 'range':
          return b.range_km - a.range_km;
        case 'speed':
          return b.max_speed_kmh - a.max_speed_kmh;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs uppercase tracking-widest font-black">
              <Zap className="w-4 h-4" />
              Direct from M.Sniff Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              AIMIT Electric Bicycles Fleet
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Heavy-duty e-bikes calibrated for Ghana roads with nationwide delivery from Amasaman, Tamale, Bolga, and Bawku.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold shadow-sm">
              Showing <strong className="text-emerald-700">{filteredBikes.length}</strong> of {bikes.length} Bikes
            </span>
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model (e.g. Sahara, Volt, Cargo, Offroad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <ArrowUpDown className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-8 py-3 text-sm text-slate-900 focus:outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="featured">Sort by: Featured & Popular</option>
              <option value="price_low">Sort by: Price (Low to High)</option>
              <option value="price_high">Sort by: Price (High to Low)</option>
              <option value="range">Sort by: Battery Range (Longest)</option>
              <option value="speed">Sort by: Max Speed (Fastest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shop Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm ${
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Filter Fleet
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Category
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'offroad', label: 'Off-Road & Mountain' },
                { id: 'city', label: 'City & Commuter' },
                { id: 'cargo', label: 'Heavy Cargo & Dispatch' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Stock Availability
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Statuses' },
                { id: 'in_stock', label: 'In Stock Only' },
                { id: 'low', label: 'Low Stock Alerts' },
                { id: 'sold_out', label: 'Sold Out / Pre-Order' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStock(st.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedStock === st.id
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-xs font-black text-emerald-700">
                {formatGHS(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="8000"
              max="22000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>GHS 8,000</span>
              <span>GHS 22,000</span>
            </div>
          </div>

          {/* Battery Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Min Battery Range
              </label>
              <span className="text-xs font-black text-emerald-700">
                {minRange} km+
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              step="5"
              value={minRange}
              onChange={(e) => setMinRange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>40 km</span>
              <span>120 km</span>
            </div>
          </div>

          {/* Max Speed */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Min Top Speed
              </label>
              <span className="text-xs font-black text-emerald-700">
                {minSpeed} km/h+
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="55"
              step="2"
              value={minSpeed}
              onChange={(e) => setMinSpeed(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>30 km/h</span>
              <span>55 km/h</span>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-9">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Loading AIMIT fleet inventory...</p>
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-emerald-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {searchQuery ? `No AIMIT Bikes Matched "${searchQuery}"` : 'No AIMIT Bikes Matched Your Filters'}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? 'Try searching for model names like Sahara, Volt, Cargo, or specs like 750W or Offroad.'
                  : 'Try widening your price range or resetting filter criteria to view all available bikes.'}
              </p>
              <button
                onClick={resetFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
