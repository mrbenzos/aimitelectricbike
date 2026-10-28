import { NextResponse } from 'next/server';
import { readOrdersFromFile, writeOrdersToFile, readBikesFromFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;
    let fileOrders = readOrdersFromFile();
    const bikes = readBikesFromFile();

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*, bike:bikes(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          try {
            writeOrdersToFile(data as Order[]);
          } catch (e) {}
          return NextResponse.json(data as Order[]);
        }
      } catch (sbErr) {
        console.warn('Supabase orders fetch warning:', sbErr);
      }
    }

    // Attach bike object if missing
    const enrichedOrders = fileOrders.map((order) => {
      if (!order.bike && order.bike_id) {
        const foundBike = bikes.find((b) => b.id === order.bike_id || b.slug === order.bike_id);
        if (foundBike) return { ...order, bike: foundBike };
      }
      return order;
    });

    return NextResponse.json(enrichedOrders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bikes = readBikesFromFile();
    const foundBike = bikes.find((b) => b.id === body.bike_id || b.slug === body.bike_id);

    const newOrder: Order = {
      ...body,
      id: body.id || 'ord-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      bike: foundBike || undefined,
    };

    const client = supabaseAdmin || supabase;

    // Sync to Supabase if configured
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client.from('orders').insert([newOrder]).select().single();
        if (!error && data) {
          try {
            const currentOrders = readOrdersFromFile();
            writeOrdersToFile([data as Order, ...currentOrders.filter((o) => o.id !== data.id)]);
          } catch (e) {}
          return NextResponse.json(data as Order, { status: 201 });
        } else if (error) {
          console.warn('Supabase order insert error:', error);
        }
      } catch (sbErr) {
        console.warn('Supabase order insert skipped:', sbErr);
      }
    }

    // Save to disk file store
    try {
      const currentOrders = readOrdersFromFile();
      const updatedOrders = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];
      writeOrdersToFile(updatedOrders);
    } catch (e) {}

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 400 });
  }
}
