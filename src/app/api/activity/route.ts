import { NextResponse } from 'next/server';
import { readLogsFromFile, writeLogsToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { ActivityLog } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;
    const fileLogs = readLogsFromFile();

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          try {
            writeLogsToFile(data as ActivityLog[]);
          } catch (e) {}
          return NextResponse.json(data as ActivityLog[]);
        }
      } catch (sbErr) {
        console.warn('Supabase activity logs fetch warning:', sbErr);
      }
    }

    return NextResponse.json(fileLogs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch activity logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newLog: ActivityLog = {
      ...body,
      id: body.id || 'act-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client.from('activity_logs').insert([newLog]).select().single();
        if (!error && data) {
          try {
            const currentLogs = readLogsFromFile();
            writeLogsToFile([data as ActivityLog, ...currentLogs.filter((l) => l.id !== data.id)].slice(0, 50));
          } catch (e) {}
          return NextResponse.json(data as ActivityLog, { status: 201 });
        }
      } catch (sbErr) {
        console.warn('Supabase activity log insert skipped:', sbErr);
      }
    }

    try {
      const currentLogs = readLogsFromFile();
      const updatedLogs = [newLog, ...currentLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
      writeLogsToFile(updatedLogs);
    } catch (e) {}

    return NextResponse.json(newLog, { status: 201 });
  } catch (err: any) {
    console.error('Activity log creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to log activity' }, { status: 400 });
  }
}
