/**
 * ocean_bridge — Database Seed Script
 *
 * Creates realistic test data across all 8 tables.
 * ⚠️  WIPES ALL EXISTING DATA before seeding.
 *     Run only against a development / staging database.
 *
 * Usage:
 *   npm run seed
 *
 * Test accounts (password: Ocean1234!):
 *   Admin  → omar.bennani@ocean.seed
 *   Staff  → youssef.elamrani@ocean.seed
 *   Staff  → fatima.idrissi@ocean.seed
 *   Co 1   → ops@atlasfreight.ocean.seed
 *   Co 2   → contact@medtrans.ocean.seed
 *   Co 3   → info@euroship.ocean.seed
 *   Co 4   → logistics@iberiancargo.ocean.seed
 *   Co 5   → freight@nordicsea.ocean.seed
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Helpers ────────────────────────────────────────────────────────────────

function ok<T>(result: { data: T; error: unknown }, label: string): T {
  if (result.error) {
    console.error(`✗ ${label}:`, result.error)
    process.exit(1)
  }
  return result.data
}

/** total_price = base_price + total_weight_kg × per_kg_rate  (server-side only) */
function calcPrice(base: number, rate: number, weightKg: number) {
  return Math.round((base + weightKg * rate) * 100) / 100
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  ocean_bridge — seeding database\n')

  // ── 1. WIPE ────────────────────────────────────────────────────────────────
  console.log('Wiping existing data…')

  const tables = [
    'invoices',
    'booking_status_history',
    'containers',
    'bookings',
    'trips',
    'pricing_plans',
  ] as const

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null)
    if (error) { console.error(`✗ wipe ${table}:`, error); process.exit(1) }
  }

  // Delete seed auth users — cascade removes their users / companies rows
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const seedUsers = authUsers.filter(u => u.email?.endsWith('@ocean.seed'))
  await Promise.all(seedUsers.map(u => supabase.auth.admin.deleteUser(u.id)))

  console.log('✓ Wiped\n')

  // ── 2. AUTH USERS ──────────────────────────────────────────────────────────
  // The trigger handle_new_auth_user fires on insert and populates
  // public.users (admin/staff) or public.companies (company) automatically.
  console.log('Creating auth users…')

  async function createUser(email: string, meta: Record<string, string>) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: 'Ocean1234!',
      email_confirm: true,
      user_metadata: meta,
    })
    if (error) { console.error(`✗ createUser ${email}:`, error); process.exit(1) }
    return data.user!.id
  }

  const adminId  = await createUser('omar.bennani@ocean.seed',             { type: 'admin', role: 'admin', full_name: 'Omar Bennani',         phone: '+212 661-234-567' })
  const staff1Id = await createUser('youssef.elamrani@ocean.seed',         { type: 'staff', role: 'staff', full_name: 'Youssef El Amrani',     phone: '+212 662-345-678' })
  const staff2Id = await createUser('fatima.idrissi@ocean.seed',           { type: 'staff', role: 'staff', full_name: 'Fatima Zahra Idrissi',  phone: '+212 663-456-789' })
  const co1Id    = await createUser('ops@atlasfreight.ocean.seed',          { type: 'company', company_name: 'Atlas Freight Solutions',  contact_name: 'Rachid Ouali',    phone: '+212 522-789-012' })
  const co2Id    = await createUser('contact@medtrans.ocean.seed',          { type: 'company', company_name: 'MedTrans SARL',            contact_name: 'Amir Belkacem',   phone: '+213 21-456-789'  })
  const co3Id    = await createUser('info@euroship.ocean.seed',             { type: 'company', company_name: 'EuroShip Import/Export',   contact_name: 'Claire Fontaine', phone: '+33 1-44-56-7890' })
  const co4Id    = await createUser('logistics@iberiancargo.ocean.seed',    { type: 'company', company_name: 'Iberian Cargo Group',      contact_name: 'Diego Sánchez',   phone: '+34 93-567-8901'  })
  const co5Id    = await createUser('freight@nordicsea.ocean.seed',         { type: 'company', company_name: 'Nordic Sea Logistics',     contact_name: 'Lars Eriksson',   phone: '+31 20-567-8901'  })

  console.log('✓ Auth users created (trigger populated users / companies tables)\n')

  // ── 3. PRICING PLANS ───────────────────────────────────────────────────────
  console.log('Creating pricing plans…')

  const plans = ok(
    await supabase.from('pricing_plans').insert([
      // Active routes
      { from_location: 'Casablanca', to_location: 'Marseille',  transport_type: 'ship',  base_price: 1200, per_kg_rate: 0.80, is_active: true  },
      { from_location: 'Casablanca', to_location: 'Barcelona',  transport_type: 'ship',  base_price: 1050, per_kg_rate: 0.75, is_active: true  },
      { from_location: 'Casablanca', to_location: 'Rotterdam',  transport_type: 'ship',  base_price: 1850, per_kg_rate: 1.10, is_active: true  },
      { from_location: 'Algiers',    to_location: 'Marseille',  transport_type: 'ship',  base_price: 880,  per_kg_rate: 0.70, is_active: true  },
      { from_location: 'Tunis',      to_location: 'Hamburg',    transport_type: 'ship',  base_price: 2100, per_kg_rate: 1.25, is_active: true  },
      // Discontinued route (kept for historical trips)
      { from_location: 'Casablanca', to_location: 'Marseille',  transport_type: 'truck', base_price: 550,  per_kg_rate: 1.60, is_active: false },
    ]).select(),
    'pricing_plans'
  )!

  const [planCasaMar, planCasaBar, planCasaRot, planAlgMar, planTunHam] = plans
  console.log(`✓ ${plans.length} pricing plans created\n`)

  // ── 4. TRIPS ───────────────────────────────────────────────────────────────
  // Trips snapshot the pricing plan values at creation time.
  // Statuses are intentionally varied for a realistic dashboard view.
  console.log('Creating trips…')

  const trips = ok(
    await supabase.from('trips').insert([
      // ── DELIVERED (past) ──
      {
        pricing_plan_id: planCasaMar.id,
        from_location: 'Casablanca', to_location: 'Marseille', transport_type: 'ship',
        base_price: 1200, per_kg_rate: 0.80,
        departure_date: '2026-01-10', arrival_date: '2026-01-22',
        max_containers: 12, status: 'delivered', created_by: adminId,
      },
      {
        pricing_plan_id: planAlgMar.id,
        from_location: 'Algiers', to_location: 'Marseille', transport_type: 'ship',
        base_price: 880, per_kg_rate: 0.70,
        departure_date: '2026-02-05', arrival_date: '2026-02-15',
        max_containers: 10, status: 'delivered', created_by: staff1Id,
      },
      // ── OUT FOR DELIVERY (in transit) ──
      {
        pricing_plan_id: planCasaMar.id,
        from_location: 'Casablanca', to_location: 'Marseille', transport_type: 'ship',
        base_price: 1200, per_kg_rate: 0.80,
        departure_date: '2026-03-30', arrival_date: '2026-04-15',
        max_containers: 12, status: 'out_for_delivery', created_by: adminId,
      },
      {
        pricing_plan_id: planCasaRot.id,
        from_location: 'Casablanca', to_location: 'Rotterdam', transport_type: 'ship',
        base_price: 1850, per_kg_rate: 1.10,
        departure_date: '2026-04-05', arrival_date: '2026-04-22',
        max_containers: 8, status: 'out_for_delivery', created_by: staff2Id,
      },
      // ── OPEN (upcoming, accepting bookings) ──
      {
        pricing_plan_id: planCasaBar.id,
        from_location: 'Casablanca', to_location: 'Barcelona', transport_type: 'ship',
        base_price: 1050, per_kg_rate: 0.75,
        departure_date: '2026-04-20', arrival_date: '2026-05-03',
        max_containers: 10, status: 'open', created_by: adminId,
      },
      {
        pricing_plan_id: planTunHam.id,
        from_location: 'Tunis', to_location: 'Hamburg', transport_type: 'ship',
        base_price: 2100, per_kg_rate: 1.25,
        departure_date: '2026-04-25', arrival_date: '2026-05-10',
        max_containers: 8, status: 'open', created_by: staff1Id,
      },
      {
        pricing_plan_id: planCasaMar.id,
        from_location: 'Casablanca', to_location: 'Marseille', transport_type: 'ship',
        base_price: 1200, per_kg_rate: 0.80,
        departure_date: '2026-05-15', arrival_date: '2026-05-26',
        max_containers: 12, status: 'open', created_by: adminId,
      },
      {
        pricing_plan_id: planAlgMar.id,
        from_location: 'Algiers', to_location: 'Marseille', transport_type: 'ship',
        base_price: 880, per_kg_rate: 0.70,
        departure_date: '2026-05-20', arrival_date: '2026-06-01',
        max_containers: 10, status: 'open', created_by: staff2Id,
      },
    ]).select(),
    'trips'
  )!

  const [
    tDel1, tDel2,           // delivered
    tTrans1, tTrans2,       // out_for_delivery
    tOpen1, tOpen2, tOpen3, tOpen4, // open
  ] = trips

  console.log(`✓ ${trips.length} trips created\n`)

  // ── 5. BOOKINGS ────────────────────────────────────────────────────────────
  // total_price is always computed server-side: base_price + total_weight_kg × per_kg_rate
  // total_weight_kg must match the sum of the booking's containers (enforced by app logic)
  console.log('Creating bookings…')

  const bookings = ok(
    await supabase.from('bookings').insert([

      // ── Trip 1: Casablanca → Marseille (delivered Jan 22) ──────────────────
      {
        trip_id: tDel1.id, company_id: co1Id, status: 'delivered',
        total_weight_kg: 2370, total_price: calcPrice(1200, 0.80, 2370),
        notes: 'Priority consolidation for Q1 stock replenishment',
        created_at: '2026-01-03T09:15:00Z', updated_at: '2026-01-22T14:00:00Z',
      },
      {
        trip_id: tDel1.id, company_id: co2Id, status: 'delivered',
        total_weight_kg: 1850, total_price: calcPrice(1200, 0.80, 1850),
        notes: null,
        created_at: '2026-01-04T11:30:00Z', updated_at: '2026-01-22T14:00:00Z',
      },
      {
        trip_id: tDel1.id, company_id: co4Id, status: 'cancelled',
        total_weight_kg: 500, total_price: calcPrice(1200, 0.80, 500),
        notes: null,
        cancelled_at: '2026-01-08T16:00:00Z',
        cancel_reason: 'Client postponed shipment to next cycle — internal hold on customs docs',
        created_at: '2026-01-05T08:45:00Z', updated_at: '2026-01-08T16:00:00Z',
      },

      // ── Trip 2: Algiers → Marseille (delivered Feb 15) ────────────────────
      {
        trip_id: tDel2.id, company_id: co3Id, status: 'delivered',
        total_weight_kg: 1430, total_price: calcPrice(880, 0.70, 1430),
        notes: 'Fragile lab equipment — handle with care, no stacking',
        created_at: '2026-01-28T10:00:00Z', updated_at: '2026-02-15T11:00:00Z',
      },
      {
        trip_id: tDel2.id, company_id: co1Id, status: 'delivered',
        total_weight_kg: 920, total_price: calcPrice(880, 0.70, 920),
        notes: null,
        created_at: '2026-01-29T14:20:00Z', updated_at: '2026-02-15T11:00:00Z',
      },

      // ── Trip 3: Casablanca → Marseille (in transit, arrives Apr 15) ───────
      {
        trip_id: tTrans1.id, company_id: co2Id, status: 'out_for_delivery',
        total_weight_kg: 2000, total_price: calcPrice(1200, 0.80, 2000),
        notes: 'Spring season goods — time-sensitive delivery',
        created_at: '2026-03-18T09:00:00Z', updated_at: '2026-03-30T06:00:00Z',
      },
      {
        trip_id: tTrans1.id, company_id: co5Id, status: 'out_for_delivery',
        total_weight_kg: 2170, total_price: calcPrice(1200, 0.80, 2170),
        notes: null,
        created_at: '2026-03-20T13:45:00Z', updated_at: '2026-03-30T06:00:00Z',
      },

      // ── Trip 4: Casablanca → Rotterdam (in transit, arrives Apr 22) ───────
      {
        trip_id: tTrans2.id, company_id: co1Id, status: 'out_for_delivery',
        total_weight_kg: 2400, total_price: calcPrice(1850, 1.10, 2400),
        notes: 'Industrial parts — customs pre-cleared at Port Tanger Med',
        created_at: '2026-03-25T08:30:00Z', updated_at: '2026-04-05T05:00:00Z',
      },
      {
        trip_id: tTrans2.id, company_id: co4Id, status: 'out_for_delivery',
        total_weight_kg: 1100, total_price: calcPrice(1850, 1.10, 1100),
        notes: null,
        created_at: '2026-03-26T11:00:00Z', updated_at: '2026-04-05T05:00:00Z',
      },

      // ── Trip 5: Casablanca → Barcelona (Apr 20) ───────────────────────────
      {
        trip_id: tOpen1.id, company_id: co3Id, status: 'approved',
        total_weight_kg: 1300, total_price: calcPrice(1050, 0.75, 1300),
        notes: "Spring/Summer '26 fashion collection — retail launch deadline",
        created_at: '2026-04-01T10:15:00Z', updated_at: '2026-04-03T15:00:00Z',
      },
      {
        trip_id: tOpen1.id, company_id: co2Id, status: 'pending',
        total_weight_kg: 850, total_price: calcPrice(1050, 0.75, 850),
        notes: null,
        created_at: '2026-04-07T09:30:00Z', updated_at: '2026-04-07T09:30:00Z',
      },

      // ── Trip 6: Tunis → Hamburg (Apr 25) ──────────────────────────────────
      {
        trip_id: tOpen2.id, company_id: co1Id, status: 'approved',
        total_weight_kg: 2000, total_price: calcPrice(2100, 1.25, 2000),
        notes: 'Automotive spare parts — OEM certified',
        created_at: '2026-04-03T14:00:00Z', updated_at: '2026-04-05T10:00:00Z',
      },
      {
        trip_id: tOpen2.id, company_id: co5Id, status: 'pending',
        total_weight_kg: 650, total_price: calcPrice(2100, 1.25, 650),
        notes: 'Urgent: surgical supplies for hospital tender',
        created_at: '2026-04-09T08:00:00Z', updated_at: '2026-04-09T08:00:00Z',
      },

      // ── Trip 7: Casablanca → Marseille (May 15) ───────────────────────────
      {
        trip_id: tOpen3.id, company_id: co4Id, status: 'pending',
        total_weight_kg: 1250, total_price: calcPrice(1200, 0.80, 1250),
        notes: 'Seasonal home goods — summer collection',
        created_at: '2026-04-10T11:00:00Z', updated_at: '2026-04-10T11:00:00Z',
      },

      // ── Trip 8: Algiers → Marseille (May 20) ──────────────────────────────
      {
        trip_id: tOpen4.id, company_id: co2Id, status: 'pending',
        total_weight_kg: 1000, total_price: calcPrice(880, 0.70, 1000),
        notes: null,
        created_at: '2026-04-10T15:30:00Z', updated_at: '2026-04-10T15:30:00Z',
      },

    ]).select(),
    'bookings'
  )!

  const [
    b1, b2, b3,         // trip 1 (delivered)
    b4, b5,             // trip 2 (delivered)
    b6, b7,             // trip 3 (in transit)
    b8, b9,             // trip 4 (in transit)
    b10, b11,           // trip 5 (open)
    b12, b13,           // trip 6 (open)
    b14,                // trip 7 (open)
    b15,                // trip 8 (open)
  ] = bookings

  console.log(`✓ ${bookings.length} bookings created\n`)

  // ── 6. CONTAINERS ──────────────────────────────────────────────────────────
  // Each booking's sum(weight_kg) must equal booking.total_weight_kg
  console.log('Creating containers…')

  ok(
    await supabase.from('containers').insert([
      // b1 — Atlas Freight (2370 kg)
      { booking_id: b1.id, weight_kg: 800,  description: 'General merchandise — palletised' },
      { booking_id: b1.id, weight_kg: 650,  description: 'Textile goods — boxed' },
      { booking_id: b1.id, weight_kg: 920,  description: 'Hardware supplies — steel shelving units' },
      // b2 — MedTrans (1850 kg)
      { booking_id: b2.id, weight_kg: 1100, description: 'Construction materials — tile adhesive bags' },
      { booking_id: b2.id, weight_kg: 750,  description: 'Packaged food products — sealed drums' },
      // b3 — Iberian Cargo / CANCELLED (500 kg)
      { booking_id: b3.id, weight_kg: 500,  description: 'Electronic components — anti-static packaging' },
      // b4 — EuroShip (1430 kg)
      { booking_id: b4.id, weight_kg: 650,  description: 'Laboratory equipment — fragile, upright only' },
      { booking_id: b4.id, weight_kg: 780,  description: 'Office furniture — flat-packed' },
      // b5 — Atlas Freight (920 kg)
      { booking_id: b5.id, weight_kg: 920,  description: 'Spare parts — industrial machinery, boxed' },
      // b6 — MedTrans (2000 kg)
      { booking_id: b6.id, weight_kg: 1200, description: 'Apparel & accessories — hanging garments' },
      { booking_id: b6.id, weight_kg: 800,  description: 'Household appliances — boxed' },
      // b7 — Nordic Sea (2170 kg)
      { booking_id: b7.id, weight_kg: 600,  description: 'Frozen seafood — refrigerated, temperature log required' },
      { booking_id: b7.id, weight_kg: 720,  description: 'Processed foods — vacuum-sealed' },
      { booking_id: b7.id, weight_kg: 850,  description: 'Packaging materials — compressed bales' },
      // b8 — Atlas Freight (2400 kg)
      { booking_id: b8.id, weight_kg: 1500, description: 'Steel pipes & fittings — bundled' },
      { booking_id: b8.id, weight_kg: 900,  description: 'Hydraulic components — oil-sealed crates' },
      // b9 — Iberian Cargo (1100 kg)
      { booking_id: b9.id, weight_kg: 1100, description: 'Ceramic tiles — export-grade, wooden crates' },
      // b10 — EuroShip (1300 kg)
      { booking_id: b10.id, weight_kg: 700,  description: "Women's fashion collection SS26 — hanging rails" },
      { booking_id: b10.id, weight_kg: 600,  description: 'Accessories & footwear — boxed' },
      // b11 — MedTrans (850 kg)
      { booking_id: b11.id, weight_kg: 850,  description: 'Dried fruits & spices — food-grade sealed bags' },
      // b12 — Atlas Freight (2000 kg)
      { booking_id: b12.id, weight_kg: 900,  description: 'Brake systems & calipers — OEM, individual boxes' },
      { booking_id: b12.id, weight_kg: 1100, description: 'Engine components — foam-padded crates' },
      // b13 — Nordic Sea (650 kg)
      { booking_id: b13.id, weight_kg: 650,  description: 'Surgical instruments & consumables — sterile packs' },
      // b14 — Iberian Cargo (1250 kg)
      { booking_id: b14.id, weight_kg: 500,  description: 'Ceramic cookware sets — retail boxes' },
      { booking_id: b14.id, weight_kg: 750,  description: 'Decorative tiles — wooden crates, fragile' },
      // b15 — MedTrans (1000 kg)
      { booking_id: b15.id, weight_kg: 1000, description: 'Agricultural equipment parts — bulk crates' },
    ]),
    'containers'
  )

  console.log('✓ Containers created\n')

  // ── 7. BOOKING STATUS HISTORY ──────────────────────────────────────────────
  // Append-only log of every status transition.
  // updated_by = null means the cron automation triggered the change.
  console.log('Creating booking status history…')

  ok(
    await supabase.from('booking_status_history').insert([
      // b1 — delivered (pending → approved → out_for_delivery → delivered)
      { booking_id: b1.id, updated_by: staff1Id, status: 'approved',         notes: 'Capacity confirmed, weight within limits',    created_at: '2026-01-04T10:00:00Z' },
      { booking_id: b1.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-01-10T00:00:00Z' },
      { booking_id: b1.id, updated_by: null,      status: 'delivered',        notes: 'automated: arrival date reached',             created_at: '2026-01-22T00:00:00Z' },
      // b2 — delivered
      { booking_id: b2.id, updated_by: staff1Id, status: 'approved',         notes: null,                                          created_at: '2026-01-05T09:00:00Z' },
      { booking_id: b2.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-01-10T00:00:00Z' },
      { booking_id: b2.id, updated_by: null,      status: 'delivered',        notes: 'automated: arrival date reached',             created_at: '2026-01-22T00:00:00Z' },
      // b3 — cancelled (company cancelled after creating booking)
      { booking_id: b3.id, updated_by: null,      status: 'cancelled',        notes: 'Client postponed shipment to next cycle — internal hold on customs docs', created_at: '2026-01-08T16:00:00Z' },
      // b4 — delivered
      { booking_id: b4.id, updated_by: staff2Id, status: 'approved',         notes: 'Customs documents verified',                  created_at: '2026-01-29T16:00:00Z' },
      { booking_id: b4.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-02-05T00:00:00Z' },
      { booking_id: b4.id, updated_by: null,      status: 'delivered',        notes: 'automated: arrival date reached',             created_at: '2026-02-15T00:00:00Z' },
      // b5 — delivered
      { booking_id: b5.id, updated_by: staff2Id, status: 'approved',         notes: null,                                          created_at: '2026-01-30T10:00:00Z' },
      { booking_id: b5.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-02-05T00:00:00Z' },
      { booking_id: b5.id, updated_by: null,      status: 'delivered',        notes: 'automated: arrival date reached',             created_at: '2026-02-15T00:00:00Z' },
      // b6 — out_for_delivery
      { booking_id: b6.id, updated_by: adminId,  status: 'approved',         notes: 'Slot reserved — weight within trip limits',   created_at: '2026-03-19T11:00:00Z' },
      { booking_id: b6.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-03-30T00:00:00Z' },
      // b7 — out_for_delivery
      { booking_id: b7.id, updated_by: staff1Id, status: 'approved',         notes: 'Refrigeration slot confirmed',                created_at: '2026-03-21T14:00:00Z' },
      { booking_id: b7.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-03-30T00:00:00Z' },
      // b8 — out_for_delivery
      { booking_id: b8.id, updated_by: adminId,  status: 'approved',         notes: 'Customs pre-clearance verified at Tanger Med', created_at: '2026-03-26T09:00:00Z' },
      { booking_id: b8.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-04-05T00:00:00Z' },
      // b9 — out_for_delivery
      { booking_id: b9.id, updated_by: staff2Id, status: 'approved',         notes: null,                                          created_at: '2026-03-27T13:00:00Z' },
      { booking_id: b9.id, updated_by: null,      status: 'out_for_delivery', notes: 'automated: departure date reached',           created_at: '2026-04-05T00:00:00Z' },
      // b10 — approved
      { booking_id: b10.id, updated_by: staff1Id, status: 'approved',        notes: 'Spring collection — delivery deadline critical', created_at: '2026-04-03T15:00:00Z' },
      // b12 — approved
      { booking_id: b12.id, updated_by: adminId,  status: 'approved',        notes: 'Automotive client — priority handling flag set', created_at: '2026-04-05T10:00:00Z' },
    ]),
    'booking_status_history'
  )

  console.log('✓ Status history created\n')

  // ── 8. INVOICES ────────────────────────────────────────────────────────────
  // Created automatically when a booking is approved.
  // delivered → paid | in-transit / approved → unpaid
  console.log('Creating invoices…')

  ok(
    await supabase.from('invoices').insert([
      // Delivered → paid
      { booking_id: b1.id,  company_id: co1Id, total_price: b1.total_price,  status: 'paid',   issued_at: '2026-01-04T10:00:00Z', paid_at: '2026-01-15T09:00:00Z' },
      { booking_id: b2.id,  company_id: co2Id, total_price: b2.total_price,  status: 'paid',   issued_at: '2026-01-05T09:00:00Z', paid_at: '2026-01-18T14:00:00Z' },
      { booking_id: b4.id,  company_id: co3Id, total_price: b4.total_price,  status: 'paid',   issued_at: '2026-01-29T16:00:00Z', paid_at: '2026-02-10T11:00:00Z' },
      { booking_id: b5.id,  company_id: co1Id, total_price: b5.total_price,  status: 'paid',   issued_at: '2026-01-30T10:00:00Z', paid_at: '2026-02-12T16:00:00Z' },
      // Out for delivery → unpaid
      { booking_id: b6.id,  company_id: co2Id, total_price: b6.total_price,  status: 'unpaid', issued_at: '2026-03-19T11:00:00Z' },
      { booking_id: b7.id,  company_id: co5Id, total_price: b7.total_price,  status: 'unpaid', issued_at: '2026-03-21T14:00:00Z' },
      { booking_id: b8.id,  company_id: co1Id, total_price: b8.total_price,  status: 'unpaid', issued_at: '2026-03-26T09:00:00Z' },
      { booking_id: b9.id,  company_id: co4Id, total_price: b9.total_price,  status: 'unpaid', issued_at: '2026-03-27T13:00:00Z' },
      // Approved → unpaid
      { booking_id: b10.id, company_id: co3Id, total_price: b10.total_price, status: 'unpaid', issued_at: '2026-04-03T15:00:00Z' },
      { booking_id: b12.id, company_id: co1Id, total_price: b12.total_price, status: 'unpaid', issued_at: '2026-04-05T10:00:00Z' },
    ]),
    'invoices'
  )

  console.log('✓ Invoices created\n')

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('✅  Seed complete!')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`
Data snapshot (today: 2026-04-11):
  Pricing plans : 6  (5 active, 1 discontinued)
  Trips         : 8  (2 delivered · 2 in transit · 4 open)
  Bookings      : 15 (4 delivered · 4 in transit · 2 approved · 4 pending · 1 cancelled)
  Containers    : 26
  Invoices      : 10 (4 paid · 6 unpaid)
  Status events : 22

Test accounts  (password: Ocean1234!)
  Admin  → omar.bennani@ocean.seed
  Staff  → youssef.elamrani@ocean.seed
  Staff  → fatima.idrissi@ocean.seed
  Co 1   → ops@atlasfreight.ocean.seed          (Atlas Freight Solutions)
  Co 2   → contact@medtrans.ocean.seed           (MedTrans SARL)
  Co 3   → info@euroship.ocean.seed              (EuroShip Import/Export)
  Co 4   → logistics@iberiancargo.ocean.seed     (Iberian Cargo Group)
  Co 5   → freight@nordicsea.ocean.seed          (Nordic Sea Logistics)
`)
}

seed().catch(e => { console.error(e); process.exit(1) })
