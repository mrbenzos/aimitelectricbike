import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies Policy | M.Sniff AIMIT Electric Bicycles',
  description: 'Information about how we use cookies on the M.Sniff AIMIT Electric Bicycles website.',
};

export default function CookiesPolicyPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Cookies Policy</h1>
        <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used 
            to make websites work efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">2. Cookies We Use</h2>
          <p>We use <strong>only essential cookies</strong> necessary for the core functionality of our website. These include:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Session Cookies:</strong> Next.js framework cookies required for basic site navigation and security.</li>
            <li><strong>Local Storage:</strong> Used to securely store your cart data and your cookie consent preference locally on your device.</li>
          </ul>
          <p className="mt-4 font-bold text-slate-900">
            We do NOT use tracking, analytics, or advertising cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">3. Third-Party Cookies</h2>
          <p>
            We do not use any third-party cookies on our website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">4. How to Manage Cookies</h2>
          <p>
            Most web browsers allow some control of most cookies through the browser settings. You can set your browser 
            to refuse all or some browser cookies, or to alert you when websites set or access cookies. However, disabling 
            essential cookies may impact the functionality of our website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">5. Your Rights</h2>
          <p>
            You have the right to accept or decline our use of essential cookies. By continuing to use our website, 
            you agree to the use of these essential functional cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">6. Contact</h2>
          <p>If you have any questions about our Cookies Policy:</p>
          <ul className="space-y-1 mt-2">
            <li><strong>Email:</strong> <a href="mailto:info@msniffhub.com" className="text-emerald-700 hover:underline">info@msniffhub.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+233242365706" className="text-emerald-700 hover:underline">+233 24 236 5706</a></li>
          </ul>
        </section>
      </div>
    </article>
  );
}
