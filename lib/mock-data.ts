/**
 * Mock data for all dashboard pages.
 * Server-safe: plain TypeScript objects, no browser APIs.
 * Used until real Supabase queries are wired in Step 12.
 */

import type {
  User, Company, PricingPlan, Trip, Booking,
  Container, Invoice, BookingStatus, BookingStatusHistory,
  TripStatus, InvoiceStatus,
} from '@/types/database'

// ── Users (admin + staff) ────────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: 'u-001', role: 'admin', full_name: 'Sarah Mitchell',   phone: '+1 555 100 0001', created_at: '2025-01-10T09:00:00Z' },
  { id: 'u-002', role: 'staff', full_name: 'James Okafor',     phone: '+1 555 100 0002', created_at: '2025-02-14T10:30:00Z' },
  { id: 'u-003', role: 'staff', full_name: 'Priya Nambiar',    phone: '+1 555 100 0003', created_at: '2025-03-01T08:00:00Z' },
]

// ── Companies ────────────────────────────────────────────────────────────────
export const mockCompanies: Company[] = [
  { id: 'c-001', company_name: 'Meridian Exports Ltd.',   contact_name: 'Carlos Vega',     phone: '+34 91 555 0101',  created_at: '2025-03-15T11:00:00Z' },
  { id: 'c-002', company_name: 'Atlas Freight Group',     contact_name: 'Aisha Barroso',   phone: '+212 522 001122',  created_at: '2025-04-02T09:15:00Z' },
  { id: 'c-003', company_name: 'BlueSea Trading Co.',     contact_name: 'Nikos Papadis',   phone: '+30 210 555 0303', created_at: '2025-04-20T14:00:00Z' },
  { id: 'c-004', company_name: 'Horizon Logistics S.A.',  contact_name: 'Fatima Al-Zahra', phone: '+971 4 555 0404',  created_at: '2025-05-10T08:30:00Z' },
]

// Company emails — supplement (not in DB schema, used for display only)
export const mockCompanyEmails: Record<string, string> = {
  'c-001': 'carlos.vega@meridian-exports.com',
  'c-002': 'aisha.barroso@atlasfreight.com',
  'c-003': 'nikos@blueseatrading.gr',
  'c-004': 'fatima@horizonlogistics.ae',
}

// ── Pricing Plans ─────────────────────────────────────────────────────────────
export const mockPricingPlans: PricingPlan[] = [
  { id: 'pp-001', from_location: 'Barcelona', to_location: 'Casablanca',    transport_type: 'ship',     base_price: 1200, per_kg_rate: 0.85, is_active: true,  created_at: '2025-02-01T10:00:00Z' },
  { id: 'pp-002', from_location: 'Marseille', to_location: 'Tunis',         transport_type: 'ship',     base_price: 950,  per_kg_rate: 0.70, is_active: true,  created_at: '2025-02-05T10:00:00Z' },
  { id: 'pp-003', from_location: 'Valencia',  to_location: 'Algiers',       transport_type: 'truck',    base_price: 600,  per_kg_rate: 1.10, is_active: true,  created_at: '2025-02-10T10:00:00Z' },
  { id: 'pp-004', from_location: 'Madrid',    to_location: 'Dubai',         transport_type: 'airplane', base_price: 3500, per_kg_rate: 4.20, is_active: false, created_at: '2025-02-15T10:00:00Z' },
]

// ── Trips ─────────────────────────────────────────────────────────────────────
export const mockTrips: Trip[] = [
  {
    id: 't-001', pricing_plan_id: 'pp-001',
    from_location: 'Barcelona', to_location: 'Casablanca',
    transport_type: 'ship', base_price: 1200, per_kg_rate: 0.85,
    departure_date: '2026-03-10', arrival_date: '2026-03-14',
    max_containers: 20, status: 'delivered' as TripStatus,
    created_by: 'u-001', created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 't-002', pricing_plan_id: 'pp-002',
    from_location: 'Marseille', to_location: 'Tunis',
    transport_type: 'ship', base_price: 950, per_kg_rate: 0.70,
    departure_date: '2026-03-20', arrival_date: '2026-03-23',
    max_containers: 15, status: 'delivered' as TripStatus,
    created_by: 'u-001', created_at: '2026-02-20T09:00:00Z',
  },
  {
    id: 't-003', pricing_plan_id: 'pp-001',
    from_location: 'Barcelona', to_location: 'Casablanca',
    transport_type: 'ship', base_price: 1200, per_kg_rate: 0.85,
    departure_date: '2026-04-05', arrival_date: '2026-04-09',
    max_containers: 20, status: 'out_for_delivery' as TripStatus,
    created_by: 'u-001', created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 't-004', pricing_plan_id: 'pp-003',
    from_location: 'Valencia', to_location: 'Algiers',
    transport_type: 'truck', base_price: 600, per_kg_rate: 1.10,
    departure_date: '2026-04-20', arrival_date: '2026-04-22',
    max_containers: 10, status: 'open' as TripStatus,
    created_by: 'u-002', created_at: '2026-03-25T09:00:00Z',
  },
  {
    id: 't-005', pricing_plan_id: 'pp-002',
    from_location: 'Marseille', to_location: 'Tunis',
    transport_type: 'ship', base_price: 950, per_kg_rate: 0.70,
    departure_date: '2026-05-01', arrival_date: '2026-05-04',
    max_containers: 15, status: 'open' as TripStatus,
    created_by: 'u-001', created_at: '2026-04-01T09:00:00Z',
  },
]

// ── Bookings ──────────────────────────────────────────────────────────────────
export const mockBookings: Booking[] = [
  { id: 'b-001', trip_id: 't-001', company_id: 'c-001', status: 'delivered' as BookingStatus,        total_weight_kg: 1800, total_price: 2730, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-02-18T10:00:00Z', updated_at: '2026-03-14T18:00:00Z' },
  { id: 'b-002', trip_id: 't-001', company_id: 'c-002', status: 'delivered' as BookingStatus,        total_weight_kg: 2200, total_price: 3070, notes: 'Fragile goods',    cancelled_at: null, cancel_reason: null, created_at: '2026-02-19T11:00:00Z', updated_at: '2026-03-14T18:00:00Z' },
  { id: 'b-003', trip_id: 't-002', company_id: 'c-003', status: 'delivered' as BookingStatus,        total_weight_kg: 900,  total_price: 1580, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-02-22T09:00:00Z', updated_at: '2026-03-23T15:00:00Z' },
  { id: 'b-004', trip_id: 't-002', company_id: 'c-001', status: 'cancelled' as BookingStatus,        total_weight_kg: 500,  total_price: 1300, notes: null,               cancelled_at: '2026-03-01T12:00:00Z', cancel_reason: 'Change of plans', created_at: '2026-02-23T14:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'b-005', trip_id: 't-003', company_id: 'c-002', status: 'out_for_delivery' as BookingStatus, total_weight_kg: 3000, total_price: 3750, notes: 'Handle with care', cancelled_at: null, cancel_reason: null, created_at: '2026-03-12T10:00:00Z', updated_at: '2026-04-05T08:00:00Z' },
  { id: 'b-006', trip_id: 't-003', company_id: 'c-004', status: 'out_for_delivery' as BookingStatus, total_weight_kg: 1500, total_price: 2475, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-03-13T11:00:00Z', updated_at: '2026-04-05T08:00:00Z' },
  { id: 'b-007', trip_id: 't-004', company_id: 'c-001', status: 'approved' as BookingStatus,         total_weight_kg: 800,  total_price: 1480, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-03-28T09:00:00Z', updated_at: '2026-03-30T10:00:00Z' },
  { id: 'b-008', trip_id: 't-004', company_id: 'c-003', status: 'pending' as BookingStatus,          total_weight_kg: 1200, total_price: 1920, notes: 'Urgent delivery',  cancelled_at: null, cancel_reason: null, created_at: '2026-04-01T14:00:00Z', updated_at: '2026-04-01T14:00:00Z' },
  { id: 'b-009', trip_id: 't-005', company_id: 'c-002', status: 'pending' as BookingStatus,          total_weight_kg: 600,  total_price: 1370, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-04-03T10:00:00Z', updated_at: '2026-04-03T10:00:00Z' },
  { id: 'b-010', trip_id: 't-005', company_id: 'c-004', status: 'approved' as BookingStatus,         total_weight_kg: 2000, total_price: 2350, notes: null,               cancelled_at: null, cancel_reason: null, created_at: '2026-04-04T09:00:00Z', updated_at: '2026-04-05T11:00:00Z' },
]

// ── Containers ────────────────────────────────────────────────────────────────
export const mockContainers: Container[] = [
  { id: 'cn-01', booking_id: 'b-001', weight_kg: 900,  description: 'Automotive parts',    created_at: '2026-02-18T10:05:00Z' },
  { id: 'cn-02', booking_id: 'b-001', weight_kg: 900,  description: 'Textiles',            created_at: '2026-02-18T10:05:00Z' },
  { id: 'cn-03', booking_id: 'b-002', weight_kg: 1100, description: 'Electronics (fragile)', created_at: '2026-02-19T11:05:00Z' },
  { id: 'cn-04', booking_id: 'b-002', weight_kg: 1100, description: 'Glassware',           created_at: '2026-02-19T11:05:00Z' },
  { id: 'cn-05', booking_id: 'b-003', weight_kg: 900,  description: 'Olive oil cases',     created_at: '2026-02-22T09:05:00Z' },
  { id: 'cn-06', booking_id: 'b-005', weight_kg: 1500, description: 'Machinery parts',     created_at: '2026-03-12T10:05:00Z' },
  { id: 'cn-07', booking_id: 'b-005', weight_kg: 1500, description: 'Steel coils',         created_at: '2026-03-12T10:05:00Z' },
  { id: 'cn-08', booking_id: 'b-006', weight_kg: 1500, description: 'Chemical drums',      created_at: '2026-03-13T11:05:00Z' },
  { id: 'cn-09', booking_id: 'b-007', weight_kg: 800,  description: 'Ceramic tiles',       created_at: '2026-03-28T09:05:00Z' },
  { id: 'cn-10', booking_id: 'b-008', weight_kg: 600,  description: 'Food products',       created_at: '2026-04-01T14:05:00Z' },
  { id: 'cn-11', booking_id: 'b-008', weight_kg: 600,  description: 'Beverages',           created_at: '2026-04-01T14:05:00Z' },
  { id: 'cn-12', booking_id: 'b-009', weight_kg: 600,  description: 'Clothing',            created_at: '2026-04-03T10:05:00Z' },
  { id: 'cn-13', booking_id: 'b-010', weight_kg: 1000, description: 'Industrial equipment', created_at: '2026-04-04T09:05:00Z' },
  { id: 'cn-14', booking_id: 'b-010', weight_kg: 1000, description: 'Copper wire spools',  created_at: '2026-04-04T09:05:00Z' },
]

// ── Invoices ──────────────────────────────────────────────────────────────────
export const mockInvoices: Invoice[] = [
  { id: 'inv-001', booking_id: 'b-001', company_id: 'c-001', total_price: 2730, status: 'paid' as InvoiceStatus,      issued_at: '2026-03-14T19:00:00Z', paid_at: '2026-03-20T10:00:00Z', cancelled_at: null },
  { id: 'inv-002', booking_id: 'b-002', company_id: 'c-002', total_price: 3070, status: 'paid' as InvoiceStatus,      issued_at: '2026-03-14T19:00:00Z', paid_at: '2026-03-22T14:00:00Z', cancelled_at: null },
  { id: 'inv-003', booking_id: 'b-003', company_id: 'c-003', total_price: 1580, status: 'paid' as InvoiceStatus,      issued_at: '2026-03-23T16:00:00Z', paid_at: '2026-03-28T11:00:00Z', cancelled_at: null },
  { id: 'inv-004', booking_id: 'b-004', company_id: 'c-001', total_price: 1300, status: 'cancelled' as InvoiceStatus, issued_at: '2026-03-01T13:00:00Z', paid_at: null,                   cancelled_at: '2026-03-01T13:00:00Z' },
  { id: 'inv-005', booking_id: 'b-005', company_id: 'c-002', total_price: 3750, status: 'unpaid' as InvoiceStatus,    issued_at: '2026-04-05T09:00:00Z', paid_at: null,                   cancelled_at: null },
  { id: 'inv-006', booking_id: 'b-006', company_id: 'c-004', total_price: 2475, status: 'unpaid' as InvoiceStatus,    issued_at: '2026-04-05T09:00:00Z', paid_at: null,                   cancelled_at: null },
  { id: 'inv-007', booking_id: 'b-007', company_id: 'c-001', total_price: 1480, status: 'unpaid' as InvoiceStatus,    issued_at: '2026-03-30T10:30:00Z', paid_at: null,                   cancelled_at: null },
  { id: 'inv-008', booking_id: 'b-010', company_id: 'c-004', total_price: 2350, status: 'unpaid' as InvoiceStatus,    issued_at: '2026-04-05T11:30:00Z', paid_at: null,                   cancelled_at: null },
]

// ── Derived / joined helpers ───────────────────────────────────────────────────

/** Booking enriched with company and trip data for display in tables */
export interface EnrichedBooking extends Booking {
  company_name: string
  trip_route: string
  trip_transport: string
  containers_count: number
}

export const mockEnrichedBookings: EnrichedBooking[] = mockBookings.map((b) => {
  const company = mockCompanies.find((c) => c.id === b.company_id)
  const trip = mockTrips.find((t) => t.id === b.trip_id)
  const containers = mockContainers.filter((c) => c.booking_id === b.id)
  return {
    ...b,
    company_name:      company?.company_name ?? '—',
    trip_route:        trip ? `${trip.from_location} → ${trip.to_location}` : '—',
    trip_transport:    trip?.transport_type ?? '—',
    containers_count:  containers.length,
  }
})

/** Invoice enriched with company and booking data */
export interface EnrichedInvoice extends Invoice {
  company_name: string
  booking_short: string
}

export const mockEnrichedInvoices: EnrichedInvoice[] = mockInvoices.map((inv) => {
  const company = mockCompanies.find((c) => c.id === inv.company_id)
  return {
    ...inv,
    company_name:  company?.company_name ?? '—',
    booking_short: inv.booking_id.replace('b-', 'BK-'),
  }
})

// Monthly revenue for charts (derived from paid invoices)
export const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 0     },
  { month: 'Feb', revenue: 0     },
  { month: 'Mar', revenue: 8680  }, // inv-001 + 002 + 003
  { month: 'Apr', revenue: 3750  }, // inv-005 (unpaid but for demo)
]

// Bookings per status for charts
export const mockBookingsByStatus = [
  { status: 'Pending',          count: mockBookings.filter((b) => b.status === 'pending').length },
  { status: 'Approved',         count: mockBookings.filter((b) => b.status === 'approved').length },
  { status: 'Out for Delivery', count: mockBookings.filter((b) => b.status === 'out_for_delivery').length },
  { status: 'Delivered',        count: mockBookings.filter((b) => b.status === 'delivered').length },
  { status: 'Cancelled',        count: mockBookings.filter((b) => b.status === 'cancelled').length },
]

// ── Booking Status History ────────────────────────────────────────────────────
export const mockStatusHistory: BookingStatusHistory[] = [
  { id: 'sh-01', booking_id: 'b-001', updated_by: 'u-001', status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-02-18T10:00:00Z' },
  { id: 'sh-02', booking_id: 'b-001', updated_by: 'u-002', status: 'approved' as BookingStatus,         notes: 'Reviewed and approved',        created_at: '2026-02-20T09:00:00Z' },
  { id: 'sh-03', booking_id: 'b-001', updated_by: null,    status: 'out_for_delivery' as BookingStatus, notes: 'Departed Barcelona',           created_at: '2026-03-10T07:00:00Z' },
  { id: 'sh-04', booking_id: 'b-001', updated_by: null,    status: 'delivered' as BookingStatus,        notes: 'Arrived Casablanca port',      created_at: '2026-03-14T17:00:00Z' },
  { id: 'sh-05', booking_id: 'b-002', updated_by: 'u-001', status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-02-19T11:00:00Z' },
  { id: 'sh-06', booking_id: 'b-002', updated_by: 'u-003', status: 'approved' as BookingStatus,         notes: 'Approved — fragile handled',   created_at: '2026-02-21T10:00:00Z' },
  { id: 'sh-07', booking_id: 'b-002', updated_by: null,    status: 'out_for_delivery' as BookingStatus, notes: null,                           created_at: '2026-03-10T07:00:00Z' },
  { id: 'sh-08', booking_id: 'b-002', updated_by: null,    status: 'delivered' as BookingStatus,        notes: null,                           created_at: '2026-03-14T17:00:00Z' },
  { id: 'sh-09', booking_id: 'b-004', updated_by: 'u-001', status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-02-23T14:00:00Z' },
  { id: 'sh-10', booking_id: 'b-004', updated_by: 'u-002', status: 'cancelled' as BookingStatus,        notes: 'Change of plans',              created_at: '2026-03-01T12:00:00Z' },
  { id: 'sh-11', booking_id: 'b-007', updated_by: 'u-003', status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-03-28T09:00:00Z' },
  { id: 'sh-12', booking_id: 'b-007', updated_by: 'u-002', status: 'approved' as BookingStatus,         notes: null,                           created_at: '2026-03-30T10:00:00Z' },
  { id: 'sh-13', booking_id: 'b-008', updated_by: null,    status: 'pending' as BookingStatus,          notes: 'Booking created — urgent',     created_at: '2026-04-01T14:00:00Z' },
  { id: 'sh-14', booking_id: 'b-009', updated_by: null,    status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-04-03T10:00:00Z' },
  { id: 'sh-15', booking_id: 'b-010', updated_by: 'u-001', status: 'pending' as BookingStatus,          notes: 'Booking created',              created_at: '2026-04-04T09:00:00Z' },
  { id: 'sh-16', booking_id: 'b-010', updated_by: 'u-003', status: 'approved' as BookingStatus,         notes: null,                           created_at: '2026-04-05T11:00:00Z' },
]

// Trips per transport type for charts
export const mockTripsByTransport = [
  { label: 'Ship',     count: mockTrips.filter((t) => t.transport_type === 'ship').length },
  { label: 'Truck',    count: mockTrips.filter((t) => t.transport_type === 'truck').length },
  { label: 'Airplane', count: mockTrips.filter((t) => t.transport_type === 'airplane').length },
]
