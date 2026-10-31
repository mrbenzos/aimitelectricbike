import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/lib/supabaseClient';
import { sendAdminOTP } from '@/lib/hubtel';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'aimitpower2025';

    // Authorized Admin Emails
    const envEmails = process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.split(',').map((e) => e.trim().toLowerCase())
      : ['admin@msniff.com'];

    const allowedAdmins = new Set([
      ...envEmails,
      'admin@msniff.com',
      'benzosjeff430@gmail.com',
    ]);

    // Verify initial credentials
    if (!allowedAdmins.has(normalizedEmail) || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes valid

    // Save to otp_codes table if available (non-blocking)
    try {
      await dbService.saveOTP(email, otpCode, expiresAt);
    } catch (e) {
      console.warn('DB OTP save warning:', e);
    }

    // Send 2FA SMS via registered Vynfy sender AIMIT EBIKE
    const smsResult = await sendAdminOTP(email, otpCode);

    if (!smsResult.success) {
      console.error('Failed to send OTP SMS:', smsResult.error);
      return NextResponse.json(
        {
          success: false,
          error: `SMS Gateway error: ${smsResult.error || 'Could not dispatch SMS'}.`,
        },
        { status: 500 }
      );
    }

    const maskedPhone =
      normalizedEmail === 'benzosjeff430@gmail.com'
        ? '0538***3984'
        : '0242***5706';

    // Build a self-contained stateless ticket that encodes the OTP code itself.
    // Format: base64(email:otpCode:expiresAtMs):hmac
    // This means verification does NOT need DB, memory, or cookies — just the ticket + submitted code.
    const expiresAtMs = expiresAt.getTime();
    const secret = process.env.ADMIN_JWT_SECRET || 'aimit-admin-secret-2025';
    const payload = Buffer.from(`${normalizedEmail}:${otpCode}:${expiresAtMs}`).toString('base64url');
    const sig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    const ticket = `${payload}.${sig}`;

    const res = NextResponse.json({
      success: true,
      message: `6-digit verification code sent to ${maskedPhone} via SMS (AIMIT EBIKE).`,
      expiresAt: expiresAt.toISOString(),
      ticket,
    });

    // Also set as cookie (belt-and-suspenders)
    res.cookies.set('msniff_otp_ticket', ticket, {
      httpOnly: false, // Allow JS to read as fallback
      maxAge: 5 * 60, // 5 minutes
      path: '/',
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
