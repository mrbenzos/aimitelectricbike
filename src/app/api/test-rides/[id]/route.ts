import { NextResponse } from 'next/server';
import { readTestRidesFromFile, writeTestRidesToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const rides = readTestRidesFromFile();
    const idx = rides.findIndex((r) => r.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Test ride booking not found' }, { status: 404 });
    }

    rides[idx] = {
      ...rides[idx],
      status,
    };

    writeTestRidesToFile(rides);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('test_rides').update({ status }).eq('id', params.id);
      } catch (sbErr) {
        console.warn('Supabase test ride update warning:', sbErr);
      }
    }

    return NextResponse.json(rides[idx]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update test ride' }, { status: 400 });
  }
}
