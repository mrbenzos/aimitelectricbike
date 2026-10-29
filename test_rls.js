// Test delete with anon key vs service role key
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split(/\r?\n/);
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

console.log('URL:', supabaseUrl);
console.log('Has anon key:', !!anonKey);
console.log('Has service key:', !!serviceKey);

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

async function testRLS() {
  // Create a bike with service role
  const testId = 'rls-test-' + Date.now();
  await supabaseService.from('bikes').insert([{
    id: testId,
    slug: 'rls-test-' + Date.now(),
    model_name: 'RLS Test Bike',
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
  }]);
  console.log('\nCreated test bike:', testId);

  // Try delete with anon key
  const { data: anonDelData, error: anonDelErr } = await supabaseAnon.from('bikes').delete().eq('id', testId).select();
  console.log('\n--- Anon Key DELETE ---');
  console.log('error:', anonDelErr?.message || null);
  console.log('rows deleted:', anonDelData?.length ?? 0);

  // Check if still exists
  const { data: checkAnon } = await supabaseService.from('bikes').select('id').eq('id', testId).maybeSingle();
  console.log('Still in DB after anon delete:', !!checkAnon);

  if (checkAnon) {
    // Try with service role
    const { data: svcDelData, error: svcDelErr } = await supabaseService.from('bikes').delete().eq('id', testId).select();
    console.log('\n--- Service Role DELETE ---');
    console.log('error:', svcDelErr?.message || null);
    console.log('rows deleted:', svcDelData?.length ?? 0);

    const { data: checkSvc } = await supabaseService.from('bikes').select('id').eq('id', testId).maybeSingle();
    console.log('Still in DB after service delete:', !!checkSvc);
  }
}

testRLS();
