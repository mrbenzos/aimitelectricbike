import { NextResponse } from 'next/server';
import { readBikesFromFile, writeBikesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/utils';
import { Bike } from '@/lib/types';

export async function GET() {
  try {
    const fileBikes = readBikesFromFile();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('bikes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mergedMap = new Map<string, Bike>();
          fileBikes.forEach((b) => mergedMap.set(b.id, b));
          (data as Bike[]).forEach((b) => mergedMap.set(b.id, b));

          const getTime = (dateStr?: string) => (dateStr ? new Date(dateStr).getTime() : 0);
          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => getTime(b.created_at) - getTime(a.created_at)
          );
          writeBikesToFile(mergedList);
          return NextResponse.json(mergedList);
        }
      } catch (sbErr) {
        console.warn('Supabase fetch error, fallback to disk store:', sbErr);
      }
    }

    return NextResponse.json(fileBikes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bikes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const generatedSlug = slugify(body.slug || body.model_name);
    const newBike: Bike = {
      ...body,
      slug: generatedSlug,
      id: 'bike-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Always persist to local disk file first for guaranteed cross-browser availability
    const currentBikes = readBikesFromFile();
    const updatedList = [newBike, ...currentBikes.filter((b) => b.id !== newBike.id)];
    writeBikesToFile(updatedList);

    // Try Supabase insert as secondary cloud sync
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bikes').insert([newBike]).select().single();
        if (!error && data) {
          return NextResponse.json(data as Bike, { status: 201 });
        }
      } catch (sbErr) {
        console.warn('Supabase insert skipped, saved to disk store:', sbErr);
      }
    }

    return NextResponse.json(newBike, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create bike' }, { status: 400 });
  }
}
