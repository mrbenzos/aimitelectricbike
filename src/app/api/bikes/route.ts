import { NextResponse } from 'next/server';
import { readBikesFromFile, writeBikesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { Bike } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('bikes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          try {
            writeBikesToFile(data as Bike[]);
          } catch (e) {}
          return NextResponse.json(data as Bike[]);
        }
      } catch (sbErr) {
        console.warn('Supabase fetch error, fallback to disk store:', sbErr);
      }
    }

    const fileBikes = readBikesFromFile();
    return NextResponse.json(fileBikes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bikes' }, { status: 500 });
  }
}

// UUID v4 regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const generatedSlug = slugify(body.slug || body.model_name || 'aimit-bike');

    // Strip any pre-set id — let Supabase auto-generate a proper UUID
    const { id: _ignoredId, ...bikePayload } = body;
    const insertPayload = {
      ...bikePayload,
      slug: generatedSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;

    // 1. Primary: Save to Supabase Cloud Database
    if (isSupabaseConfigured && client) {
      // Check if slug already exists to prevent duplicate key constraint error
      const { data: existing } = await client
        .from('bikes')
        .select('id')
        .eq('slug', insertPayload.slug)
        .maybeSingle();

      if (existing) {
        insertPayload.slug = `${insertPayload.slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const { data, error } = await client.from('bikes').insert([insertPayload]).select().single();
      if (!error && data) {
        return NextResponse.json(data as Bike, { status: 201 });
      }

      if (error) {
        // Retry once with a unique slug suffix in case of conflict
        insertPayload.slug = `${generatedSlug}-${Date.now().toString().slice(-5)}`;
        const retry = await client.from('bikes').insert([insertPayload]).select().single();
        if (!retry.error && retry.data) {
          return NextResponse.json(retry.data as Bike, { status: 201 });
        }
        console.error('Supabase bike insert failed:', error);
        return NextResponse.json({ error: error.message || 'Failed to save bike to database' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  } catch (err: any) {
    console.error('Bike creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create bike' }, { status: 400 });
  }
}
