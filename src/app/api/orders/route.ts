import { NextResponse } from 'next/server';
import { readOrdersFromFile, writeOrdersToFile, readBikesFromFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { Order } from '@/lib/types';

export async function GET() {
  try {
    const fileOrders = readOrdersFromFile();
    const bikes = readBikesFromFile();

    // Attach bike object if missing
    const enrichedOrders = fileOrders.map((order) => {
      if (!order.bike && order.bike_id) {
        const foundBike = bikes.find((b) => b.id === order.bike_id || b.slug === order.bike_id);
        if (foundBike) return { ...order, bike: foundBike };
      }
      return order;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, bike:bikes(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mergedMap = new Map<string, Order>();
          enrichedOrders.forEach((o) => mergedMap.set(o.id, o));
          (data as Order[]).forEach((o) => mergedMap.set(o.id, o));

          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          writeOrdersToFile(mergedList);
          return NextResponse.json(mergedList);
        }
      } catch (sbErr) {
        console.warn('Supabase orders fetch warning:', sbErr);
      }
    }

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
      id: 'ord-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      bike: foundBike || undefined,
    };

    // Save directly to disk file store
    const currentOrders = readOrdersFromFile();
    const updatedOrders = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];
    writeOrdersToFile(updatedOrders);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
        if (!error && data) {
          return NextResponse.json(data as Order, { status: 201 });
        }
      } catch (sbErr) {
        console.warn('Supabase order insert skipped, saved to disk:', sbErr);
      }
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 400 });
  }
}
