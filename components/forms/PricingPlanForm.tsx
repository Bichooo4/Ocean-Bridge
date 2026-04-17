'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatPrice, calculatePrice } from '@/lib/utils'
import type { TransportType } from '@/types/database'

interface FormState {
  from_location:  string
  to_location:    string
  transport_type: TransportType | ''
  base_price:     string
  per_kg_rate:    string
}

interface FormErrors {
  from_location?:  string
  to_location?:    string
  transport_type?: string
  base_price?:     string
  per_kg_rate?:    string
}

const EXAMPLE_WEIGHT_KG = 1_000

function validate(form: FormState): FormErrors {
  const errs: FormErrors = {}
  if (form.from_location.trim().length < 2)
    errs.from_location = 'At least 2 characters required'
  if (form.to_location.trim().length < 2)
    errs.to_location = 'At least 2 characters required'
  if (form.from_location.trim().toLowerCase() === form.to_location.trim().toLowerCase())
    errs.to_location = 'Origin and destination must be different'
  if (!form.transport_type)
    errs.transport_type = 'Please select a transport type'
  const base = parseFloat(form.base_price)
  if (!form.base_price || isNaN(base) || base < 0)
    errs.base_price = 'Enter a valid base price (≥ 0)'
  const rate = parseFloat(form.per_kg_rate)
  if (!form.per_kg_rate || isNaN(rate) || rate < 0)
    errs.per_kg_rate = 'Enter a valid rate (≥ 0)'
  return errs
}

export function PricingPlanForm() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    from_location:  '',
    to_location:    '',
    transport_type: '',
    base_price:     '',
    per_kg_rate:    '',
  })
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const baseNum      = parseFloat(form.base_price)  || 0
  const perKgNum     = parseFloat(form.per_kg_rate) || 0
  const exampleTotal = calculatePrice(baseNum, EXAMPLE_WEIGHT_KG, perKgNum)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/pricing-plans', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_location:  form.from_location.trim(),
          to_location:    form.to_location.trim(),
          transport_type: form.transport_type,
          base_price:     baseNum,
          per_kg_rate:    perKgNum,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg  = (body as { error?: string }).error ?? 'Failed to create pricing plan'

        if (msg.toLowerCase().includes('different')) {
          setErrors({ to_location: msg })
        } else {
          toast.error(msg)
        }
        return
      }
      toast.success('Pricing plan created')
      router.push('/admin/pricing')
    } catch {
      toast.error('Failed to create pricing plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="from_location">From Location</Label>
            <Input
              id="from_location"
              placeholder="e.g. Barcelona"
              value={form.from_location}
              onChange={handleChange('from_location')}
              disabled={loading}
              className={errors.from_location ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.from_location && <p className="text-xs text-red-500">{errors.from_location}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to_location">To Location</Label>
            <Input
              id="to_location"
              placeholder="e.g. Casablanca"
              value={form.to_location}
              onChange={handleChange('to_location')}
              disabled={loading}
              className={errors.to_location ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.to_location && <p className="text-xs text-red-500">{errors.to_location}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transport_type">Transport Type</Label>
          <select
            id="transport_type"
            value={form.transport_type}
            onChange={handleChange('transport_type')}
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40 ${
              errors.transport_type ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            <option value="">Select transport type…</option>
            <option value="ship">Ship</option>
            <option value="truck">Truck</option>
            <option value="airplane">Airplane</option>
          </select>
          {errors.transport_type && <p className="text-xs text-red-500">{errors.transport_type}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="base_price">Fixed Base Price (USD)</Label>
            <Input
              id="base_price"
              type="number"
              min={0}
              step="0.01"
              placeholder="1200"
              value={form.base_price}
              onChange={handleChange('base_price')}
              disabled={loading}
              className={errors.base_price ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.base_price && <p className="text-xs text-red-500">{errors.base_price}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="per_kg_rate">Price per Kilogram (USD)</Label>
            <Input
              id="per_kg_rate"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.85"
              value={form.per_kg_rate}
              onChange={handleChange('per_kg_rate')}
              disabled={loading}
              className={errors.per_kg_rate ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.per_kg_rate && <p className="text-xs text-red-500">{errors.per_kg_rate}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/pricing')}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1B2E5E] text-white hover:bg-[#152449]"
          >
            {loading
              ? <><LoadingSpinner size="sm" className="mr-2" />Creating…</>
              : 'Create Pricing Plan'
            }
          </Button>
        </div>
      </form>

      {}
      <div className="rounded-xl border border-[#4A90D9]/30 bg-[#EFF6FF] p-5">
        <p className="mb-3 text-sm font-semibold text-[#1B2E5E]">
          Live Preview — Example: {EXAMPLE_WEIGHT_KG.toLocaleString()} kg shipment
        </p>
        <div className="space-y-1.5 text-sm text-[#6B7280]">
          <div className="flex justify-between">
            <span>Base price</span>
            <span className="font-medium text-[#1B2E5E]">{formatPrice(baseNum)}</span>
          </div>
          <div className="flex justify-between">
            <span>{EXAMPLE_WEIGHT_KG.toLocaleString()} kg × {formatPrice(perKgNum)}/kg</span>
            <span className="font-medium text-[#1B2E5E]">{formatPrice(perKgNum * EXAMPLE_WEIGHT_KG)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-[#4A90D9]/20 pt-2">
            <span className="font-semibold text-[#1B2E5E]">Total</span>
            <span className="text-lg font-bold text-[#1B2E5E]">{formatPrice(exampleTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
