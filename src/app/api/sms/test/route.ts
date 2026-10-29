import { NextResponse } from 'next/server';
import { sendAlertSMS, SMS_LOGS } from '@/lib/hubtel';

export async function GET() {
  const isVynfy = Boolean(process.env.VYNFY_API_KEY);
  const isHubtel = Boolean(process.env.HUBTEL_CLIENT_ID && process.env.HUBTEL_CLIENT_SECRET);

  return NextResponse.json({
    status: 'online',
    activeProvider: isVynfy ? 'Vynfy SMS API' : isHubtel ? 'Hubtel SMS API' : 'Mock Dev Mode',
    vynfyConfigured: isVynfy,
    hubtelConfigured: isHubtel,
    ownerPhone: process.env.OWNER_PHONE || '233242365706',
    senderId: process.env.SENDER_ID || 'AIMIT E-BIKE',
    recentLogs: SMS_LOGS.slice(0, 20),
  });
}

export async function POST(req: Request) {
  try {
    const { to, message, senderId } = await req.json();
    const result = await sendAlertSMS({
      to: to || process.env.OWNER_PHONE || '233242365706',
      message: message || 'AIMIT E-BIKE: Test notification via Vynfy SMS API.',
      senderId: senderId || process.env.SENDER_ID || 'AIMIT E-BIKE',
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
