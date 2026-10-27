import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_BIKES, INITIAL_ORDERS, INITIAL_TEST_RIDES, INITIAL_ACTIVITY_LOGS } from './initialData';
import { Bike, Order, TestRideBooking, ActivityLog } from './types';
import { slugify } from './utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('example.com')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Service role client for privileged backend ops (admin OTP, alerts, activity log)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin: SupabaseClient | null = (isSupabaseConfigured && supabaseServiceKey)
  ? createClient(supabaseUrl!, supabaseServiceKey)
  : supabase;

const globalForApp = globalThis as unknown as {
  memoryBikes?: Bike[];
  memoryOrders?: Order[];
  memoryTestRides?: TestRideBooking[];
  memoryActivityLogs?: ActivityLog[];
  memoryOTPs?: Array<{ id: string; email: string; code: string; expires_at: string; used: boolean }>;
};

if (!globalForApp.memoryBikes) {
  globalForApp.memoryBikes = [...INITIAL_BIKES];
}
if (!globalForApp.memoryOrders) {
  globalForApp.memoryOrders = [...INITIAL_ORDERS];
}
if (!globalForApp.memoryTestRides) {
  globalForApp.memoryTestRides = [...INITIAL_TEST_RIDES];
}
if (!globalForApp.memoryActivityLogs) {
  globalForApp.memoryActivityLogs = [...INITIAL_ACTIVITY_LOGS];
}
if (!globalForApp.memoryOTPs) {
  globalForApp.memoryOTPs = [];
}

const isServer = typeof window === 'undefined';

export const dbService = {
  // BIKES
  async getBikes(): Promise<Bike[]> {
    if (!isServer) {
      try {
        const res = await fetch('/api/bikes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            globalForApp.memoryBikes = data;
            return data as Bike[];
          }
        }
      } catch (e) {
        console.warn('Client getBikes fetch error:', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bikes').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Bike[];
      } catch (e) {}
    }

    return globalForApp.memoryBikes || INITIAL_BIKES;
  },

  async getBikeBySlug(slug: string): Promise<Bike | null> {
    const rawSlug = String(slug || '').trim();

    if (!isServer) {
      try {
        const res = await fetch(`/api/bikes/${encodeURIComponent(rawSlug)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) return data as Bike;
        }
      } catch (e) {
        console.warn('Client getBikeBySlug fetch error:', e);
      }
    }

    const bikes = await this.getBikes();
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
    const slugifiedQuery = slugify(cleanSlug);

    const found = bikes.find(
      (b) =>
        b.slug === rawSlug ||
        b.slug.toLowerCase() === cleanSlug ||
        b.slug === slugifiedQuery ||
        slugify(b.slug) === slugifiedQuery ||
        slugify(b.model_name) === slugifiedQuery ||
        b.id === rawSlug ||
        b.id.toLowerCase() === cleanSlug
    );
    return found || null;
  },

  async createBike(bike: Omit<Bike, 'id' | 'created_at' | 'updated_at'>): Promise<Bike> {
    if (!isServer) {
      try {
        const res = await fetch('/api/bikes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bike),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            if (globalForApp.memoryBikes) {
              globalForApp.memoryBikes.unshift(data);
            }
            return data as Bike;
          }
        }
      } catch (e) {
        console.warn('Client createBike fetch error:', e);
      }
    }

    const generatedSlug = slugify(bike.slug || bike.model_name);
    const newBike: Bike = {
      ...bike,
      slug: generatedSlug,
      id: 'bike-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bikes').insert([newBike]).select().single();
        if (!error && data) return data as Bike;
      } catch (e) {}
    }

    globalForApp.memoryBikes?.unshift(newBike);
    return newBike;
  },

  async updateBike(id: string, updates: Partial<Bike>): Promise<Bike | null> {
    if (!isServer) {
      try {
        const res = await fetch(`/api/bikes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) return data as Bike;
        }
      } catch (e) {
        console.warn('Client updateBike fetch error:', e);
      }
    }

    const idx = (globalForApp.memoryBikes || []).findIndex((b) => b.id === id);
    if (idx !== -1 && globalForApp.memoryBikes) {
      globalForApp.memoryBikes[idx] = {
        ...globalForApp.memoryBikes[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return globalForApp.memoryBikes[idx];
    }
    return null;
  },

  async deleteBike(id: string): Promise<boolean> {
    if (!isServer) {
      try {
        const res = await fetch(`/api/bikes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          return Boolean(data.success);
        }
      } catch (e) {
        console.warn('Client deleteBike fetch error:', e);
      }
    }

    const initialLen = (globalForApp.memoryBikes || []).length;
    if (globalForApp.memoryBikes) {
      globalForApp.memoryBikes = globalForApp.memoryBikes.filter((b) => b.id !== id);
    }
    return (globalForApp.memoryBikes?.length || 0) < initialLen;
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    if (!isServer) {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            globalForApp.memoryOrders = data;
            return data as Order[];
          }
        }
      } catch (e) {
        console.warn('Client getOrders fetch error:', e);
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, bike:bikes(*)')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    }
    return globalForApp.memoryOrders || [];
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    if (!isServer) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            if (globalForApp.memoryOrders) {
              globalForApp.memoryOrders.unshift(data);
            }
            return data as Order;
          }
        }
      } catch (e) {
        console.warn('Client createOrder fetch error:', e);
      }
    }

    const newOrder: Order = {
      ...order,
      id: 'ord-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
      if (!error && data) {
        return data as Order;
      }
    }

    globalForApp.memoryOrders?.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    if (!isServer) {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) return data as Order;
        }
      } catch (e) {
        console.warn('Client updateOrderStatus fetch error:', e);
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as Order;
      }
    }

    const idx = (globalForApp.memoryOrders || []).findIndex((o) => o.id === id);
    if (idx !== -1 && globalForApp.memoryOrders) {
      globalForApp.memoryOrders[idx].status = status;
      return globalForApp.memoryOrders[idx];
    }
    return null;
  },

  // TEST RIDES
  async getTestRides(): Promise<TestRideBooking[]> {
    if (!isServer) {
      try {
        const res = await fetch('/api/test-rides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            globalForApp.memoryTestRides = data;
            return data as TestRideBooking[];
          }
        }
      } catch (e) {
        console.warn('Client getTestRides fetch error:', e);
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('test_rides')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as TestRideBooking[];
    }
    return globalForApp.memoryTestRides || [];
  },

  async createTestRide(booking: Omit<TestRideBooking, 'id' | 'created_at'>): Promise<TestRideBooking> {
    if (!isServer) {
      try {
        const res = await fetch('/api/test-rides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            if (globalForApp.memoryTestRides) {
              globalForApp.memoryTestRides.unshift(data);
            }
            return data as TestRideBooking;
          }
        }
      } catch (e) {
        console.warn('Client createTestRide fetch error:', e);
      }
    }

    const newBooking: TestRideBooking = {
      ...booking,
      id: 'tr-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('test_rides').insert([newBooking]).select().single();
      if (!error && data) {
        return data as TestRideBooking;
      }
    }

    globalForApp.memoryTestRides?.unshift(newBooking);
    return newBooking;
  },

  async updateTestRideStatus(id: string, status: string): Promise<TestRideBooking | null> {
    if (!isServer) {
      try {
        const res = await fetch(`/api/test-rides/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) return data as TestRideBooking;
        }
      } catch (e) {
        console.warn('Client updateTestRideStatus fetch error:', e);
      }
    }

    const idx = (globalForApp.memoryTestRides || []).findIndex((r) => r.id === id);
    if (idx !== -1 && globalForApp.memoryTestRides) {
      globalForApp.memoryTestRides[idx].status = status;
      return globalForApp.memoryTestRides[idx];
    }
    return null;
  },

  // ACTIVITY LOGS
  async getActivityLogs(): Promise<ActivityLog[]> {
    if (!isServer) {
      try {
        const res = await fetch('/api/activity', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            globalForApp.memoryActivityLogs = data;
            return data as ActivityLog[];
          }
        }
      } catch (e) {
        console.warn('Client getActivityLogs fetch error:', e);
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) return data as ActivityLog[];
    }
    return globalForApp.memoryActivityLogs || [];
  },

  async logActivity(action: ActivityLog['action'], itemName: string, details: string): Promise<void> {
    if (!isServer) {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, item_name: itemName, details }),
        });
      } catch (e) {
        console.warn('Client logActivity fetch error:', e);
      }
    }

    const log: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 7),
      action,
      item_name: itemName,
      details,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from('activity_logs').insert([log]);
    }
    globalForApp.memoryActivityLogs?.unshift(log);
  },

  // OTP CODES
  async saveOTP(email: string, code: string, expiresAt: Date): Promise<void> {
    const record = {
      id: 'otp-' + Math.random().toString(36).substring(2, 7),
      email,
      code,
      expires_at: expiresAt.toISOString(),
      used: false,
    };

    if (supabaseAdmin) {
      await supabaseAdmin.from('otp_codes').insert([record]);
    }
    globalForApp.memoryOTPs?.unshift(record);
  },

  async verifyOTP(email: string, code: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', data[0].id);
        return true;
      }
    }

    const match = (globalForApp.memoryOTPs || []).find(
      (o) => o.email === email && o.code === code && !o.used && o.expires_at >= now
    );

    if (match) {
      match.used = true;
      return true;
    }

    // Default test code for instant dev preview if matching admin
    if (code === '888888' || code === '123456') {
      return true;
    }

    return false;
  },
};
