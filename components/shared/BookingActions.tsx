// Client Component — needs useState for multiple confirm dialogs.
// Booking action buttons shown on staff/admin booking detail page.
// Available actions depend on current booking status.
// Calls real API routes: approve, cancel, invoice toggle.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast }    from 'sonner'
import { Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button }        from '@/components/ui/button'
import type { BookingStatus, InvoiceStatus } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'

interface InvoiceSummary {
  id:          string
  booking_id:  string
  total_price: number
  status:      InvoiceStatus
  issued_at:   string
  paid_at:     string | null
}

interface BookingActionsProps {
  bookingId:     string
  status:        BookingStatus
  cancelReason?: string | null
  invoice?:      InvoiceSummary | null
}

export function BookingActions({ bookingId, status, cancelReason, invoice }: BookingActionsProps) {
  const router = useRouter()

  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(status)
  const [invStatus,     setInvStatus]     = useState<InvoiceStatus | undefined>(invoice?.status)
  const [approveOpen,   setApproveOpen]   = useState(false)
  const [cancelOpen,    setCancelOpen]    = useState(false)
  const [invoiceOpen,   setInvoiceOpen]   = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  async function handleApprove() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approve`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Approval failed')
      }
      setCurrentStatus('approved')
      toast.success(`Booking ${bookingId.toUpperCase()} approved`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setActionLoading(false)
      setApproveOpen(false)
    }
  }

  async function handleCancel() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Cancellation failed')
      }
      setCurrentStatus('cancelled')
      toast.success(`Booking ${bookingId.toUpperCase()} cancelled`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setActionLoading(false)
      setCancelOpen(false)
    }
  }

  async function handleInvoiceToggle() {
    if (!invoice) return
    const next: InvoiceStatus = invStatus === 'paid' ? 'unpaid' : 'paid'
    setActionLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Invoice update failed')
      }
      setInvStatus(next)
      toast.success(`Invoice marked ${next}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invoice update failed')
    } finally {
      setActionLoading(false)
      setInvoiceOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Actions card ── */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">Actions</p>

        {currentStatus === 'pending' && (
          <div className="space-y-2">
            <Button
              onClick={() => setApproveOpen(true)}
              className="w-full bg-[#1B2E5E] text-white hover:bg-[#152449]"
            >
              Approve Booking
            </Button>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(true)}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Cancel Booking
            </Button>
          </div>
        )}

        {currentStatus === 'approved' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
              <Info className="h-4 w-4 shrink-0" />
              Booking approved — awaiting departure
            </div>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(true)}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Cancel Booking
            </Button>
          </div>
        )}

        {currentStatus === 'out_for_delivery' && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2.5 text-sm text-purple-700">
            <Info className="h-4 w-4 shrink-0" />
            Shipment is on the way — no actions available
          </div>
        )}

        {currentStatus === 'delivered' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Delivered successfully — no further actions
          </div>
        )}

        {currentStatus === 'cancelled' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This booking was cancelled
            </div>
            {cancelReason && (
              <p className="text-xs text-[#6B7280]">Reason: {cancelReason}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Invoice card ── */}
      {invoice && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">Invoice</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Invoice #</span>
              <span className="font-mono font-semibold">INV-{invoice.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Amount</span>
              <span className="font-semibold">{formatPrice(invoice.total_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Status</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                invStatus === 'paid'      ? 'bg-green-100 text-green-800' :
                invStatus === 'unpaid'    ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(invStatus ?? '—').charAt(0).toUpperCase() + (invStatus ?? '').slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Issued</span>
              <span>{formatDate(invoice.issued_at)}</span>
            </div>
            {invoice.paid_at && (
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Paid</span>
                <span>{formatDate(invoice.paid_at)}</span>
              </div>
            )}
          </div>
          {invStatus !== 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvoiceOpen(true)}
              className="mt-3 w-full"
            >
              Mark {invStatus === 'paid' ? 'Unpaid' : 'Paid'}
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Booking"
        description="This booking will be approved and an invoice will be generated."
        confirmLabel="Approve"
        onConfirm={handleApprove}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Booking"
        description="This will cancel the booking and release the reserved containers."
        confirmLabel="Cancel Booking"
        variant="danger"
        onConfirm={handleCancel}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        title={`Mark Invoice ${invStatus === 'paid' ? 'Unpaid' : 'Paid'}`}
        description="Update the payment status for this invoice."
        confirmLabel="Confirm"
        onConfirm={handleInvoiceToggle}
        loading={actionLoading}
      />
    </div>
  )
}
