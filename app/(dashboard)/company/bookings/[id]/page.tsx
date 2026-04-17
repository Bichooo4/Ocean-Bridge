import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ship, Truck, Plane } from 'lucide-react'
import { PageHeader }  from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState }  from '@/components/shared/EmptyState'
import { Badge }       from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import type { BookingStatus, TransportType, InvoiceStatus } from '@/types/database'

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  ship:     <Ship  className="h-4 w-4" />,
  truck:    <Truck className="h-4 w-4" />,
  airplane: <Plane className="h-4 w-4" />,
}

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  unpaid:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid:      'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#6B7280]">{label}</p>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[#1B2E5E]">{value}</p>
    </div>
  )
}

export default async function CompanyBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = user.app_metadata?.role as string | undefined
  if (role !== 'company') redirect('/admin')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      trips:trip_id (*),
      containers (*),
      booking_status_history (*),
      invoices (*)
    `)
    .eq('id', id)
    .single()

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link
          href="/company/bookings"
          className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Bookings
        </Link>
        <EmptyState
          title="Booking not found"
          description="This booking does not exist or does not belong to your account."
        />
      </div>
    )
  }

  const b = booking as Record<string, unknown>
  const trip       = b.trips as Record<string, unknown> | null
  const containers = (b.containers as Record<string, unknown>[]) ?? []
  const history    = [...((b.booking_status_history as Record<string, unknown>[]) ?? [])]
    .sort((a, z) => String(z.created_at).localeCompare(String(a.created_at)))
  const invoice    = ((b.invoices as Record<string, unknown>[]) ?? [])[0] ?? null

  const totalWeight = containers.reduce((s, c) => s + (Number(c.weight_kg) || 0), 0)

  return (
    <div className="space-y-6">
      <Link
        href="/company/bookings"
        className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Bookings
      </Link>

      <PageHeader
        title="Booking Details"
        subtitle={`Booking ${id.toUpperCase()}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {}
        <div className="space-y-5">
          {}
          <Section label="Booking Information">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Booking ID"   value={<span className="font-mono">{id.toUpperCase()}</span>} />
              <Field label="Status"       value={<StatusBadge status={String(b.status) as BookingStatus} type="booking" />} />
              <Field label="Created"      value={formatDate(String(b.created_at))} />
              <Field label="Last Updated" value={formatDate(String(b.updated_at))} />
              {!!b.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-[#6B7280]">Notes</p>
                  <p className="mt-0.5 text-sm text-[#1B2E5E]">{String(b.notes)}</p>
                </div>
              )}
              {String(b.status) === 'cancelled' && !!b.cancel_reason && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-[#6B7280]">Cancellation Reason</p>
                  <p className="mt-0.5 text-sm text-red-600">{String(b.cancel_reason)}</p>
                </div>
              )}
            </div>
          </Section>

          {}
          {trip && (
            <Section label="Trip Details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field
                  label="Route"
                  value={
                    <span className="font-semibold">
                      {String(trip.from_location)} → {String(trip.to_location)}
                    </span>
                  }
                />
                <Field
                  label="Transport"
                  value={
                    <span className="flex items-center gap-1.5 capitalize">
                      {TRANSPORT_ICONS[String(trip.transport_type) as TransportType]}
                      {String(trip.transport_type)}
                    </span>
                  }
                />
                <Field label="Departure" value={formatDate(String(trip.departure_date))} />
                <Field label="Arrival"   value={formatDate(String(trip.arrival_date))} />
                <Field
                  label="Pricing"
                  value={`${formatPrice(Number(trip.base_price))} base + ${formatPrice(Number(trip.per_kg_rate))}/kg`}
                />
              </div>
            </Section>
          )}

          {}
          <Section label={`Containers (${containers.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280]">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Weight (kg)</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((c, i) => (
                    <tr key={String(c.id)} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-2.5 pr-4 text-[#6B7280]">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium">{Number(c.weight_kg).toLocaleString()} kg</td>
                      <td className="py-2.5 text-[#6B7280]">{c.description ? String(c.description) : '—'}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#F8F9FB]">
                    <td className="py-2.5 pr-4 text-xs font-bold text-[#1B2E5E]" colSpan={2}>
                      Total: {totalWeight.toLocaleString()} kg
                    </td>
                    <td className="py-2.5 text-xs font-bold text-[#1B2E5E]">
                      {formatPrice(Number(b.total_price))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {}
          <Section label="Status History">
            {history.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No status history available.</p>
            ) : (
              <ol className="space-y-3">
                {history.map((entry, i) => (
                  <li key={String(entry.id)} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        i === 0 ? 'bg-[#4A90D9]' : 'bg-[#E5E7EB]'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={String(entry.status) as BookingStatus} type="booking" />
                        <span className="text-xs text-[#6B7280]">{formatDate(String(entry.created_at))}</span>
                      </div>
                      {!!entry.notes && (
                        <p className="mt-0.5 text-xs text-[#6B7280]">{String(entry.notes)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>

        {}
        <div className="space-y-5">
          {invoice ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">Invoice</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Invoice #</span>
                  <span className="font-mono font-semibold">
                    INV-{String(invoice.id).slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Amount</span>
                  <span className="font-semibold">{formatPrice(Number(invoice.total_price))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Status</span>
                  <Badge
                    variant="outline"
                    className={INVOICE_STATUS_COLORS[String(invoice.status) as InvoiceStatus]}
                  >
                    {String(invoice.status).charAt(0).toUpperCase() + String(invoice.status).slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Issued</span>
                  <span>{formatDate(String(invoice.issued_at))}</span>
                </div>
                {!!invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Paid</span>
                    <span>{formatDate(String(invoice.paid_at))}</span>
                  </div>
                )}
              </div>
              {String(invoice.status) === 'unpaid' && (
                <div className="mt-4 rounded-lg bg-yellow-50 px-3 py-2.5 text-xs text-yellow-800">
                  Payment is due. Please contact us to arrange payment.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">Invoice</p>
              <p className="text-sm text-[#6B7280]">
                No invoice issued yet. Invoices are generated once a booking is approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
