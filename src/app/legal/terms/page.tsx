import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | M.Sniff AIMIT Electric Bicycles',
  description: 'Terms and Conditions for purchasing AIMIT Electric Bicycles from M.Sniff Business Hub.',
};

export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
        <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing this website and purchasing products from M.Sniff Business Hub, you agree to be bound by these 
            Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">2. About M.Sniff Business Hub</h2>
          <p>
            M.Sniff Business Hub is the official distributor of AIMIT Electric Bicycles in Ghana. Our headquarters are located at 
            the M.Sniff Complex, Near Amasaman Stadium / High Court Road, Amasaman, Greater Accra, Ghana. We operate additional 
            hubs in Tamale, Bolgatanga, and Bawku.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">3. Products & Pricing</h2>
          <p>
            All prices listed on our website are in Ghanaian Cedi (GHS) and are subject to change without prior notice. 
            Promotional prices and discounts are time-limited and subject to availability. We reserve the right to modify 
            or discontinue any product at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">4. Orders & Payment</h2>
          <p>We accept the following payment methods for orders:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>MTN Mobile Money</li>
            <li>Telecel Cash</li>
            <li>Bank Wire Transfer</li>
            <li>Pay on Hub Pickup</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">5. Delivery & Hub Pickup</h2>
          <p>
            We offer delivery services and in-person pickup across our 4 hubs (Amasaman, Tamale, Bolgatanga, Bawku). 
            Transit times vary between 1-5 business days depending on your location. Delivery fees may apply and will 
            be communicated during the order confirmation process.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">6. Warranty</h2>
          <p>
            All AIMIT Electric Bicycles come with a 12-month official warranty. This warranty covers manufacturing defects. 
            It explicitly <strong>excludes</strong> damages caused by misuse, accidents, unauthorized modifications, or water damage 
            beyond the IP65 rating limits.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">7. Limitation of Liability</h2>
          <p>
            M.Sniff Business Hub shall not be liable for any indirect, incidental, special, or consequential damages resulting 
            from the use or inability to use our products or website.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">8. Governing Law</h2>
          <p>
            These Terms & Conditions are governed by and construed in accordance with the Laws of the Republic of Ghana, 
            including the Electronic Transactions Act 2008. Any disputes shall be subject to the exclusive jurisdiction 
            of the courts of Ghana.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">9. Contact</h2>
          <p>For any questions regarding these Terms & Conditions, please contact us:</p>
          <ul className="space-y-1 mt-2">
            <li><strong>Email:</strong> <a href="mailto:info@msniffhub.com" className="text-emerald-700 hover:underline">info@msniffhub.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+233242365706" className="text-emerald-700 hover:underline">+233 24 236 5706</a></li>
          </ul>
        </section>
      </div>
    </article>
  );
}
