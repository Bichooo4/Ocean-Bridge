/**
 * App-wide constants: colours, status maps, nav items, select options
 * Server-safe: no browser APIs — importable in server and client components
 */

import type { BookingStatus, TripStatus } from '@/types/database'

// ── Brand colours ────────────────────────────────────────────────────────────
export const COLORS = {
  primary:    '#1B2E5E',
  secondary:  '#4A90D9',
  background: '#F8F9FB',
  success:    '#22C55E',
  warning:    '#F59E0B',
  danger:     '#EF4444',
  muted:      '#6B7280',
} as const

// ── Status → Tailwind badge class mappings ───────────────────────────────────

// Used by StatusBadge component for booking rows
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved:         'bg-blue-100 text-blue-800 border-blue-200',
  out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered:        'bg-green-100 text-green-800 border-green-200',
  cancelled:        'bg-red-100 text-red-800 border-red-200',
}

// Used by StatusBadge component for trip rows
export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  open:             'bg-green-100 text-green-800 border-green-200',
  full:             'bg-orange-100 text-orange-800 border-orange-200',
  out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered:        'bg-gray-100 text-gray-800 border-gray-200',
}

// ── Form select options ───────────────────────────────────────────────────────
export const TRANSPORT_TYPES = [
  { value: 'ship',     label: 'Ship'     },
  { value: 'truck',    label: 'Truck'    },
  { value: 'airplane', label: 'Airplane' },
] as const

// ── Sidebar navigation per role ───────────────────────────────────────────────
// icon values map to lucide-react icon names (loaded lazily in Sidebar component)

export const ADMIN_NAV = [
  { label: 'Dashboard',     href: '/admin',          icon: 'LayoutDashboard' },
  { label: 'Trips',         href: '/admin/trips',    icon: 'Ship'            },
  { label: 'Bookings',      href: '/admin/bookings', icon: 'Package'         },
  { label: 'Pricing Plans', href: '/admin/pricing',  icon: 'Tag'             },
  { label: 'Staff',         href: '/admin/staff',    icon: 'Users'           },
  { label: 'Invoices',      href: '/admin/invoices', icon: 'FileText'        },
  { label: 'Reports',       href: '/admin/reports',  icon: 'BarChart2'       },
] as const

export const STAFF_NAV = [
  { label: 'Dashboard', href: '/staff',          icon: 'LayoutDashboard' },
  { label: 'Trips',     href: '/staff/trips',    icon: 'Ship'            },
  { label: 'Bookings',  href: '/staff/bookings', icon: 'Package'         },
  { label: 'Invoices',  href: '/staff/invoices', icon: 'FileText'        },
] as const

export const COMPANY_NAV = [
  { label: 'Dashboard', href: '/company',          icon: 'LayoutDashboard' },
  { label: 'Trips',     href: '/company/trips',    icon: 'Ship'            },
  { label: 'Bookings',  href: '/company/bookings', icon: 'Package'         },
  { label: 'Invoices',  href: '/company/invoices', icon: 'FileText'        },
] as const
