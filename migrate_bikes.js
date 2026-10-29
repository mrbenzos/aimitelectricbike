// Migration script: move legacy non-UUID bikes from file store into Supabase
// Run: node migrate_bikes.js

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split(/\r?\n/);
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);

// These are the legacy non-UUID bikes from the file store that need to be migrated
const legacyBikes = [
  {
    slug: 'jeff',
    model_name: 'jeff',
    category: 'city',
    short_desc: 'AIMIT Electric Bike',
    full_desc: 'AIMIT Electric Bike - jeff model',
    price: 12000,
    battery_type: '48V 15Ah LG Removable Lithium-Ion',
    range_km: 80,
    max_speed_kmh: 45,
    charge_time_hrs: 5.0,
    motor_watts: 750,
    weight_kg: 26.0,
    warranty_months: 12,
    stock_qty: 5,
    stock_status: 'in_stock',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    slug: 'cuchi',
    model_name: 'Cuchi',
    category: 'city',
    short_desc: 'AIMIT Electric Bike',
    full_desc: 'AIMIT Electric Bike - Cuchi model',
    price: 12000,
    battery_type: '48V 15Ah LG Removable Lithium-Ion',
    range_km: 80,
    max_speed_kmh: 45,
    charge_time_hrs: 5.0,
    motor_watts: 750,
    weight_kg: 26.0,
    warranty_months: 12,
    stock_qty: 5,
    stock_status: 'in_stock',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    slug: 'aimit-bmx',
    model_name: 'AIMIT BMX',
    category: 'offroad',
    short_desc: 'AIMIT BMX Electric Bike',
    full_desc: 'AIMIT Electric BMX - Off-road performance e-bike',
    price: 14500,
    battery_type: '48V 15Ah LG Removable Lithium-Ion',
    range_km: 70,
    max_speed_kmh: 50,
    charge_time_hrs: 5.0,
    motor_watts: 750,
    weight_kg: 28.0,
    warranty_months: 12,
    stock_qty: 5,
    stock_status: 'in_stock',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    slug: 'electric-bmx',
    model_name: 'electric BMX',
    category: 'offroad',
    short_desc: 'AIMIT Electric BMX',
    full_desc: 'AIMIT Electric BMX - Off-road performance e-bike',
    price: 14500,
    battery_type: '48V 15Ah LG Removable Lithium-Ion',
    range_km: 70,
    max_speed_kmh: 50,
    charge_time_hrs: 5.0,
    motor_watts: 750,
    weight_kg: 28.0,
    warranty_months: 12,
    stock_qty: 5,
    stock_status: 'in_stock',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
    ],
  },
];

async function migrate() {
  console.log('Starting migration of legacy bikes to Supabase...\n');

  for (const bike of legacyBikes) {
    // Check if slug already exists in Supabase
    const { data: existing } = await supabase.from('bikes').select('id, slug').eq('slug', bike.slug).maybeSingle();
    
    if (existing) {
      console.log(`SKIP: "${bike.model_name}" (slug: ${bike.slug}) already exists in Supabase as id=${existing.id}`);
      continue;
    }

    const { data, error } = await supabase.from('bikes').insert([bike]).select().single();
    if (error) {
      console.error(`ERROR: Failed to migrate "${bike.model_name}":`, error.message);
    } else {
      console.log(`OK: Migrated "${bike.model_name}" -> Supabase id=${data.id}`);
    }
  }

  console.log('\nMigration complete. Verifying Supabase state...');
  const { data: allBikes } = await supabase.from('bikes').select('id, slug, model_name').order('created_at', { ascending: false });
  console.log(`\nTotal bikes in Supabase: ${allBikes?.length || 0}`);
  allBikes?.forEach(b => console.log(`  - ${b.model_name} (id: ${b.id}, slug: ${b.slug})`));
}

migrate();
