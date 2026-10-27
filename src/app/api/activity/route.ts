import { NextResponse } from 'next/server';
import { readLogsFromFile, writeLogsToFile } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { ActivityLog } from '@/lib/types';

export async function GET() {
  try {
    const fileLogs = readLogsFromFile();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const mergedMap = new Map<string, ActivityLog>();
          fileLogs.forEach((l) => mergedMap.set(l.id, l));
          (data as ActivityLog[]).forEach((l) => mergedMap.set(l.id, l));

          const mergedList = Array.from(mergedMap.values())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 50);
          writeLogsToFile(mergedList);
          return NextResponse.json(mergedList);
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
      id: 'act-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    const currentLogs = readLogsFromFile();
    const updatedLogs = [newLog, ...currentLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
    writeLogsToFile(updatedLogs);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('activity_logs').insert([newLog]);
      } catch (sbErr) {
        console.warn('Supabase activity log insert skipped, saved to disk:', sbErr);
      }
    }

    return NextResponse.json(newLog, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to log activity' }, { status: 400 });
  }
}
