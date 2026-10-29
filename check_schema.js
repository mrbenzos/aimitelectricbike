// Check actual bikes table schema in Supabase
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

async function checkSchema() {
  // Try to get column info
  const { data, error } = await supabase.rpc('get_column_type', { table_name: 'bikes', column_name: 'id' }).maybeSingle();
  console.log('RPC result:', data, error);

  // Simpler: check if we can insert with a specific non-UUID id
  const testId = 'test-string-id-check';
  const { data: insertData, error: insertError } = await supabase.from('bikes').insert([{
    id: testId,
    slug: 'schema-check-test-' + Date.now(),
    model_name: 'Schema Check Test',
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
  
  if (insertError) {
    console.log('Cannot insert string id:', insertError.message);
  } else {
    console.log('Inserted with string id:', insertData.id);
    // cleanup
    await supabase.from('bikes').delete().eq('id', testId);
    console.log('Cleaned up test record');
  }

  // Get the existing bikes raw to see their actual ids
  const { data: bikes } = await supabase.from('bikes').select('id, slug, model_name');
  console.log('\nExisting bikes in Supabase:');
  bikes?.forEach(b => console.log(`  id: "${b.id}" | model: "${b.model_name}" | slug: "${b.slug}"`));
}

checkSchema();
