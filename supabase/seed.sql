-- =============================================================
-- Ocean Bridge — Seed Data
-- Run after migrations: npx supabase db reset
-- Or paste into Supabase SQL Editor
-- Password for ALL seed users: Ocean2026!
-- =============================================================

-- =============================================================
-- 1. AUTH USERS
-- The trigger handle_new_auth_user() auto-inserts into
-- users or companies tables based on raw_user_meta_data->>'type'
-- =============================================================

DO $$
DECLARE
  uid_admin      uuid := gen_random_uuid();
  uid_sarah      uuid := gen_random_uuid();
  uid_ahmed      uuid := gen_random_uuid();
  uid_marco      uuid := gen_random_uuid();
  uid_nile       uuid := gen_random_uuid();
  uid_gulf       uuid := gen_random_uuid();
  uid_med        uuid := gen_random_uuid();
  uid_delta      uuid := gen_random_uuid();
  uid_alpha      uuid := gen_random_uuid();

  plan_dubai_alex_ship uuid;
  plan_dubai_alex_truck uuid;
  plan_jeddah_piraeus   uuid;
  plan_aqaba_valencia   uuid;
  plan_cairo_istanbul   uuid;
  plan_casa_rotterdam   uuid;

  trip_1  uuid;
  trip_2  uuid;
  trip_3  uuid;
  trip_4  uuid;
  trip_5  uuid;
  trip_6  uuid;
  trip_7  uuid;

  bk_1  uuid;
  bk_2  uuid;
  bk_3  uuid;
  bk_4  uuid;
  bk_5  uuid;
  bk_6  uuid;
  bk_7  uuid;
  bk_8  uuid;
  bk_9  uuid;
  bk_10 uuid;
  bk_11 uuid;
  bk_12 uuid;

  inv_1  uuid;
  inv_3  uuid;
  inv_5  uuid;
  inv_6  uuid;
  inv_7  uuid;
  inv_8  uuid;
  inv_9  uuid;
  inv_10 uuid;
  inv_11 uuid;

BEGIN

-- ─────────────────────────────────────────────────────────────
-- Auth Users
-- ─────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, role, aud
) VALUES
  -- Admin
  (uid_admin, '00000000-0000-0000-0000-000000000000',
   'admin@oceanbridge.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"admin","role":"admin","full_name":"Ocean Bridge Admin"}'::jsonb,
   'authenticated', 'authenticated'),

  -- Staff
  (uid_sarah, '00000000-0000-0000-0000-000000000000',
   'sarah.ops@oceanbridge.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"staff","role":"staff","full_name":"Sarah Ops","phone":"+971501111111"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_ahmed, '00000000-0000-0000-0000-000000000000',
   'ahmed.log@oceanbridge.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"staff","role":"staff","full_name":"Ahmed Logistics","phone":"+971502222222"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_marco, '00000000-0000-0000-0000-000000000000',
   'marco.log@oceanbridge.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"staff","role":"staff","full_name":"Marco Logistics","phone":"+39021111111"}'::jsonb,
   'authenticated', 'authenticated'),

  -- Companies
  (uid_nile, '00000000-0000-0000-0000-000000000000',
   'info@nilefreight.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"company","company_name":"Nile Freight LLC","contact_name":"Khaled Hassan","phone":"+201001234567"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_gulf, '00000000-0000-0000-0000-000000000000',
   'shipping@gulfcargo.ae',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"company","company_name":"Gulf Cargo AE","contact_name":"Rania Al-Farsi","phone":"+97150234567"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_med, '00000000-0000-0000-0000-000000000000',
   'ops@medtrans.eu',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"company","company_name":"MedTrans EU","contact_name":"Elena Papadopoulos","phone":"+306912345678"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_delta, '00000000-0000-0000-0000-000000000000',
   'logistics@deltacorp.eg',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"company","company_name":"Delta Corp Egypt","contact_name":"Omar Farouk","phone":"+201234567890"}'::jsonb,
   'authenticated', 'authenticated'),

  (uid_alpha, '00000000-0000-0000-0000-000000000000',
   'freight@alphaship.com',
   crypt('Ocean2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"type":"company","company_name":"Alpha Shipping Co.","contact_name":"James O''Brien","phone":"+353861234567"}'::jsonb,
   'authenticated', 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 2. PRICING PLANS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.pricing_plans (id, from_location, to_location, transport_type, base_price, per_kg_rate, is_active)
VALUES
  (gen_random_uuid(), 'Dubai', 'Alexandria', 'ship',     800,  2.50, true),
  (gen_random_uuid(), 'Dubai', 'Alexandria', 'truck',    600,  1.80, true),
  (gen_random_uuid(), 'Jeddah', 'Piraeus',   'ship',    1200,  3.00, true),
  (gen_random_uuid(), 'Aqaba', 'Valencia',   'ship',    1500,  3.50, true),
  (gen_random_uuid(), 'Cairo', 'Istanbul',   'airplane',2000,  5.00, true),
  (gen_random_uuid(), 'Casablanca', 'Rotterdam', 'ship',1800,  4.00, true);

-- Capture plan IDs for trips
SELECT id INTO plan_dubai_alex_ship  FROM public.pricing_plans WHERE from_location='Dubai'      AND to_location='Alexandria' AND transport_type='ship';
SELECT id INTO plan_dubai_alex_truck FROM public.pricing_plans WHERE from_location='Dubai'      AND to_location='Alexandria' AND transport_type='truck';
SELECT id INTO plan_jeddah_piraeus   FROM public.pricing_plans WHERE from_location='Jeddah'     AND to_location='Piraeus';
SELECT id INTO plan_aqaba_valencia   FROM public.pricing_plans WHERE from_location='Aqaba'      AND to_location='Valencia';
SELECT id INTO plan_cairo_istanbul   FROM public.pricing_plans WHERE from_location='Cairo'      AND to_location='Istanbul';
SELECT id INTO plan_casa_rotterdam   FROM public.pricing_plans WHERE from_location='Casablanca' AND to_location='Rotterdam';

-- ─────────────────────────────────────────────────────────────
-- 3. TRIPS (created_by = admin user)
-- ─────────────────────────────────────────────────────────────

-- Trip 1: Dubai→Alexandria ship, open, future
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_dubai_alex_ship, 'Dubai', 'Alexandria', 'ship', 800, 2.50, CURRENT_DATE + 15, CURRENT_DATE + 22, 40, 'open', uid_admin)
RETURNING id INTO trip_1;

-- Trip 2: Dubai→Alexandria truck, open, soon
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_dubai_alex_truck, 'Dubai', 'Alexandria', 'truck', 600, 1.80, CURRENT_DATE + 8, CURRENT_DATE + 12, 20, 'open', uid_admin)
RETURNING id INTO trip_2;

-- Trip 3: Jeddah→Piraeus ship, open
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_jeddah_piraeus, 'Jeddah', 'Piraeus', 'ship', 1200, 3.00, CURRENT_DATE + 20, CURRENT_DATE + 30, 60, 'open', uid_admin)
RETURNING id INTO trip_3;

-- Trip 4: Aqaba→Valencia ship, full
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_aqaba_valencia, 'Aqaba', 'Valencia', 'ship', 1500, 3.50, CURRENT_DATE + 5, CURRENT_DATE + 18, 35, 'full', uid_admin)
RETURNING id INTO trip_4;

-- Trip 5: Cairo→Istanbul airplane, full
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_cairo_istanbul, 'Cairo', 'Istanbul', 'airplane', 2000, 5.00, CURRENT_DATE + 3, CURRENT_DATE + 4, 10, 'full', uid_admin)
RETURNING id INTO trip_5;

-- Trip 6: Casablanca→Rotterdam ship, in transit
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_casa_rotterdam, 'Casablanca', 'Rotterdam', 'ship', 1800, 4.00, CURRENT_DATE - 5, CURRENT_DATE + 8, 50, 'out_for_delivery', uid_admin)
RETURNING id INTO trip_6;

-- Trip 7: Dubai→Alexandria ship, past delivered
INSERT INTO public.trips (id, pricing_plan_id, from_location, to_location, transport_type, base_price, per_kg_rate, departure_date, arrival_date, max_containers, status, created_by)
VALUES (gen_random_uuid(), plan_dubai_alex_ship, 'Dubai', 'Alexandria', 'ship', 800, 2.50, CURRENT_DATE - 30, CURRENT_DATE - 22, 40, 'delivered', uid_admin)
RETURNING id INTO trip_7;

-- ─────────────────────────────────────────────────────────────
-- 4. BOOKINGS + CONTAINERS + STATUS HISTORY
-- ─────────────────────────────────────────────────────────────

-- Booking 1: Nile Freight on Trip 1 — approved, 3 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_1, uid_nile, 'approved', 3500, 9550.00, 'Standard delivery')
RETURNING id INTO bk_1;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_1, 1200, 'Textiles'),
  (bk_1, 800,  'Clothing'),
  (bk_1, 1500, 'Furniture');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_1, NULL,      'pending',  'Booking created'),
  (bk_1, uid_sarah, 'approved', 'Approved by operations team');

-- Booking 2: Gulf Cargo on Trip 1 — pending, 2 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_1, uid_gulf, 'pending', 3800, 10300.00, NULL)
RETURNING id INTO bk_2;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_2, 2000, 'Electronics'),
  (bk_2, 1800, 'Machinery parts');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_2, NULL, 'pending', 'Booking created');

-- Booking 3: MedTrans on Trip 2 — approved, 4 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_2, uid_med, 'approved', 2200, 4560.00, 'Fragile items')
RETURNING id INTO bk_3;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_3, 500, 'Ceramics'),
  (bk_3, 600, 'Glassware'),
  (bk_3, 700, 'Lab equipment'),
  (bk_3, 400, 'Medical supplies');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_3, NULL,      'pending',  'Booking created'),
  (bk_3, uid_ahmed, 'approved', 'Verified and approved');

-- Booking 4: Delta Corp on Trip 3 — pending, 1 container
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_3, uid_delta, 'pending', 5000, 16200.00, 'Heavy industrial equipment')
RETURNING id INTO bk_4;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_4, 5000, 'Industrial machinery');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_4, NULL, 'pending', 'Booking created');

-- Booking 5: Alpha Shipping on Trip 3 — approved, 2 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_3, uid_alpha, 'approved', 5500, 17700.00, NULL)
RETURNING id INTO bk_5;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_5, 3000, 'Steel beams'),
  (bk_5, 2500, 'Construction materials');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_5, NULL,      'pending',  'Booking created'),
  (bk_5, uid_sarah, 'approved', 'Approved');

-- Booking 6: Nile Freight on Trip 4 (full) — approved, 5 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_4, uid_nile, 'approved', 5000, 19000.00, 'Priority cargo')
RETURNING id INTO bk_6;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_6, 1000, 'Consumer goods'),
  (bk_6, 1000, 'Packaged food'),
  (bk_6, 1000, 'Beverages'),
  (bk_6, 1000, 'Clothing'),
  (bk_6, 1000, 'Accessories');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_6, NULL,      'pending',  'Booking created'),
  (bk_6, uid_ahmed, 'approved', 'Approved');

-- Booking 7: Gulf Cargo on Trip 4 (full) — approved, 6 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_4, uid_gulf, 'approved', 4800, 18300.00, NULL)
RETURNING id INTO bk_7;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_7, 800, 'Auto parts'),
  (bk_7, 800, 'Tires'),
  (bk_7, 800, 'Spare parts'),
  (bk_7, 800, 'Tools'),
  (bk_7, 800, 'Hardware'),
  (bk_7, 800, 'Equipment');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_7, NULL,      'pending',  'Booking created'),
  (bk_7, uid_marco, 'approved', 'Approved');

-- Booking 8: MedTrans on Trip 5 (Cairo→Istanbul airplane, full) — approved, 2 containers
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_5, uid_med, 'approved', 550, 4750.00, 'Urgent pharmaceutical shipment')
RETURNING id INTO bk_8;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_8, 300, 'Pharmaceuticals'),
  (bk_8, 250, 'Medical devices');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_8, NULL,      'pending',  'Booking created'),
  (bk_8, uid_sarah, 'approved', 'Expedited approval');

-- Booking 9: Nile Freight on Trip 6 (in transit) — out_for_delivery
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_6, uid_nile, 'out_for_delivery', 5300, 23000.00, NULL)
RETURNING id INTO bk_9;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_9, 2000, 'Agricultural produce'),
  (bk_9, 1500, 'Preserved foods'),
  (bk_9, 1800, 'Spices and herbs');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_9, NULL,      'pending',          'Booking created'),
  (bk_9, uid_ahmed, 'approved',         'Approved'),
  (bk_9, NULL,      'out_for_delivery', 'Shipment departed Casablanca port');

-- Booking 10: Delta Corp on Trip 6 (in transit) — out_for_delivery
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_6, uid_delta, 'out_for_delivery', 4800, 21000.00, 'Mining equipment')
RETURNING id INTO bk_10;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_10, 1200, 'Drilling equipment'),
  (bk_10, 1200, 'Safety gear'),
  (bk_10, 1200, 'Mining tools'),
  (bk_10, 1200, 'Spare parts');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_10, NULL,      'pending',          'Booking created'),
  (bk_10, uid_marco, 'approved',         'Approved'),
  (bk_10, NULL,      'out_for_delivery', 'Shipment departed Casablanca port');

-- Booking 11: Alpha Shipping on Trip 7 (past delivered) — delivered
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes)
VALUES (gen_random_uuid(), trip_7, uid_alpha, 'delivered', 5000, 13300.00, NULL)
RETURNING id INTO bk_11;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_11, 3000, 'Retail merchandise'),
  (bk_11, 2000, 'Seasonal goods');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_11, NULL,      'pending',          'Booking created'),
  (bk_11, uid_sarah, 'approved',         'Approved'),
  (bk_11, NULL,      'out_for_delivery', 'Shipment departed Dubai port'),
  (bk_11, NULL,      'delivered',        'Successfully delivered to Alexandria');

-- Booking 12: Gulf Cargo on Trip 7 (past trip) — cancelled
INSERT INTO public.bookings (id, trip_id, company_id, status, total_weight_kg, total_price, notes, cancelled_at, cancel_reason)
VALUES (gen_random_uuid(), trip_7, uid_gulf, 'cancelled', 1000, 3300.00, NULL, CURRENT_DATE - 32, 'Shipment postponed by client')
RETURNING id INTO bk_12;

INSERT INTO public.containers (booking_id, weight_kg, description) VALUES
  (bk_12, 1000, 'General cargo');

INSERT INTO public.booking_status_history (booking_id, updated_by, status, notes) VALUES
  (bk_12, NULL, 'pending',   'Booking created'),
  (bk_12, NULL, 'cancelled', 'Shipment postponed by client');

-- ─────────────────────────────────────────────────────────────
-- 5. INVOICES
-- No invoice for: bk_2 (pending), bk_4 (pending), bk_12 (cancelled)
-- ─────────────────────────────────────────────────────────────

-- Booking 1 — unpaid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at)
VALUES (gen_random_uuid(), bk_1, uid_nile, 9550.00, 'unpaid', now() - interval '2 days')
RETURNING id INTO inv_1;

-- Booking 3 — paid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at, paid_at)
VALUES (gen_random_uuid(), bk_3, uid_med, 4560.00, 'paid', now() - interval '5 days', now() - interval '3 days')
RETURNING id INTO inv_3;

-- Booking 5 — unpaid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at)
VALUES (gen_random_uuid(), bk_5, uid_alpha, 17700.00, 'unpaid', now() - interval '3 days')
RETURNING id INTO inv_5;

-- Booking 6 — paid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at, paid_at)
VALUES (gen_random_uuid(), bk_6, uid_nile, 19000.00, 'paid', now() - interval '4 days', now() - interval '1 day')
RETURNING id INTO inv_6;

-- Booking 7 — unpaid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at)
VALUES (gen_random_uuid(), bk_7, uid_gulf, 18300.00, 'unpaid', now() - interval '4 days')
RETURNING id INTO inv_7;

-- Booking 8 — paid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at, paid_at)
VALUES (gen_random_uuid(), bk_8, uid_med, 4750.00, 'paid', now() - interval '4 days', now() - interval '2 days')
RETURNING id INTO inv_8;

-- Booking 9 — unpaid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at)
VALUES (gen_random_uuid(), bk_9, uid_nile, 23000.00, 'unpaid', now() - interval '6 days')
RETURNING id INTO inv_9;

-- Booking 10 — unpaid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at)
VALUES (gen_random_uuid(), bk_10, uid_delta, 21000.00, 'unpaid', now() - interval '6 days')
RETURNING id INTO inv_10;

-- Booking 11 — paid
INSERT INTO public.invoices (id, booking_id, company_id, total_price, status, issued_at, paid_at)
VALUES (gen_random_uuid(), bk_11, uid_alpha, 13300.00, 'paid', now() - interval '25 days', now() - interval '15 days')
RETURNING id INTO inv_11;

END $$;
