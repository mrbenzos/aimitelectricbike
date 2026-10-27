'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = localStorage.getItem('msniff_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (!show) {
    return null;
  }

  const handleAccept = () => {
    localStorage.setItem('msniff_cookie_consent', 'true');
    setShow(false);
  };

  return (
    <div 
      role="alert" 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-full duration-500 ease-out transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-700 text-sm leading-relaxed max-w-3xl">
          This site uses only essential cookies for site functionality. No tracking or advertising cookies are used.
        </p>
        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
          <Link 
            href="/legal/cookies"
            className="text-sm font-bold tracking-wider uppercase text-emerald-600 hover:underline whitespace-nowrap"
          >
            Learn More
          </Link>
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors shadow-sm"
            aria-label="Accept essential cookies"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
