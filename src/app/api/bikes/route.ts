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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const generatedSlug = slugify(body.slug || body.model_name || 'aimit-bike');
    const newBike: Bike = {
      ...body,
      slug: generatedSlug,
      id: body.id || 'bike-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;

    // 1. Primary: Save to Supabase Cloud Database
    if (isSupabaseConfigured && client) {
      try {
        let insertBike = { ...newBike };

        // Check if slug already exists to prevent duplicate key constraint error
        const { data: existing } = await client
          .from('bikes')
          .select('id')
          .eq('slug', insertBike.slug)
          .maybeSingle();

        if (existing) {
          insertBike.slug = `${insertBike.slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        const { data, error } = await client.from('bikes').insert([insertBike]).select().single();
        if (!error && data) {
          try {
            const currentBikes = readBikesFromFile();
            writeBikesToFile([data as Bike, ...currentBikes.filter((b) => b.id !== data.id)]);
          } catch (e) {}
          return NextResponse.json(data as Bike, { status: 201 });
        } else if (error) {
          console.error('Supabase bike insert error, retrying with unique suffix:', error);
          insertBike.slug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
          const retry = await client.from('bikes').insert([insertBike]).select().single();
          if (!retry.error && retry.data) {
            return NextResponse.json(retry.data as Bike, { status: 201 });
          }
          throw new Error(error.message || 'Failed to save bike to database');
        }
      } catch (sbErr: any) {
        console.error('Supabase insert exception:', sbErr);
        throw sbErr;
      }
    }

    // 2. Secondary fallback: Local file store
    try {
      const currentBikes = readBikesFromFile();
      const updatedList = [newBike, ...currentBikes.filter((b) => b.id !== newBike.id)];
      writeBikesToFile(updatedList);
    } catch (e) {}

    return NextResponse.json(newBike, { status: 201 });
  } catch (err: any) {
    console.error('Bike creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create bike' }, { status: 400 });
  }
}
