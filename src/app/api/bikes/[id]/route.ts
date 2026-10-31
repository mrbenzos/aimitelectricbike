import { NextResponse } from 'next/server';
import { readBikesFromFile, writeBikesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { Bike } from '@/lib/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
        const isUUID = UUID_REGEX.test(rawSlug);
        let query = client.from('bikes').select('*');

        if (isUUID) {
          // Search by UUID id OR slug
          const { data: byId } = await query.eq('id', rawSlug).maybeSingle();
          if (byId) {
            found = byId as Bike;
          } else {
            const { data: bySlug } = await client.from('bikes').select('*').eq('slug', rawSlug).maybeSingle();
            if (bySlug) found = bySlug as Bike;
          }
        } else {
          // Non-UUID — search by slug variants only (no id.eq to avoid Postgres UUID parse error)
          const { data: bySlug } = await client
            .from('bikes')
            .select('*')
            .or(`slug.eq.${rawSlug},slug.eq.${cleanSlug},slug.eq.${slugifiedQuery}`)
            .maybeSingle();
          if (bySlug) found = bySlug as Bike;
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
    const isUUID = UUID_REGEX.test(rawId);
    const client = supabaseAdmin || supabase;
    let deletedFromSupabase = false;

    if (isSupabaseConfigured && client) {
      try {
        if (isUUID) {
          // Proper UUID: disconnect orders first, then delete by id
          await client.from('orders').update({ bike_id: null }).eq('bike_id', rawId);
          const { error } = await client.from('bikes').delete().eq('id', rawId);
          if (!error) deletedFromSupabase = true;
          else console.error('Supabase delete by UUID error:', error);
        } else {
          // Non-UUID: search by id column first, then slug column
          const { data: byId } = await client
            .from('bikes')
            .select('id')
            .eq('id', rawId)
            .maybeSingle();

          const { data: bySlug } = !byId
            ? await client.from('bikes').select('id').eq('slug', rawId).maybeSingle()
            : { data: null };

          const realId = byId?.id || bySlug?.id;

          if (realId) {
            await client.from('orders').update({ bike_id: null }).eq('bike_id', realId);
            const { error } = await client.from('bikes').delete().eq('id', realId);
            if (!error) deletedFromSupabase = true;
            else console.error('Supabase delete by id/slug error:', error);
          } else {
            // Last resort: try deleting directly by id text match (handles text-type id column)
            await client.from('orders').update({ bike_id: null }).eq('bike_id', rawId);
            const { error } = await client.from('bikes').delete().eq('id', rawId);
            if (!error) deletedFromSupabase = true;
            else console.error('Supabase delete direct text id error:', error);
          }
        }
      } catch (sbErr) {
        console.warn('Supabase delete bike warning:', sbErr);
      }
    }

    // Also remove from local file store (handles legacy non-UUID IDs)
    try {
      const bikes = readBikesFromFile();
      const filtered = bikes.filter((b) => b.id !== rawId && b.slug !== rawId);
      writeBikesToFile(filtered);
    } catch (e) {}

    if (!deletedFromSupabase) {
      console.warn(`[DELETE /api/bikes/${rawId}] Not found in Supabase — may already be deleted or ID mismatch.`);
    }

    return NextResponse.json({ success: true, deleted: rawId, fromSupabase: deletedFromSupabase });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete bike' }, { status: 500 });
  }
}
