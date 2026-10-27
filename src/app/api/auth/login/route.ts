import { NextResponse } from 'next/server';
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

    // Save to otp_codes table
    await dbService.saveOTP(email, otpCode, expiresAt);

    // Send 2FA SMS
    const smsResult = await sendAdminOTP(email, otpCode);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to registered admin phone via SMS.',
      expiresAt: expiresAt.toISOString(),
      mock: smsResult.mock,
      devCode: smsResult.mock ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
