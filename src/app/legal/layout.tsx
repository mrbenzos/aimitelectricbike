'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav>
          <Link
            href="/"
            className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-2"
          >
            &larr; Back to Home
          </Link>
        </nav>
        
        <main className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-slate-700">
          {children}
        </main>
        
        <footer className="text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} M.Sniff Business Hub. All rights reserved.
          </p>
          <p className="mt-2">
            AIMIT Electric Bicycles &mdash; Greater Accra, Ghana.
          </p>
        </footer>
      </div>
    </div>
  );
}
