// Server Component
// Renders a colored status badge for bookings and trips.
// Colors are defined in lib/constants.ts.

import { Badge } from '@/components/ui/badge'
import { BOOKING_STATUS_COLORS, TRIP_STATUS_COLORS } from '@/lib/constants'
import { formatStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BookingStatus, TripStatus } from '@/types/database'

interface StatusBadgeProps {
  status: BookingStatus | TripStatus
  type: 'booking' | 'trip'
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorClass =
    type === 'booking'
      ? BOOKING_STATUS_COLORS[status as BookingStatus]
      : TRIP_STATUS_COLORS[status as TripStatus]

  return (
    <Badge
      variant="outline"
      className={cn('border text-xs font-medium', colorClass)}
    >
      {formatStatus(status)}
    </Badge>
  )
}
