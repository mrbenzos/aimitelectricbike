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

    let isValid = false;

    // --- PRIMARY: Stateless self-contained ticket (works across serverless instances) ---
    // Ticket format: base64url(email:code:expiresAtMs).hmacSig
    const rawTicket = clientTicket || (() => {
      const cookieHeader = req.headers.get('cookie') || '';
      const m = cookieHeader.match(/msniff_otp_ticket=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    })();

    if (rawTicket && rawTicket.includes('.')) {
      try {
        const dotIdx = rawTicket.lastIndexOf('.');
        const payload = rawTicket.slice(0, dotIdx);
        const sig = rawTicket.slice(dotIdx + 1);

        const secret = process.env.ADMIN_JWT_SECRET || 'aimit-admin-secret-2025';
        const expectedSig = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex');

        if (expectedSig === sig) {
          // Signature is valid — decode payload
          const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
          const parts = decoded.split(':');
          // parts: [email, otpCode, expiresAtMs]
          if (parts.length >= 3) {
            const [ticketEmail, ticketCode, expiresAtMs] = parts;
            const now = Date.now();
            const expiresAt = parseInt(expiresAtMs, 10);

            if (
              ticketEmail === cleanEmail &&
              ticketCode === cleanCode &&
              !isNaN(expiresAt) &&
              now <= expiresAt
            ) {
              isValid = true;
            } else {
              console.warn('[verify] Ticket payload mismatch or expired:', {
                emailMatch: ticketEmail === cleanEmail,
                codeMatch: ticketCode === cleanCode,
                expired: now > expiresAt,
                now,
                expiresAt,
              });
            }
          }
        } else {
          console.warn('[verify] Ticket HMAC signature mismatch');
        }
      } catch (e) {
        console.warn('[verify] Ticket decode error:', e);
      }
    }

    // --- FALLBACK: In-memory OTP (works in dev / single-instance) ---
    if (!isValid) {
      try {
        isValid = await dbService.verifyOTP(cleanEmail, cleanCode);
      } catch (e) {
        console.warn('DB/memory OTP verify warning:', e);
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
