// Test actual delete behavior on Supabase
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

async function testDelete() {
  // First insert a test bike we can safely delete
  const testId = 'test-delete-' + Date.now();
  const { data: created, error: createErr } = await supabase.from('bikes').insert([{
    id: testId,
    slug: 'test-delete-slug-' + Date.now(),
    model_name: 'Delete Test Bike',
    category: 'city',
    short_desc: 'test',
    full_desc: 'test',
    price: 100,
    battery_type: '48V',
    range_km: 10,
    max_speed_kmh: 10,
    charge_time_hrs: 1,
    motor_watts: 100,
    weight_kg: 10,
    warranty_months: 1,
    stock_qty: 1,
    stock_status: 'in_stock',
    featured: false,
    images: [],
  }]).select().single();

  if (createErr) { console.error('Cannot create test bike:', createErr.message); return; }
  console.log('Created test bike:', testId);

  // Now try to delete with .or() using the string id
  const { data: deleted1, error: delErr1 } = await supabase
    .from('bikes')
    .delete()
    .or(`id.eq.${testId},slug.eq.${testId}`)
    .select();

  console.log('\n--- DELETE with .or() ---');
  console.log('error:', delErr1);
  console.log('deleted rows:', deleted1?.length ?? 0);

  // Check if still exists
  const { data: check } = await supabase.from('bikes').select('id').eq('id', testId).maybeSingle();
  console.log('Still in DB after or-delete:', !!check);

  if (check) {
    // Try simple .eq() delete
    const { error: delErr2 } = await supabase.from('bikes').delete().eq('id', testId);
    console.log('\n--- DELETE with .eq() ---');
    console.log('error:', delErr2);
    const { data: check2 } = await supabase.from('bikes').select('id').eq('id', testId).maybeSingle();
    console.log('Still in DB after eq-delete:', !!check2);
  }
}

testDelete();
