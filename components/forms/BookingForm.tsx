'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast }     from 'sonner'
import { Plus, Trash2, Ship, Truck, Plane } from 'lucide-react'
import { ConfirmDialog }  from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { Textarea }       from '@/components/ui/textarea'
import { formatPrice, calculatePrice } from '@/lib/utils'
import { useTrips }       from '@/hooks/useTrips'
import type { TransportType } from '@/types/database'

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  ship:     <Ship     className="h-4 w-4" />,
  truck:    <Truck    className="h-4 w-4" />,
  airplane: <Plane    className="h-4 w-4" />,
}

interface ContainerRow {
  id:          string
  weight_kg:   string
  description: string
}

function newRow(): ContainerRow {
  return { id: crypto.randomUUID(), weight_kg: '', description: '' }
}

export function BookingForm({ defaultTripId }: { defaultTripId?: string }) {
  const router = useRouter()
  const { trips, loading: tripsLoading } = useTrips()

  const openTrips = trips.filter((t) => t.status === 'open' || (t.status === 'full' && t.max_containers - t.booking_count > 0))

  const [tripId,      setTripId]    = useState(defaultTripId ?? '')
  const [rows,        setRows]      = useState<ContainerRow[]>([newRow()])
  const [notes,       setNotes]     = useState('')
  const [confirmOpen, setConfirm]   = useState(false)
  const [submitting,  setSubmitting] = useState(false)

  const selectedTrip = openTrips.find((t) => t.id === tripId) ?? null

  const totalWeight    = rows.reduce((s, r) => s + (parseFloat(r.weight_kg) || 0), 0)
  const estimatedPrice = selectedTrip
    ? calculatePrice(selectedTrip.base_price, totalWeight, selectedTrip.per_kg_rate)
    : 0

  if (!tripId && openTrips.length > 0 && !tripsLoading) {
    setTripId(defaultTripId ?? openTrips[0].id)
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(id: string, field: 'weight_kg' | 'description', value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    )
  }

  function validate(): string | null {
    if (!tripId)           return 'Please select a trip.'
    if (rows.length === 0) return 'Add at least one container.'
    for (const r of rows) {
      const w = parseFloat(r.weight_kg)
      if (!r.weight_kg || isNaN(w) || w <= 0) return 'All containers must have a valid weight.'
    }
    return null
  }

  function handleSubmit() {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    setConfirm(true)
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          notes: notes || null,
          containers: rows.map((r) => ({
            weight_kg:   parseFloat(r.weight_kg),
            description: r.description || null,
          })),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Booking failed')
      }
      const data = await res.json() as { booking: { id: string } }
      toast.success('Booking submitted successfully!')
      setConfirm(false)
      router.push(`/company/bookings/${data.booking.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed')
      setSubmitting(false)
      setConfirm(false)
    }
  }

  if (tripsLoading) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  return (
    <div className="space-y-6">
      {}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#6B7280]">
          Select Trip
        </p>

        {openTrips.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No open trips available right now.</p>
        ) : (
          <div className="space-y-2">
            {openTrips.map((t) => {
              const available = t.max_containers - t.booking_count
              const selected  = tripId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTripId(t.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-[#4A90D9] bg-[#EFF6FF]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#4A90D9]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4A90D9]">{TRANSPORT_ICONS[t.transport_type]}</span>
                      <span className="font-semibold text-[#1B2E5E]">
                        {t.from_location} → {t.to_location}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                      <span>{available} slot{available !== 1 ? 's' : ''} left</span>
                      {selected && (
                        <span className="rounded-full bg-[#4A90D9] px-2 py-0.5 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-[#6B7280]">
                    <span>Departs {t.departure_date}</span>
                    <span>Arrives {t.arrival_date}</span>
                    <span>{formatPrice(t.base_price)} base + {formatPrice(t.per_kg_rate)}/kg</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
            Containers
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Container
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-start gap-3">
              <span className="mt-2.5 w-5 shrink-0 text-center text-xs font-medium text-[#6B7280]">
                {i + 1}
              </span>
              <div className="flex flex-1 flex-wrap gap-3">
                <div className="w-36">
                  <Label className="text-xs text-[#6B7280]">Weight (kg)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={row.weight_kg}
                    onChange={(e) => updateRow(row.id, 'weight_kg', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1 min-w-40">
                  <Label className="text-xs text-[#6B7280]">Description (optional)</Label>
                  <Input
                    placeholder="e.g. Textiles, Electronics…"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="mt-7 shrink-0 text-[#6B7280] hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">
          Notes (optional)
        </p>
        <Textarea
          placeholder="Any special handling instructions or notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B7280]">
          Price Estimate
        </p>
        {selectedTrip ? (
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Base price</span>
              <span>{formatPrice(selectedTrip.base_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">
                Weight ({totalWeight.toLocaleString()} kg × {formatPrice(selectedTrip.per_kg_rate)}/kg)
              </span>
              <span>{formatPrice(totalWeight * selectedTrip.per_kg_rate)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#E5E7EB] pt-2 font-semibold">
              <span className="text-[#1B2E5E]">Total</span>
              <span className="text-[#1B2E5E]">{formatPrice(estimatedPrice)}</span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Final price confirmed after booking is approved.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">Select a trip to see the price estimate.</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={openTrips.length === 0 || submitting}
          className="mt-5 w-full bg-[#1B2E5E] text-white hover:bg-[#152449]"
        >
          Submit Booking
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirm}
        title="Submit Booking"
        description={`Submit a booking for ${selectedTrip?.from_location} → ${selectedTrip?.to_location} with ${rows.length} container${rows.length !== 1 ? 's' : ''} (${totalWeight.toLocaleString()} kg total, estimated ${formatPrice(estimatedPrice)})?`}
        confirmLabel="Submit"
        onConfirm={handleConfirm}
        loading={submitting}
      />
    </div>
  )
}
