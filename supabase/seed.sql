-- ==============================================================================
-- M.SNIFF BUSINESS HUB - AIMIT ELECTRIC BICYCLES SEED DATA
-- ==============================================================================

INSERT INTO bikes (
    slug, model_name, short_desc, full_desc, price, promo_price, 
    battery_type, range_km, max_speed_kmh, charge_time_hrs, motor_watts, 
    weight_kg, warranty_months, images, category, stock_qty, stock_status, featured
) VALUES
(
    'aimit-sahara-offroad-pro',
    'AIMIT Sahara Offroad Pro',
    'Rugged fat-tire electric mountain bike built to dominate northern terrain, unpaved savanna trails, and Accra potholes with dual suspension.',
    'Engineered specifically for the toughest Ghanaian roads and off-road tracks. Features 26x4.0-inch puncture-resistant puncture-proof fat tires, dual hydraulic disc brakes, high-torque 750W brushless motor, and a high-capacity 48V 17.5Ah LG lithium battery. Easily powers through mud, sand, rocky climbs, and heavy tropical downpours with IP65 water resistance.',
    14500.00,
    13200.00,
    '48V 17.5Ah LG Removable Lithium-Ion',
    95,
    50,
    5.5,
    750,
    28.5,
    12,
    ARRAY[
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop'
    ],
    'offroad',
    7,
    'in_stock',
    true
),
(
    'aimit-volt-commuter-x1',
    'AIMIT Volt Commuter X1',
    'Sleek, ultra-efficient urban e-bike designed for Accra traffic, student commutes, and dispatch riders seeking zero fuel costs.',
    'Say goodbye to trotro queues and skyrocketing fuel costs. The AIMIT Volt Commuter X1 features an aircraft-grade aluminum alloy frame, Shimano 7-speed transmission, integrated LED headlight and tail indicators, and a removable 48V 13Ah lithium battery that charges fully for less than GHS 2.00 on Ghana Grid electricity. Features phone charging USB port on the digital LCD dashboard.',
    9800.00,
    8950.00,
    '48V 13Ah Panasonic Removable Lithium-Ion',
    75,
    42,
    4.5,
    500,
    22.0,
    12,
    ARRAY[
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop'
    ],
    'city',
    12,
    'in_stock',
    true
),
(
    'aimit-cargo-hauler-max',
    'AIMIT Cargo Hauler Max 750',
    'Heavy-duty electric utility bicycle built for market traders, water carting, dispatch courier companies, and agro-produce transport.',
    'The workhorse of Ghanaian business. Fitted with reinforced front and rear steel cargo racks capable of carrying up to 180kg payload. Dual 48V battery slot capability (up to 120km range on dual pack), 750W high-torque motor, heavy-duty kickstand, and ultra-wide puncture-resistant tires. Cuts delivery overheads to practically zero.',
    16800.00,
    15500.00,
    '48V 20Ah Heavy-Duty High-Drain Lithium',
    115,
    45,
    6.0,
    750,
    33.0,
    12,
    ARRAY[
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop'
    ],
    'cargo',
    2,
    'low',
    true
),
(
    'aimit-savanna-step-thru',
    'AIMIT Savanna Step-Thru Cruiser',
    'Ergonomic low-step electric bicycle designed for effortless mounting, comfort commuting, and all-weather reliability in northern Ghana.',
    'A comfortable and accessible electric bike with step-through frame geometry. Features front suspension fork, memory foam ergonomic saddle, rear passenger rack, and full wrap fenders that protect your clothes from red mud and water puddles during rainy seasons.',
    11200.00,
    null,
    '48V 14Ah Smart BMS Lithium Battery',
    80,
    38,
    4.8,
    500,
    24.0,
    12,
    ARRAY[
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop'
    ],
    'city',
    5,
    'in_stock',
    false
),
(
    'aimit-stealth-apex-1000w',
    'AIMIT Stealth Apex 1000W Dual-Drive',
    'Extreme performance dual-motor offroad speed beast designed for steep hills, security patrols, and high-speed cross-district transit.',
    'Peak performance engineering with dual 500W motors (1000W total peak), climbing gradients up to 35 degrees effortlessly. Equipped with quad piston hydraulic brakes, motorcycle-grade high beam headlight, anti-theft GPS tracking dock, and dual smart BMS lithium pack delivering up to 120km range.',
    19500.00,
    18200.00,
    '52V 21Ah High-Capacity Lithium-Ion Dual Pack',
    120,
    58,
    6.5,
    1000,
    31.0,
    18,
    ARRAY[
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop'
    ],
    'offroad',
    0,
    'sold_out',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Initial Activity Log
INSERT INTO activity_logs (action, item_name, details) VALUES
('bike_created', 'AIMIT Inventory Seeded', 'Initial inventory batch loaded with Sahara Offroad, Volt Commuter, Cargo Hauler, Savanna, and Stealth Apex.');
