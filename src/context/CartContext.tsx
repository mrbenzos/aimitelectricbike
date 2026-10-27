'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bike, CartItem, DeliveryHubId, DELIVERY_HUBS } from '@/lib/types';
import { createWhatsAppLink, formatGHS } from '@/lib/utils';

interface CartContextType {
  items: CartItem[];
  addItem: (bike: Bike, quantity?: number, hub?: DeliveryHubId) => void;
  removeItem: (bikeId: string) => void;
  updateQuantity: (bikeId: string, quantity: number) => void;
  selectedHub: DeliveryHubId;
  setSelectedHub: (hub: DeliveryHubId) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  generateWhatsAppOrderUrl: (customerName?: string, customerPhone?: string, address?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedHub, setSelectedHub] = useState<DeliveryHubId>('amasaman');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('msniff_cart');
      const savedHub = localStorage.getItem('msniff_hub') as DeliveryHubId;
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedHub && DELIVERY_HUBS.some(h => h.id === savedHub)) {
        setSelectedHub(savedHub);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('msniff_cart', JSON.stringify(items));
      localStorage.setItem('msniff_hub', selectedHub);
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items, selectedHub, isLoaded]);

  const addItem = (bike: Bike, quantity: number = 1, hub?: DeliveryHubId) => {
    if (hub) setSelectedHub(hub);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.bike.id === bike.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        // Check max stock if available
        if (bike.stock_qty > 0 && newQty > bike.stock_qty) {
          updated[existingIndex].quantity = bike.stock_qty;
        } else {
          updated[existingIndex].quantity = newQty;
        }
        return updated;
      } else {
        const safeQty = bike.stock_qty > 0 ? Math.min(quantity, bike.stock_qty) : quantity;
        return [...prevItems, { bike, quantity: safeQty, deliveryHub: hub || selectedHub }];
      }
    });
  };

  const removeItem = (bikeId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.bike.id !== bikeId));
  };

  const updateQuantity = (bikeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(bikeId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.bike.id === bikeId) {
          const maxStock = item.bike.stock_qty > 0 ? item.bike.stock_qty : 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const effectivePrice = item.bike.promo_price || item.bike.price;
    return acc + effectivePrice * item.quantity;
  }, 0);

  const currentHubInfo = DELIVERY_HUBS.find((h) => h.id === selectedHub) || DELIVERY_HUBS[0];
  const deliveryFee = items.length > 0 ? currentHubInfo.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  const generateWhatsAppOrderUrl = (customerName?: string, customerPhone?: string, address?: string) => {
    const hubName = currentHubInfo.name;
    const itemsList = items
      .map((item, idx) => {
        const unitPrice = item.bike.promo_price || item.bike.price;
        return `${idx + 1}. *${item.bike.model_name}* (Qty: ${item.quantity}) - ${formatGHS(unitPrice * item.quantity)}`;
      })
      .join('\n');

    let msg = `⚡ *NEW AIMIT ORDER - M.SNIFF BUSINESS HUB*\n\n`;
    if (customerName) msg += `👤 *Customer:* ${customerName}\n`;
    if (customerPhone) msg += `📞 *Phone:* ${customerPhone}\n`;
    if (address) msg += `📍 *Delivery Address:* ${address}\n`;
    msg += `🏢 *Selected Hub:* ${hubName}\n\n`;
    msg += `🚲 *Bikes Ordered:*\n${itemsList}\n\n`;
    msg += `💰 *Subtotal:* ${formatGHS(subtotal)}\n`;
    msg += `🚚 *Hub Transit Fee:* ${deliveryFee === 0 ? 'FREE (Amasaman HQ Pickup/Delivery)' : formatGHS(deliveryFee)}\n`;
    msg += `🔥 *Total Payable:* ${formatGHS(grandTotal)}\n\n`;
    msg += `Please confirm my order and send payment/delivery instructions. Thank you!`;

    return createWhatsAppLink(msg);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        selectedHub,
        setSelectedHub,
        clearCart,
        totalItemsCount,
        subtotal,
        deliveryFee,
        grandTotal,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
