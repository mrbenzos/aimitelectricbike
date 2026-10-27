import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Returns Policy | M.Sniff AIMIT Electric Bicycles',
  description: 'Refund, returns, and exchange policy for AIMIT Electric Bicycles at M.Sniff Business Hub.',
};

export default function RefundPolicyPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Refund & Returns Policy</h1>
        <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">1. Overview</h2>
          <p>
            At M.Sniff Business Hub, we strive for customer satisfaction with every AIMIT Electric Bicycle purchase. 
            This policy outlines the conditions under which refunds and returns are accepted.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">2. Eligibility</h2>
          <p>
            We offer a 7-day return window for electric bicycles that are <strong>unopened and unused</strong> in their 
            original packaging. To be eligible, you must present the original receipt or proof of purchase.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">3. Exchange Policy</h2>
          <p>
            We provide a 14-day exchange period for bicycles with verified manufacturing defects. The bicycle must be 
            brought into one of our hubs for inspection by our technical team before an exchange is approved.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">4. Non-Refundable Items</h2>
          <p>The following items and conditions are strictly non-refundable:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Bicycles that have been test-ridden or used</li>
            <li>Bicycles displaying physical damage resulting from misuse or accidents</li>
            <li>Accessories and spare parts</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">5. How to Request</h2>
          <p>To initiate a return or exchange, please follow these steps:</p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600">
            <li>Contact our support team via WhatsApp or phone.</li>
            <li>Bring the bicycle to your nearest M.Sniff Business Hub.</li>
            <li>Our team will perform a physical inspection of the item.</li>
            <li>If approved, your refund or exchange will be processed within 5-7 business days.</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">6. Refund Method</h2>
          <p>
            Refunds are credited using the same payment method originally used for the purchase (e.g. MTN Mobile Money, 
            Telecel Cash, or Bank Wire). Cash refunds are not provided for security reasons.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">7. Damaged or Defective on Arrival</h2>
          <p>
            If your bicycle arrives with transit damage or fails pre-delivery inspection at the hub, M.Sniff Hub will provide 
            an immediate replacement unit at zero additional cost to you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">8. Contact</h2>
          <p>For questions or support regarding refunds and exchanges:</p>
          <ul className="space-y-1 mt-2">
            <li><strong>Email:</strong> <a href="mailto:info@msniffhub.com" className="text-emerald-700 hover:underline">info@msniffhub.com</a></li>
            <li><strong>Phone / WhatsApp:</strong> <a href="tel:+233242365706" className="text-emerald-700 hover:underline">+233 24 236 5706</a></li>
          </ul>
        </section>
      </div>
    </article>
  );
}
