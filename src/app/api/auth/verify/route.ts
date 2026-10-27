import { NextResponse } from 'next/server';
import { dbService } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit code are required.' },
        { status: 400 }
      );
    }

    const isValid = await dbService.verifyOTP(email, code.trim());

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please try again.' },
        { status: 401 }
      );
    }

    // Set authenticated response
    const res = NextResponse.json({
      success: true,
      message: 'Admin 2FA verification successful.',
    });

    // Set cookie for session
    res.cookies.set('msniff_admin_session', 'authenticated_' + Date.now(), {
      httpOnly: false, // Accessible in client for fast routing
      maxAge: 60 * 60 * 24, // 1 day
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
