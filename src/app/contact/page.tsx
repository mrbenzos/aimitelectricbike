'use client';

import React, { useState } from 'react';
import { dbService } from '@/lib/supabaseClient';
import { alertNewTestRide } from '@/lib/hubtel';
import GhanaHubsMap from '@/components/GhanaHubsMap';
import { Calendar, Mail, CheckCircle2, MessageCircle } from 'lucide-react';
import { createWhatsAppLink } from '@/lib/utils';

export default function ContactPage() {
  const [testRideForm, setTestRideForm] = useState({
    name: '',
    phone: '',
    hub: 'Amasaman Hub (National HQ)',
    date: '',
    bikeInterest: 'AIMIT Sahara Offroad Pro',
  });
  const [testRideSubmitting, setTestRideSubmitting] = useState(false);
  const [testRideSuccess, setTestRideSuccess] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleTestRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestRideSubmitting(true);
    try {
      await dbService.createTestRide({
        name: testRideForm.name,
        phone: testRideForm.phone,
        preferred_hub: testRideForm.hub,
        preferred_date: testRideForm.date,
        bike_interest: testRideForm.bikeInterest,
        status: 'pending',
      });

      await alertNewTestRide({
        customerName: testRideForm.name,
        customerPhone: testRideForm.phone,
        hub: testRideForm.hub,
        date: testRideForm.date,
        bikeInterest: testRideForm.bikeInterest,
      });

      await dbService.logActivity(
        'new_test_ride',
        `Test Ride: ${testRideForm.name}`,
        `Booked at ${testRideForm.hub} on ${testRideForm.date}`
      );

      setTestRideSuccess(true);
      setTestRideForm({
        name: '',
        phone: '',
        hub: 'Amasaman Hub (National HQ)',
        date: '',
        bikeInterest: 'AIMIT Sahara Offroad Pro',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to submit test ride request. Please try direct WhatsApp booking.');
    } finally {
      setTestRideSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setContactSuccess(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          Get in Touch with M.Sniff Hub
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Visit any of our 4 official delivery & service hubs across Ghana, schedule a free test ride, or speak directly with our electric mobility technicians.
        </p>
      </div>

      {/* 4 HUBS MAP & DETAILS */}
      <GhanaHubsMap />

      {/* DUAL FORMS: Book Test Ride + General Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Test Ride Booking Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-emerald-600 font-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              100% Free Experience
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Book a Free Test Ride
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Feel the torque, test the suspension on real gravel, and see how simple charging is at our hubs.
            </p>
          </div>

          {testRideSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Test Ride Scheduled!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thanks <strong>{testRideForm.name}</strong>! We have notified the hub coordinator at <strong>{testRideForm.hub}</strong>. They will call you on <strong>{testRideForm.phone}</strong> to confirm your slot.
              </p>
              <button
                onClick={() => setTestRideSuccess(false)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-sm"
              >
                Book Another Slot
              </button>
            </div>
          ) : (
            <form onSubmit={handleTestRideSubmit} className="space-y-4">
              <div>
                <label htmlFor="testride-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  id="testride-name"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={testRideForm.name}
                  onChange={(e) => setTestRideForm({ ...testRideForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="testride-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Phone Number (Ghana):
                </label>
                <input
                  type="tel"
                  id="testride-phone"
                  required
                  placeholder="e.g. 0244123456"
                  value={testRideForm.phone}
                  onChange={(e) => setTestRideForm({ ...testRideForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="testride-hub" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Select Preferred Hub:
                </label>
                <select
                  id="testride-hub"
                  value={testRideForm.hub}
                  onChange={(e) => setTestRideForm({ ...testRideForm, hub: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="Amasaman Hub (National HQ)">Amasaman Hub (National HQ - Greater Accra)</option>
                  <option value="Tamale Regional Hub">Tamale Regional Hub (Northern Region)</option>
                  <option value="Bolgatanga Hub">Bolgatanga Hub (Upper East Region)</option>
                  <option value="Bawku Hub">Bawku Hub (Upper East Region)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="testride-date" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Preferred Date:
                  </label>
                  <input
                    type="date"
                    id="testride-date"
                    required
                    value={testRideForm.date}
                    onChange={(e) => setTestRideForm({ ...testRideForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="testride-bike" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Model of Interest:
                  </label>
                  <select
                    id="testride-bike"
                    value={testRideForm.bikeInterest}
                    onChange={(e) => setTestRideForm({ ...testRideForm, bikeInterest: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="AIMIT Sahara Offroad Pro">AIMIT Sahara Offroad Pro</option>
                    <option value="AIMIT Volt Commuter X1">AIMIT Volt Commuter X1</option>
                    <option value="AIMIT Cargo Hauler Max 750">AIMIT Cargo Hauler Max 750</option>
                    <option value="AIMIT Savanna Step-Thru Cruiser">AIMIT Savanna Step-Thru Cruiser</option>
                    <option value="AIMIT Stealth Apex 1000W">AIMIT Stealth Apex 1000W</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input type="checkbox" required id="testride-consent" className="mt-1 accent-[#10B981]" />
                <label htmlFor="testride-consent" className="text-[11px] text-slate-600 leading-relaxed">
                  I agree to the <a href="/legal/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a> and consent to M.Sniff processing my data for this booking.
                </label>
              </div>

              <button
                type="submit"
                disabled={testRideSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {testRideSubmitting ? 'Confirming with Hub...' : 'Confirm Test Ride Booking'}
              </button>
            </form>
          )}
        </div>

        {/* Right: General Contact Form & Hub Quick Contacts */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-600 font-black flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              Direct Inquiries
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Send Us a Message
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions regarding wholesale fleets, installment payments, or custom dispatch cargo racks?
            </p>
          </div>

          {contactSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Message Sent!</h3>
              <p className="text-xs text-slate-600">
                Thank you for contacting M.Sniff Business Hub. Our customer representative will get back to you shortly.
              </p>
              <button
                onClick={() => setContactSuccess(false)}
                className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-2.5 rounded-xl uppercase border border-slate-200"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="sr-only">Your Name</label>
                <input
                  type="text"
                  id="contact-name"
                  required
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="sr-only">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    placeholder="Email Address (Optional)"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="sr-only">Phone Number</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    required
                    placeholder="Phone Number (Ghana)"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="sr-only">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How can we help you? (e.g. Inquiring about 5 bikes for dispatch business in Kumasi)..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-4 text-sm text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input type="checkbox" required id="contact-consent" className="mt-1 accent-[#10B981]" />
                <label htmlFor="contact-consent" className="text-[11px] text-slate-600 leading-relaxed">
                  I agree to the <a href="/legal/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a> and consent to M.Sniff processing my data for this inquiry.
                </label>
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-emerald-500 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-sm"
              >
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need instant response?</span>
            <a
              href={createWhatsAppLink('Hello M.Sniff Hub, I have an inquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#25D366] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
