// Server Component — staff booking detail with real Supabase data.
// Fetches booking + trip + company + containers + history + invoice.
// BookingActions is a client component for approve/cancel/invoice toggle.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ship, Truck, Plane } from 'lucide-react'
import { PageHeader }      from '@/components/shared/PageHeader'
import { StatusBadge }     from '@/components/shared/StatusBadge'
import { EmptyState }      from '@/components/shared/EmptyState'
import { BookingActions }  from '@/components/shared/BookingActions'
import { formatDate, formatPrice } from '@/lib/utils'
import { createClient }    from '@/lib/supabase/server'
import type { BookingStatus, TransportType } from '@/types/database'

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  ship:     <Ship  className="h-4 w-4" />,
  truck:    <Truck className="h-4 w-4" />,
  airplane: <Plane className="h-4 w-4" />,
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

export default async function StaffBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = user.app_metadata?.role as string | undefined
  if (role !== 'admin' && role !== 'staff') redirect('/company')

  // Fetch booking with all relations
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      trips:trip_id (*),
      companies:company_id (company_name, contact_name, phone, created_at),
      containers (*),
      booking_status_history (*),
      invoices (*)
    `)
    .eq('id', id)
    .single()

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link href="/staff/bookings" className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to Bookings
        </Link>
        <EmptyState title="Booking not found" description="This booking does not exist or has been removed." />
      </div>
    )
  }

  const b = booking as Record<string, unknown>
  const trip      = b.trips      as Record<string, unknown> | null
  const company   = b.companies  as Record<string, unknown> | null
  const containers = (b.containers as Record<string, unknown>[]) ?? []
  const history   = [...((b.booking_status_history as Record<string, unknown>[]) ?? [])]
    .sort((a, z) => String(z.created_at).localeCompare(String(a.created_at)))
  const invoice   = ((b.invoices as Record<string, unknown>[]) ?? [])[0] ?? null

  const totalWeight = containers.reduce((s, c) => s + (Number(c.weight_kg) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/staff/bookings" className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to Bookings
        </Link>
      </div>
      <PageHeader title="Booking Details" subtitle={`Booking ${id.toUpperCase()}`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Booking Info */}
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
            </div>
          </Section>

          {/* Trip Details */}
          {trip && (
            <Section label="Trip Details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field
                  label="Route"
                  value={<span className="font-semibold">{String(trip.from_location)} → {String(trip.to_location)}</span>}
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
                <Field label="Departure"      value={formatDate(String(trip.departure_date))} />
                <Field label="Arrival"        value={formatDate(String(trip.arrival_date))} />
                <Field label="Max Containers" value={String(trip.max_containers)} />
                <Field
                  label="Pricing"
                  value={`${formatPrice(Number(trip.base_price))} base + ${formatPrice(Number(trip.per_kg_rate))}/kg`}
                />
              </div>
            </Section>
          )}

          {/* Containers */}
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

          {/* Status History */}
          <Section label="Status History">
            <ol className="space-y-3">
              {history.map((entry, i) => (
                <li key={String(entry.id)} className="flex items-start gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-[#4A90D9]' : 'bg-[#E5E7EB]'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={String(entry.status) as BookingStatus} type="booking" />
                      <span className="text-xs text-[#6B7280]">{formatDate(String(entry.created_at))}</span>
                    </div>
                    {!!entry.notes && <p className="mt-0.5 text-xs text-[#6B7280]">{String(entry.notes)}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Company Info */}
          {company && (
            <Section label="Company">
              <div className="space-y-3">
                <p className="text-lg font-bold text-[#1B2E5E]">{String(company.company_name)}</p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-[#6B7280]"><span className="font-medium text-[#1B2E5E]">Contact:</span> {String(company.contact_name)}</p>
                  {!!company.phone && <p className="text-[#6B7280]"><span className="font-medium text-[#1B2E5E]">Phone:</span> {String(company.phone)}</p>}
                  <p className="text-[#6B7280]"><span className="font-medium text-[#1B2E5E]">Since:</span> {formatDate(String(company.created_at))}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Actions + Invoice */}
          <BookingActions
            bookingId={id}
            status={String(b.status) as BookingStatus}
            cancelReason={b.cancel_reason ? String(b.cancel_reason) : null}
            invoice={invoice ? {
              id:          String(invoice.id),
              booking_id:  String(invoice.booking_id),
              total_price: Number(invoice.total_price),
              status:      String(invoice.status) as 'paid' | 'unpaid' | 'cancelled',
              issued_at:   String(invoice.issued_at),
              paid_at:     invoice.paid_at ? String(invoice.paid_at) : null,
            } : null}
          />
        </div>
      </div>
    </div>
  )
}
