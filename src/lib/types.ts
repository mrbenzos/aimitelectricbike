export type BikeCategory = 'city' | 'offroad' | 'cargo';
export type StockStatus = 'in_stock' | 'low' | 'sold_out';

export interface Bike {
  id: string;
  slug: string;
  model_name: string;
  short_desc: string;
  full_desc: string;
  price: number;
  promo_price?: number | null;
  battery_type: string;
  range_km: number;
  max_speed_kmh: number;
  charge_time_hrs: number;
  motor_watts: number;
  weight_kg: number;
  warranty_months: number;
  images: string[];
  video_url?: string;
  video_thumbnail?: string;
  video_title?: string;
  video_duration?: string;
  terrain_rating?: {
    pothole_score: number; // out of 10
    hill_climb: string;
    water_rating: string;
  };
  category: BikeCategory;
  stock_qty: number;
  stock_status: StockStatus;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DeliveryHubId = 'amasaman' | 'tamale' | 'bolga' | 'bawku' | 'other';

export interface DeliveryHubInfo {
  id: DeliveryHubId;
  name: string;
  region: string;
  address: string;
  fee: number; // in GHS
  estimatedDays: string;
  phone: string;
  manager: string;
  isHQ?: boolean;
}

export const DELIVERY_HUBS: DeliveryHubInfo[] = [
  {
    id: 'amasaman',
    name: 'Amasaman Hub (National HQ)',
    region: 'Greater Accra',
    address: 'M.Sniff Complex, Near Amasaman Stadium / High Court Road',
    fee: 0,
    estimatedDays: 'Same-Day / Next-Day Pickup or Delivery',
    phone: '+233 24 236 5706',
    manager: 'Alhaji Mustapha Sniff',
    isHQ: true,
  },
  {
    id: 'tamale',
    name: 'Tamale Regional Hub',
    region: 'Northern Region',
    address: 'Opposite Tamale Sports Stadium, Aboabo Commercial Area',
    fee: 250,
    estimatedDays: '2 - 3 Days Transit Delivery',
    phone: '+233 20 888 3412',
    manager: 'Ibrahim Salifu',
  },
  {
    id: 'bolga',
    name: 'Bolgatanga Hub',
    region: 'Upper East Region',
    address: 'Bolga Central Commercial Street, Near Total Filling Station',
    fee: 300,
    estimatedDays: '3 - 4 Days Transit Delivery',
    phone: '+233 54 990 1234',
    manager: 'Peter Awinbila',
  },
  {
    id: 'bawku',
    name: 'Bawku Hub',
    region: 'Upper East Region',
    address: 'Bawku Main Station Commercial Road',
    fee: 350,
    estimatedDays: '3 - 5 Days Transit Delivery',
    phone: '+233 24 771 9081',
    manager: 'Haruna Yakubu',
  },
  {
    id: 'other',
    name: 'Other Ghana Regions (VIP / Courier Partner)',
    region: 'Kumasi, Takoradi, Sunyani, Ho, Cape Coast, etc.',
    address: 'Doorstep Courier Delivery / Designated Parcel Terminal',
    fee: 380,
    estimatedDays: '3 - 4 Days Courier Dispatch',
    phone: '+233 24 236 5706',
    manager: 'M.Sniff Nationwide Logistics Desk',
  },
];

export interface CartItem {
  bike: Bike;
  quantity: number;
  deliveryHub: DeliveryHubId;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  delivery_hub: string;
  bike_id: string;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  payment_type: string;
  created_at: string;
  bike?: Bike;
}

export interface TestRideBooking {
  id: string;
  name: string;
  phone: string;
  preferred_hub: string;
  preferred_date: string;
  bike_interest?: string;
  status: string;
  created_at: string;
}

export type ActivityAction = 
  | 'sold'
  | 'stock_low'
  | 'deleted'
  | 'price_changed'
  | 'new_order'
  | 'new_test_ride'
  | 'test_ride'
  | 'restocked'
  | 'bike_created';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  item_name: string;
  details: string;
  created_at: string;
}
