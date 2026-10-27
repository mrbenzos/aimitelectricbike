import { NextResponse } from 'next/server';
import { readBikesFromFile, writeBikesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { Bike } from '@/lib/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const rawSlug = String(params.id || '').trim();
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
    const slugifiedQuery = slugify(cleanSlug);

    const bikes = readBikesFromFile();
    let found = bikes.find(
      (b) =>
        b.slug === rawSlug ||
        b.slug.toLowerCase() === cleanSlug ||
        b.slug === slugifiedQuery ||
        slugify(b.slug) === slugifiedQuery ||
        slugify(b.model_name) === slugifiedQuery ||
        b.id === rawSlug ||
        b.id.toLowerCase() === cleanSlug
    );

    if (!found && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
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

    const bikes = readBikesFromFile();
    const idx = bikes.findIndex((b) => b.id === params.id || b.slug === params.id);
    let updatedBike: Bike | null = null;

    if (idx !== -1) {
      bikes[idx] = {
        ...bikes[idx],
        ...body,
        updated_at: new Date().toISOString(),
      };
      updatedBike = bikes[idx];
      writeBikesToFile(bikes);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
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
    const bikes = readBikesFromFile();
    const initialLen = bikes.length;
    const filtered = bikes.filter((b) => b.id !== params.id && b.slug !== params.id);
    writeBikesToFile(filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bikes').delete().eq('id', params.id);
      } catch (sbErr) {
        console.warn('Supabase delete bike warning:', sbErr);
      }
    }

    return NextResponse.json({ success: filtered.length < initialLen });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete bike' }, { status: 500 });
  }
}
