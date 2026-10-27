import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CookieConsent from '@/components/CookieConsent';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://aimitelectricbike.com'),
  title: 'M.SNIFF BUSINESS HUB | AIMIT Electric Bicycles Ghana',
  description:
    'Save Fuel. Beat Traffic. Ride Electric. Ghana\u2019s premier official distributor of rugged AIMIT electric bicycles with nationwide delivery hubs in Amasaman (HQ), Tamale, Bolga, and Bawku.',
  keywords: [
    'Electric bicycle Ghana',
    'AIMIT e-bike',
    'M.Sniff Business Hub',
    'e-bike Accra',
    'Tamale e-bike',
    'Bolga electric bike',
    'Save fuel Ghana trotro',
    'buy electric bike Ghana',
    'AIMIT electric bicycle Ghana',
    'aimitelectricbike.com',
  ],
  openGraph: {
    type: 'website',
    url: 'https://aimitelectricbike.com',
    siteName: 'M.Sniff Business Hub — AIMIT Electric Bikes Ghana',
    title: 'M.SNIFF BUSINESS HUB | AIMIT Electric Bicycles Ghana',
    description:
      'Save Fuel. Beat Traffic. Ride Electric. Ghana\u2019s premier official distributor of AIMIT electric bicycles. Nationwide delivery hubs.',
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M.SNIFF BUSINESS HUB | AIMIT Electric Bicycles Ghana',
    description:
      'Ghana\u2019s premier AIMIT e-bike distributor. Save fuel, beat traffic, ride electric. Hubs in Amasaman, Tamale, Bolga & Bawku.',
  },
  alternates: {
    canonical: 'https://aimitelectricbike.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-[#F8FAFC] text-slate-900 flex flex-col min-h-screen">
        <CartProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
