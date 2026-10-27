# M.SNIFF BUSINESS HUB — AIMIT ELECTRIC BICYCLES E-COMMERCE PLATFORM

> **Tagline:** "Save Fuel. Beat Traffic. Ride Electric."  
> **Brand:** AIMIT Electric Bicycles ONLY  
> **Authorized Distributor:** M.Sniff Business Hub  
> **Delivery Hubs:** Amasaman (National HQ), Tamale, Bolga, Bawku — Nationwide Ghana  
> **Colors:** Midnight Black (`#0A0A0A`), Electric Green (`#00FF88`), Pure White  

---

## 🚀 Overview

A full-stack e-commerce web platform engineered for Ghanaian road conditions, traffic realities, and transport fuel savings. Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase (PostgreSQL, Storage, RLS)**, and **Hubtel SMS API**.

---

## 🚲 Key Site Pages

1. **`/` — Homepage:**
   - High-contrast Hero with Ghana road visuals and dual CTAs: *View All E-Bikes* & *Book Free Test Ride*.
   - Value propositions: 85% fuel savings, 120km range, 12-month warranty, 4 Nationwide Hubs.
   - Featured Flagship Bikes with stock badges and instant WhatsApp inquiry.
   - Interactive **Fuel Saving Calculator** (Trotro vs Okada vs AIMIT e-bike monthly savings in GHS).
   - **Battery Range Comparison Table** across models.
   - **Ghana Delivery Map** showing the 4 strategic hubs (Amasaman HQ, Tamale, Bolga, Bawku).
   - Real Ghana rider reviews and floating interactive WhatsApp button.

2. **`/bikes` — Shop Page:**
   - Grid of all AIMIT models.
   - Filters: Price range (GHS 8k - 22k), Battery Range (40km - 120km), Top Speed, Category (Offroad, City, Cargo), Stock Availability (`in_stock`, `low`, `sold_out`).
   - Instant Search bar & sorting (Price low-to-high, Price high-to-low, Range, Speed, Featured).
   - Bike cards with 40% installment calculations, key specs, stock alerts, and direct Cart / WhatsApp actions.

3. **`/bikes/[slug]` — Single Product View (High-Conversion E-Commerce):**
   - **2.5x Magnifying Zoom Gallery** with thumbnail switcher (Side profile, Cockpit/Display, Battery pack, Suspension/Disc brakes) + Fullscreen Lightbox modal.
   - Ghana Cedi pricing with promo discounts and 40% initial deposit installment breakdown.
   - Comprehensive technical specs table.
   - **Delivery Hub Dropdown**: Select Amasaman (HQ, free), Tamale, Bolga, Bawku, or Other regions with instant fee calculation and transit times.
   - Action buttons: Add to Cart, Buy Now via WhatsApp (auto-generates formatted order message), Book Free Test Ride modal.
   - Tabbed sections: *Detailed Description*, *Technical Specs*, *Ghana Battery Care Tips*, *Rider Reviews*.
   - Related AIMIT models.

4. **`/cart` — Shopping Cart & Hub Checkout:**
   - Cart line items with quantity adjustments and stock limits.
   - Dynamic hub fee calculator based on chosen Ghana distribution hub.
   - **1-Click WhatsApp Checkout**: Generates pre-formatted order text ready to send to M.Sniff WhatsApp.
   - **On-Site Order Placement**: Writes order to Supabase `orders` table, triggers Hubtel SMS alerts to owner and customer, logs activity, and renders order receipt.

5. **`/compare` — Compare Models:**
   - Side-by-side comparison of 2-3 AIMIT bikes across 10+ technical specifications.

6. **`/why-electric` — Fuel Calculator & Ghana Economics:**
   - Daily distance slider (10km - 100km).
   - Interactive savings comparison against Trotro, Okada, and petrol motorbikes.
   - Demonstrates Ghana ECG electricity cost per 80km full charge (~GHS 1.80).

7. **`/contact` — Nationwide Hubs & Test Ride Booking:**
   - Physical addresses, phone numbers, and managers for the 4 delivery hubs.
   - Interactive visual map of Ghana hubs.
   - Test Ride Booking form (saves to `test_rides` and fires Hubtel SMS alert).

---

## 🛡️ Admin Portal (`/admin`)

- **Secure 2FA SMS Login (`/admin/login`):**
  - Step 1: Email + Password authentication (`admin@msniff.com` / `aimitpower2025`).
  - Step 2: 6-digit OTP generated, saved to `otp_codes`, and dispatched via Hubtel SMS:
    *"Your M.SNIFF admin code is {code}. Valid 5 mins. - MSNIFF"*
  - (Includes dev-mode auto-fill hint when testing locally without Hubtel keys).
- **Dashboard Overview (`/admin`):**
  - KPI Cards: Total Fleet, Low Stock Alert (≤ 2), Orders Today, Test Rides, Total Revenue in GHS.
  - Recent orders with quick status toggles (Pending ➔ Confirmed ➔ Delivered).
  - Recent test ride bookings.
- **Bikes Fleet CRUD (`/admin/bikes`):**
  - Add new bike (`/admin/bikes/new`) with multiple image upload to Supabase bucket `bike-images`.
  - Auto-generated URL slugs, stock quantity limits, promo pricing.
  - Edit bike (`/admin/bikes/[id]`).
  - Bulk Mark Sold Out & Delete actions.
- **Orders by Hub (`/admin/orders`):**
  - Filter orders by delivery hub (Amasaman, Tamale, Bolga, Bawku).
  - Search by customer phone or name.
  - Quick WhatsApp chat link for each customer.
- **Test Rides (`/admin/test-rides`):**
  - Manage bookings filtered by hub with direct customer contact.
- **Activity Logs (`/admin/activity`):**
  - Chronological audit ledger of all stock events, price adjustments, orders, and SMS alerts.

---

## 📲 Hubtel SMS Notification Engine

Configured in `src/lib/hubtel.ts`. Handles the 5 automated alert rules:

1. **Stock ≤ 2:** SMS to `OWNER_PHONE`:
   `"LOW STOCK: AIMIT {model} only {qty} left. Restock now. - MSNIFF"`
2. **Bike status / price change / deletion:** SMS to `OWNER_PHONE`:
   `"ALERT: AIMIT {model} marked {action} by Admin at {time}. - MSNIFF"`
3. **New Order Created:**
   - SMS to Owner: `"NEW ORDER: {model} x{qty} to {hub} - {phone} - GHS {total}. Check admin. - MSNIFF"`
   - SMS to Customer: `"M.Sniff: Thanks {name}, your order for {model} to {hub} received. We will call you. - MSNIFF"`
4. **New Test Ride:** SMS to `OWNER_PHONE`:
   `"NEW TEST RIDE: {name} ({phone}) at {hub} on {date} for {bike}. - MSNIFF"`
5. **Admin 2FA:** 6-digit OTP code to admin phone.

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase project SQL editor.
2. Run `supabase/schema.sql` to create:
   - `bikes`
   - `orders`
   - `test_rides`
   - `activity_logs`
   - `otp_codes`
   - Storage bucket `bike-images`
   - Row Level Security (RLS) policies.
3. Run `supabase/seed.sql` to populate the initial catalog of 5 realistic AIMIT electric bike models.
4. Copy your Supabase URL, Anon Key, and Service Role Key into `.env.local`.

---

## 💻 Quick Start (Development)

```bash
cd C:\Users\freem\.gemini\antigravity\scratch\msniff-ebikes
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Admin portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
