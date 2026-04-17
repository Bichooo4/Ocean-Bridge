'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Ship, Truck, Plane } from 'lucide-react'
import { Button }          from '@/components/ui/button'
import { Input }           from '@/components/ui/input'
import { Label }           from '@/components/ui/label'
import { LoadingSpinner }  from '@/components/shared/LoadingSpinner'
import { usePricingPlans } from '@/hooks/usePricingPlans'
import { formatPrice }     from '@/lib/utils'
import type { TransportType } from '@/types/database'

interface FormState {
  pricing_plan_id: string
  departure_date:  string
  arrival_date:    string
  max_containers:  string
}

interface FormErrors {
  pricing_plan_id?: string
  departure_date?:  string
  arrival_date?:    string
  max_containers?:  string
}

const TRANSPORT_LABELS: Record<TransportType, string> = {
  ship: 'Ship', truck: 'Truck', airplane: 'Airplane',
}

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  ship:     <Ship     className="h-4 w-4 text-[#4A90D9]" />,
  truck:    <Truck    className="h-4 w-4 text-[#4A90D9]" />,
  airplane: <Plane    className="h-4 w-4 text-[#4A90D9]" />,
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function dayAfter(date: string): string {
  if (!date) return tomorrow()
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function TripForm() {
  const router = useRouter()
  const { plans, loading: plansLoading } = usePricingPlans()

  const [form, setForm]     = useState<FormState>({
    pricing_plan_id: '',
    departure_date:  '',
    arrival_date:    '',
    max_containers:  '10',
  })
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const activePlans  = plans.filter((p) => p.is_active)
  const selectedPlan = activePlans.find((p) => p.id === form.pricing_plan_id) ?? null

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        if (field === 'departure_date' && next.arrival_date && next.arrival_date <= value) {
          next.arrival_date = ''
        }
        return next
      })
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.pricing_plan_id) {
      errs.pricing_plan_id = 'Please select a pricing plan'
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!form.departure_date) {
      errs.departure_date = 'Departure date is required'
    } else if (new Date(form.departure_date) <= today) {
      errs.departure_date = 'Departure date must be in the future'
    }
    if (!form.arrival_date) {
      errs.arrival_date = 'Arrival date is required'
    } else if (form.departure_date && form.arrival_date <= form.departure_date) {
      errs.arrival_date = 'Arrival date must be after departure date'
    }
    const maxC = parseInt(form.max_containers, 10)
    if (!form.max_containers || isNaN(maxC) || maxC < 1) {
      errs.max_containers = 'Must be at least 1'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/trips', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricing_plan_id: form.pricing_plan_id,
          departure_date:  form.departure_date,
          arrival_date:    form.arrival_date,
          max_containers:  parseInt(form.max_containers, 10),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg  = (body as { error?: string }).error ?? 'Failed to create trip'
        if (msg.toLowerCase().includes('departure')) {
          setErrors({ departure_date: msg })
        } else if (msg.toLowerCase().includes('arrival')) {
          setErrors({ arrival_date: msg })
        } else {
          toast.error(msg)
        }
        return
      }
      toast.success('Trip created successfully')
      router.push('/admin/trips')
    } catch {
      toast.error('Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  if (plansLoading) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (activePlans.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
        No active pricing plans found.{' '}
        <Link href="/admin/pricing/new" className="text-[#4A90D9] hover:underline">
          Create one first.
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">

      {}
      <div className="space-y-1.5">
        <Label htmlFor="pricing_plan_id">Pricing Plan</Label>
        <select
          id="pricing_plan_id"
          value={form.pricing_plan_id}
          onChange={handleChange('pricing_plan_id')}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40 ${
            errors.pricing_plan_id ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
          }`}
        >
          <option value="">Select a pricing plan…</option>
          {activePlans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.from_location} → {p.to_location} ({TRANSPORT_LABELS[p.transport_type]})
            </option>
          ))}
        </select>
        {errors.pricing_plan_id && (
          <p className="text-xs text-red-500">{errors.pricing_plan_id}</p>
        )}
      </div>

      {}
      {selectedPlan && (
        <div className="flex items-start gap-3 rounded-lg border border-[#4A90D9]/20 bg-[#EFF6FF] p-4 text-sm">
          <div className="mt-0.5">{TRANSPORT_ICONS[selectedPlan.transport_type]}</div>
          <div className="space-y-0.5">
            <p className="font-semibold text-[#1B2E5E]">
              {selectedPlan.from_location} → {selectedPlan.to_location}
            </p>
            <p className="font-medium text-[#4A90D9]">{TRANSPORT_LABELS[selectedPlan.transport_type]}</p>
            <p className="text-[#6B7280]">
              {formatPrice(selectedPlan.base_price)} base &nbsp;·&nbsp; {formatPrice(selectedPlan.per_kg_rate)}/kg
            </p>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="departure_date">Departure Date</Label>
          <Input
            id="departure_date"
            type="date"
            value={form.departure_date}
            min={tomorrow()}
            onChange={handleChange('departure_date')}
            className={errors.departure_date ? 'border-red-400 bg-red-50 focus-visible:ring-red-300' : ''}
          />
          {errors.departure_date
            ? <p className="text-xs text-red-500">{errors.departure_date}</p>
            : <p className="text-xs text-[#6B7280]">Must be a future date</p>
          }
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="arrival_date">Arrival Date</Label>
          <Input
            id="arrival_date"
            type="date"
            value={form.arrival_date}
            min={form.departure_date ? dayAfter(form.departure_date) : tomorrow()}
            onChange={handleChange('arrival_date')}
            disabled={!form.departure_date}
            className={errors.arrival_date ? 'border-red-400 bg-red-50 focus-visible:ring-red-300' : ''}
          />
          {errors.arrival_date
            ? <p className="text-xs text-red-500">{errors.arrival_date}</p>
            : <p className="text-xs text-[#6B7280]">{form.departure_date ? 'Must be after departure' : 'Select departure first'}</p>
          }
        </div>
      </div>

      {}
      <div className="space-y-1.5">
        <Label htmlFor="max_containers">Max Containers</Label>
        <Input
          id="max_containers"
          type="number"
          min={1}
          max={500}
          value={form.max_containers}
          onChange={handleChange('max_containers')}
          className={errors.max_containers ? 'border-red-400 bg-red-50 focus-visible:ring-red-300' : ''}
        />
        {errors.max_containers && (
          <p className="text-xs text-red-500">{errors.max_containers}</p>
        )}
      </div>

      {}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/trips')}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !selectedPlan}
          className="flex-1 bg-[#1B2E5E] text-white hover:bg-[#152449]"
        >
          {loading
            ? <><LoadingSpinner size="sm" className="mr-2" />Creating…</>
            : 'Create Trip'
          }
        </Button>
      </div>
    </form>
  )
}
