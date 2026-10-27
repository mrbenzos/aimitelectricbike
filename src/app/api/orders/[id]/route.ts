import { NextResponse } from 'next/server';
import { readOrdersFromFile, writeOrdersToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const orders = readOrdersFromFile();
    const idx = orders.findIndex((o) => o.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[idx] = {
      ...orders[idx],
      status,
    };

    writeOrdersToFile(orders);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', params.id);
      } catch (sbErr) {
        console.warn('Supabase order update warning:', sbErr);
      }
    }

    return NextResponse.json(orders[idx]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 400 });
  }
}
