import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { email, code, ticket: clientTicket } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // 1. Database check (if otp_codes table exists)
    let isValid = false;
    try {
      isValid = await dbService.verifyOTP(cleanEmail, cleanCode);
    } catch (e) {
      console.warn('DB OTP verify warning:', e);
    }

    // 2. Stateless HMAC validation fallback (guarantees verification even if DB table is uninitialized)
    if (!isValid) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieMatch = cookieHeader.match(/msniff_otp_ticket=([^;]+)/);
      const ticket = clientTicket || (cookieMatch ? cookieMatch[1] : null);

      if (ticket && ticket.includes(':')) {
        const [tsStr, expectedHash] = ticket.split(':');
        const ts = parseInt(tsStr, 10);
        const now = Date.now();

        // Valid for up to 5 minutes (300,000 ms)
        if (!isNaN(ts) && now - ts <= 5 * 60 * 1000) {
          const secret = process.env.ADMIN_JWT_SECRET || 'aimit-admin-secret-2025';
          const calculatedHash = crypto
            .createHmac('sha256', secret)
            .update(`${cleanEmail}:${cleanCode}:${ts}`)
            .digest('hex');

          if (calculatedHash === expectedHash) {
            isValid = true;
          }
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please check and try again.' },
        { status: 401 }
      );
    }

    // Set authenticated response
    const res = NextResponse.json({
      success: true,
      message: 'Admin 2FA verification successful.',
    });

    // Set cookie for session (accessible on both server middleware and client)
    res.cookies.set('msniff_admin_session', 'authenticated_' + Date.now(), {
      httpOnly: false,
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax',
    });

    // Clear the OTP ticket cookie
    res.cookies.set('msniff_otp_ticket', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
