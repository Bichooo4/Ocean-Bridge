'use client'

import { useState } from 'react'
import { toast }    from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button }        from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import type { BookingWithDetails } from '@/hooks/useBookings'

interface Props {
  bookings: BookingWithDetails[]
  refetch:  () => void
}

export function StaffPendingApprovals({ bookings, refetch }: Props) {
  const [target,  setTarget]  = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!target) return
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${target}/approve`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Approval failed')
      }
      toast.success(`Booking ${target.toUpperCase()} approved`)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setLoading(false)
      setTarget(null)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280]">
              <th className="pb-2 pr-4">Company</th>
              <th className="pb-2 pr-4">Route</th>
              <th className="pb-2 pr-4">Price</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0">
                <td className="py-2.5 pr-4 font-medium text-[#1B2E5E]">{b.company_name}</td>
                <td className="py-2.5 pr-4 text-[#6B7280]">{b.trip_route}</td>
                <td className="py-2.5 pr-4">{formatPrice(b.total_price)}</td>
                <td className="py-2.5 pr-4 text-[#6B7280]">{formatDate(b.created_at)}</td>
                <td className="py-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#1B2E5E] text-[#1B2E5E] hover:bg-[#1B2E5E] hover:text-white"
                    onClick={() => setTarget(b.id)}
                  >
                    Approve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => { if (!o) setTarget(null) }}
        title="Approve Booking"
        description="This booking will be approved and an invoice will be generated."
        confirmLabel="Approve"
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  )
}
