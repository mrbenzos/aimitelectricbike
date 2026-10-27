import { NextResponse } from 'next/server';
import { readTestRidesFromFile, writeTestRidesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { TestRideBooking } from '@/lib/types';

export async function GET() {
  try {
    const fileRides = readTestRidesFromFile();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('test_rides')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mergedMap = new Map<string, TestRideBooking>();
          fileRides.forEach((r) => mergedMap.set(r.id, r));
          (data as TestRideBooking[]).forEach((r) => mergedMap.set(r.id, r));

          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          writeTestRidesToFile(mergedList);
          return NextResponse.json(mergedList);
        }
      } catch (sbErr) {
        console.warn('Supabase test rides fetch warning:', sbErr);
      }
    }

    return NextResponse.json(fileRides);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch test rides' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRide: TestRideBooking = {
      ...body,
      id: 'tr-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    const currentRides = readTestRidesFromFile();
    const updatedRides = [newRide, ...currentRides.filter((r) => r.id !== newRide.id)];
    writeTestRidesToFile(updatedRides);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_rides').insert([newRide]).select().single();
        if (!error && data) {
          return NextResponse.json(data as TestRideBooking, { status: 201 });
        }
      } catch (sbErr) {
        console.warn('Supabase test ride insert skipped, saved to disk:', sbErr);
      }
    }

    return NextResponse.json(newRide, { status: 201 });
  } catch (err: any) {
    console.error('Test ride creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create test ride' }, { status: 400 });
  }
}
