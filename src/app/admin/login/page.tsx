'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState('');
  const [ticket, setTicket] = useState<string | null>(null);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid credentials.');
        return;
      }

      if (data.ticket) setTicket(data.ticket);
      setSuccessMsg(data.message || 'Credentials verified. 6-digit OTP dispatched via SMS (AIMIT EBIKE).');
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, ticket }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid OTP code.');
        return;
      }

      // Store in client storage and cookie
      localStorage.setItem('msniff_admin_token', 'active_' + Date.now());
      document.cookie = 'msniff_admin_session=authenticated_' + Date.now() + '; path=/; max-age=86400; SameSite=Lax';

      // Check for redirect query param
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirectTarget = urlParams?.get('redirect') || '/admin';
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-electric/[0.05] rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-electric/10 border border-electric/40 flex items-center justify-center mx-auto text-electric shadow-electric">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">M.SNIFF Admin Portal</h1>
          <p className="text-xs text-gray-400">
            {step === 'credentials'
              ? 'Secure 2-Factor Authentication Required'
              : 'Enter 6-Digit SMS Verification Code'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-electric/15 border border-electric/30 text-electric text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Email & Password */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Admin Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email"
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Continue to SMS 2FA'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: SMS OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1 text-center">
                Enter 6-Digit Code:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-electric absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 842109"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-black bg-[#181818] border border-[#2B2B2B] focus:border-electric rounded-xl py-3 text-white focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-1.5">
                SMS sender ID: <strong className="text-white">AIMIT E-BIKE</strong> • Valid for 5 mins
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-electric hover:bg-electric-dark text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-electric transition-all disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Verify Code & Enter Admin'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Back to Credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
