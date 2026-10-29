import { NextResponse } from 'next/server';
import { readBikesFromFile, writeBikesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { Bike } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const rawSlug = String(params.id || '').trim();
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
    const slugifiedQuery = slugify(cleanSlug);

    const client = supabaseAdmin || supabase;
    let found: Bike | null = null;

    // 1. Check Supabase first
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('bikes')
          .select('*')
          .or(`slug.eq.${rawSlug},slug.eq.${cleanSlug},slug.eq.${slugifiedQuery},id.eq.${rawSlug}`)
          .maybeSingle();

        if (!error && data) {
          found = data as Bike;
        }
      } catch (sbErr) {
        console.warn('Supabase fetch single bike warning:', sbErr);
      }
    }

    // 2. Fallback to local file store
    if (!found) {
      const bikes = readBikesFromFile();
      const match = bikes.find(
        (b) =>
          b.slug === rawSlug ||
          b.slug.toLowerCase() === cleanSlug ||
          b.slug === slugifiedQuery ||
          slugify(b.slug) === slugifiedQuery ||
          slugify(b.model_name) === slugifiedQuery ||
          b.id === rawSlug ||
          b.id.toLowerCase() === cleanSlug
      );
      if (match) found = match;
    }

    if (!found) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json(found);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bike' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (body.model_name && !body.slug) {
      body.slug = slugify(body.model_name);
    } else if (body.slug) {
      body.slug = slugify(body.slug);
    }

    const client = supabaseAdmin || supabase;
    let updatedBike: Bike | null = null;

    // 1. Update in Supabase
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('bikes')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', params.id)
          .select()
          .maybeSingle();
        if (!error && data) {
          updatedBike = data as Bike;
        }
      } catch (sbErr) {
        console.warn('Supabase update bike warning:', sbErr);
      }
    }

    // 2. Update local file store
    try {
      const bikes = readBikesFromFile();
      const idx = bikes.findIndex((b) => b.id === params.id || b.slug === params.id);
      if (idx !== -1) {
        bikes[idx] = {
          ...bikes[idx],
          ...body,
          updated_at: new Date().toISOString(),
        };
        if (!updatedBike) updatedBike = bikes[idx];
        writeBikesToFile(bikes);
      }
    } catch (e) {}

    if (!updatedBike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBike);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update bike' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const rawId = String(params.id || '').trim();
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      try {
        // Disconnect from any orders first to avoid foreign key constraints
        await client.from('orders').update({ bike_id: null }).eq('bike_id', rawId);

        // Delete from Supabase by ID or slug
        const { error } = await client
          .from('bikes')
          .delete()
          .or(`id.eq.${rawId},slug.eq.${rawId}`);

        if (error) {
          console.error('Supabase delete error:', error);
        }
      } catch (sbErr) {
        console.warn('Supabase delete bike warning:', sbErr);
      }
    }

    try {
      const bikes = readBikesFromFile();
      const filtered = bikes.filter((b) => b.id !== rawId && b.slug !== rawId);
      writeBikesToFile(filtered);
    } catch (e) {}

    return NextResponse.json({ success: true, deleted: rawId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete bike' }, { status: 500 });
  }
}
