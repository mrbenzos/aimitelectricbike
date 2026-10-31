import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = supabaseAdmin || supabase;
  let deleteTest: any = null;

  if (client) {
    // Insert a throwaway test bike and immediately delete it to verify delete works
    const testId = 'diag-' + Date.now();
    await client.from('bikes').insert([{
      id: testId,
      slug: testId,
      model_name: 'DIAG_TEST',
      category: 'city',
      short_desc: 'diag',
      full_desc: 'diag',
      price: 1,
      battery_type: '48V',
      range_km: 1,
      max_speed_kmh: 1,
      charge_time_hrs: 1,
      motor_watts: 1,
      weight_kg: 1,
      warranty_months: 1,
      stock_qty: 1,
      stock_status: 'in_stock',
      featured: false,
      images: [],
    }]);

    const { data: delData, error: delErr } = await client.from('bikes').delete().eq('id', testId).select();
    deleteTest = {
      error: delErr?.message || null,
      rowsDeleted: delData?.length ?? 0,
    };
  }

  return NextResponse.json({
    isSupabaseConfigured,
    hasSupabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasClient: Boolean(client),
    hasAdminClient: Boolean(supabaseAdmin),
    deleteTest,
    status: isSupabaseConfigured && client ? 'SUPABASE_CONNECTED_AND_ACTIVE' : 'DISCONNECTED',
  });
}
