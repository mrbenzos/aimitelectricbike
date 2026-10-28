import { NextResponse } from 'next/server';
import { readOrdersFromFile, writeOrdersToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const client = supabaseAdmin || supabase;
    let updatedOrder: any = null;

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('orders')
          .update({ status })
          .eq('id', params.id)
          .select('*, bike:bikes(*)')
          .maybeSingle();
        if (!error && data) {
          updatedOrder = data;
        }
      } catch (sbErr) {
        console.warn('Supabase order update warning:', sbErr);
      }
    }

    try {
      const orders = readOrdersFromFile();
      const idx = orders.findIndex((o) => o.id === params.id);
      if (idx !== -1) {
        orders[idx] = {
          ...orders[idx],
          status,
        };
        if (!updatedOrder) updatedOrder = orders[idx];
        writeOrdersToFile(orders);
      }
    } catch (e) {}

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 400 });
  }
}
