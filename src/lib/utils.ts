import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('GHS', 'GHS ');
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function calculateInstallment(totalPrice: number, downPaymentPercent: number = 40) {
  const downPayment = Math.round((totalPrice * downPaymentPercent) / 100);
  const remaining = totalPrice - downPayment;
  const monthlyOver3Months = Math.round(remaining / 3);
  return {
    downPayment,
    remaining,
    monthlyOver3Months,
  };
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233242365706'; // Official AIMIT E-BIKES / M.Sniff WhatsApp
export const OWNER_PHONE = process.env.OWNER_PHONE || '233242365706';

export function createWhatsAppLink(message: string, phone: string = WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
