export type UserRole = 'admin' | 'staff'
export type TransportType = 'ship' | 'truck' | 'airplane'
export type TripStatus = 'open' | 'full' | 'out_for_delivery' | 'delivered'
export type BookingStatus = 'pending' | 'approved' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type InvoiceStatus = 'unpaid' | 'paid' | 'cancelled'

export interface User {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  created_at: string
}

export interface Company {
  id: string
  company_name: string
  contact_name: string
  phone: string | null
  created_at: string
}

export interface PricingPlan {
  id: string
  from_location: string
  to_location: string
  transport_type: TransportType
  base_price: number
  per_kg_rate: number
  is_active: boolean
  created_at: string
}

export interface Trip {
  id: string
  pricing_plan_id: string
  from_location: string
  to_location: string
  transport_type: TransportType
  base_price: number
  per_kg_rate: number
  departure_date: string
  arrival_date: string
  max_containers: number
  status: TripStatus
  created_by: string
  created_at: string
}

export interface Booking {
  id: string
  trip_id: string
  company_id: string
  status: BookingStatus
  total_weight_kg: number
  total_price: number
  notes: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface Container {
  id: string
  booking_id: string
  weight_kg: number
  description: string | null
  created_at: string
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  updated_by: string | null
  status: BookingStatus
  notes: string | null
  created_at: string
}

export interface Invoice {
  id: string
  booking_id: string
  company_id: string
  total_price: number
  status: InvoiceStatus
  issued_at: string
  paid_at: string | null
  cancelled_at: string | null
}
