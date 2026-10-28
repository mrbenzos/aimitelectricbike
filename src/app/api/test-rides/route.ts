import { NextResponse } from 'next/server';
import { readTestRidesFromFile, writeTestRidesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { TestRideBooking } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;
    const fileRides = readTestRidesFromFile();

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('test_rides')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          try {
            writeTestRidesToFile(data as TestRideBooking[]);
          } catch (e) {}
          return NextResponse.json(data as TestRideBooking[]);
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
      id: body.id || 'tr-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client.from('test_rides').insert([newRide]).select().single();
        if (!error && data) {
          try {
            const currentRides = readTestRidesFromFile();
            writeTestRidesToFile([data as TestRideBooking, ...currentRides.filter((r) => r.id !== data.id)]);
          } catch (e) {}
          return NextResponse.json(data as TestRideBooking, { status: 201 });
        }
      } catch (sbErr) {
        console.warn('Supabase test ride insert skipped:', sbErr);
      }
    }

    try {
      const currentRides = readTestRidesFromFile();
      const updatedRides = [newRide, ...currentRides.filter((r) => r.id !== newRide.id)];
      writeTestRidesToFile(updatedRides);
    } catch (e) {}

    return NextResponse.json(newRide, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to book test ride' }, { status: 400 });
  }
}
