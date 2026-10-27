import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | M.Sniff AIMIT Electric Bicycles',
  description: 'Privacy Policy for M.Sniff Business Hub and AIMIT Electric Bicycles, compliant with Ghana Data Protection Act 2012 (Act 843).',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">1. Introduction</h2>
          <p>
            Welcome to the M.Sniff Business Hub, the official distributor of AIMIT Electric Bicycles in Ghana. 
            We respect your privacy and are committed to protecting your personal data in compliance with the 
            Ghana Data Protection Act 2012 (Act 843). This policy explains how we collect, use, and safeguard your information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">2. Data We Collect</h2>
          <p>We only collect personal information that you voluntarily provide to us through our forms. This includes:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Delivery Address</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">3. How We Use Your Data</h2>
          <p>The information we collect is used strictly for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>To process and fulfill your orders</li>
            <li>To schedule and confirm test rides</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To send SMS notifications regarding your order status (via licensed SMS gateways such as Vynfy)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">4. Data Storage & Security</h2>
          <p>
            Your data is stored securely on our local servers. We implement appropriate technical and organizational 
            measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. 
            We do not sell, rent, or share your data with third parties, except for our SMS gateway provider as necessary.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">5. Your Rights</h2>
          <p>Under the Ghana Data Protection Act 2012 (Act 843), you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">6. Cookies</h2>
          <p>
            Our website uses only essential functional cookies required for site operation. We do not use any 
            tracking, analytics, or advertising cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">7. Third-Party Services</h2>
          <p>
            We utilize third-party communication services such as the Vynfy SMS gateway for notifications and WhatsApp links 
            for direct communication. No personal data is shared with these services beyond what is strictly 
            necessary to facilitate the communication or transaction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">8. Contact the DPO</h2>
          <p>If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:</p>
          <ul className="space-y-1 mt-2">
            <li><strong>Name:</strong> Alhaji Mustapha Sniff</li>
            <li><strong>Email:</strong> <a href="mailto:info@msniffhub.com" className="text-emerald-700 hover:underline">info@msniffhub.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+233242365706" className="text-emerald-700 hover:underline">+233 24 236 5706</a></li>
            <li><strong>Address:</strong> M.Sniff Complex, Near Amasaman Stadium / High Court Road, Amasaman, Greater Accra, Ghana</li>
          </ul>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">9. Updates to Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. 
            Any updates will be posted on this page with an updated revision date.
          </p>
        </section>
      </div>
    </article>
  );
}
