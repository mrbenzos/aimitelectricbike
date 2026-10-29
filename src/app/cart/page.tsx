'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { DELIVERY_HUBS } from '@/lib/types';
import { formatGHS } from '@/lib/utils';
import { dbService } from '@/lib/supabaseClient';
import { alertNewOrder } from '@/lib/hubtel';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    selectedHub,
    setSelectedHub,
    subtotal,
    deliveryFee,
    grandTotal,
    generateWhatsAppOrderUrl,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentType, setPaymentType] = useState('Mobile Money (MTN / Telecel)');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  const currentHub = DELIVERY_HUBS.find((h) => h.id === selectedHub) || DELIVERY_HUBS[0];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmittingOrder(true);
    try {
      // Create order in DB for the primary bike item
      const primaryItem = items[0];
      const createdOrder = await dbService.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_location: customerAddress,
        delivery_hub: currentHub.name,
        bike_id: primaryItem.bike.id,
        quantity: primaryItem.quantity,
        total_price: grandTotal,
        status: 'pending',
        payment_type: paymentType,
      });

      // Fire Hubtel/Vynfy SMS alert engine (Sends to OWNER and CUSTOMER!)
      await alertNewOrder({
        modelName: items.map((i) => `${i.bike.model_name} (x${i.quantity})`).join(', '),
        qty: items.reduce((acc, i) => acc + i.quantity, 0),
        deliveryHub: currentHub.name,
        customerPhone,
        customerName,
        totalPrice: grandTotal,
      });

      // Log activity
      await dbService.logActivity(
        'new_order',
        `Order #${createdOrder.id}`,
        `${customerName} ordered for ${currentHub.name} (GHS ${grandTotal})`
      );

      setOrderComplete(createdOrder);
      clearCart();
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Failed to place order. Please try direct WhatsApp checkout instead.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (orderComplete) {
    const confirmationWhatsAppUrl = generateWhatsAppOrderUrl(customerName, customerPhone, customerAddress);

    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 transition-colors">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-slate-900">Order Successfully Placed!</h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Thank you <strong>{orderComplete.customer_name}</strong>. Your order reference is{' '}
          <span className="text-emerald-700 font-mono font-bold">#{orderComplete.id}</span>.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 text-xs text-slate-700 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Delivery Hub:</span>
            <span className="font-bold text-slate-900">{orderComplete.delivery_hub}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-bold text-emerald-700 text-sm">{formatGHS(orderComplete.total_price)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Phone Number:</span>
            <span className="font-bold text-slate-900 font-mono">{orderComplete.customer_phone}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            An automated SMS confirmation was dispatched to your phone from <strong>AIMIT E-BIKE</strong>. Our hub logistics team will call you to confirm dispatch.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={confirmationWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Notify M.Sniff on WhatsApp (Instant)
          </a>
          <Link
            href="/bikes"
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Explore our rugged AIMIT electric bicycles fleet and save up to 85% on your daily transport fuel.
        </p>
        <Link
          href="/bikes"
          className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-sm"
        >
          Explore E-Bikes <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    );
  }

  const whatsAppCheckoutUrl = generateWhatsAppOrderUrl(customerName, customerPhone, customerAddress);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors">
      <div>
        <span className="text-xs uppercase tracking-widest text-emerald-600 font-black">
          Review & Nationwide Transit
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
            {items.map((item) => {
              const unitPrice = item.bike.promo_price || item.bike.price;
              const lineTotal = unitPrice * item.quantity;
              return (
                <div key={item.bike.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.bike.images[0]}
                      alt={item.bike.model_name}
                      className="w-20 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div>
                      <Link
                        href={`/bikes/${item.bike.slug}`}
                        className="text-base font-black text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {item.bike.model_name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {item.bike.battery_type} • {item.bike.range_km} km range
                      </p>
                      <p className="text-xs font-black text-emerald-600 mt-1">
                        {formatGHS(unitPrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Quantity modifier */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.bike.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 font-mono font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.bike.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatGHS(lineTotal)}</p>
                      <button
                        onClick={() => removeItem(item.bike.id)}
                        className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 mt-0.5 ml-auto font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 px-2">
            <button onClick={clearCart} className="hover:text-red-600 underline">
              Clear entire cart
            </button>
            <Link href="/bikes" className="text-emerald-600 hover:underline font-bold">
              + Add another AIMIT model
            </Link>
          </div>
        </div>

        {/* Right: Hub Selector, Checkout Form & WhatsApp Checkout */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Hub Delivery Fee Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Select Nationwide Hub
            </h3>

            <div className="space-y-2">
              {DELIVERY_HUBS.map((hub) => (
                <label
                  key={hub.id}
                  className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedHub === hub.id
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="radio"
                      name="hub"
                      value={hub.id}
                      checked={selectedHub === hub.id}
                      onChange={() => setSelectedHub(hub.id)}
                      className="mt-1 accent-emerald-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{hub.name}</p>
                      <p className="text-[10px] text-slate-500">{hub.estimatedDays}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {hub.fee === 0 ? 'FREE' : formatGHS(hub.fee)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Pricing Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Order Cost Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} bikes):</span>
                <span className="font-bold text-slate-900">{formatGHS(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hub Delivery / Transit Fee ({currentHub.name.split('(')[0]}):</span>
                <span className="font-bold text-emerald-700">
                  {deliveryFee === 0 ? 'FREE' : formatGHS(deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700 text-xl font-mono">{formatGHS(grandTotal)}</span>
              </div>
            </div>

            {/* Direct 1-Click WhatsApp Checkout (Main Conversion) */}
            <div className="pt-3">
              <a
                href={whatsAppCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-[#25D366] hover:bg-[#1EBE5B] text-black font-extrabold text-xs sm:text-sm py-4 rounded-xl uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Checkout via WhatsApp (Recommended)
              </a>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Auto-generates exact order details ready to send to M.Sniff WhatsApp desk
              </p>
            </div>

            {/* Alternative: On-Site Order Form */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Or Place Order On-Site:
              </p>

              <form onSubmit={handlePlaceOrder} className="space-y-3">
                <div>
                  <label htmlFor="order-name" className="sr-only">Full Name</label>
                  <input
                    type="text"
                    id="order-name"
                    required
                    placeholder="Full Name (e.g. Kwame Mensah)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="order-phone" className="sr-only">Phone Number</label>
                  <input
                    type="tel"
                    id="order-phone"
                    required
                    placeholder="Phone Number (e.g. 0244123456)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="order-address" className="sr-only">Delivery Landmark</label>
                  <input
                    type="text"
                    id="order-address"
                    required
                    placeholder="Specific Delivery Landmark / Address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="order-payment" className="sr-only">Payment Method</label>
                  <select
                    id="order-payment"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Mobile Money (MTN / Telecel)">Mobile Money (MTN / Telecel)</option>
                    <option value="Pay on Hub Pickup">Pay on Hub Pickup (Cash / Card)</option>
                    <option value="Direct Bank Wire">Direct Bank Wire (Fidelity / Ecobank)</option>
                  </select>
                </div>

                <div className="flex items-start gap-2 mt-2">
                  <input type="checkbox" required id="order-consent" className="mt-1 accent-[#10B981]" />
                  <label htmlFor="order-consent" className="text-[11px] text-slate-600 leading-relaxed">
                    I agree to the <a href="/legal/terms" className="text-emerald-600 hover:underline">Terms & Conditions</a>, <a href="/legal/refund" className="text-emerald-600 hover:underline">Refund Policy</a>, and <a href="/legal/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {submittingOrder ? 'Placing Order...' : 'Submit Order to Hub & Get SMS'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
