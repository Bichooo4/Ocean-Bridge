// Client Component — pricing plans management with live data.
// Uses usePricingPlans hook; toggle calls PATCH /api/pricing-plans/[id].
'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { buttonVariants } from '@/components/ui/button'
import { Badge }          from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'
import { usePricingPlans } from '@/hooks/usePricingPlans'
import type { PricingPlan, TransportType } from '@/types/database'

const TRANSPORT_LABELS: Record<TransportType, string> = {
  ship: 'Ship', truck: 'Truck', airplane: 'Airplane',
}

export default function AdminPricingPage() {
  const { plans, loading, error, refetch } = usePricingPlans()

  if (error) toast.error(error)

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/pricing-plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to update plan')
      }
      toast.success('Pricing plan updated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const columns = [
    { key: 'from_location',  header: 'From',       render: (r: PricingPlan) => <span className="font-medium">{r.from_location}</span> },
    { key: 'to_location',    header: 'To',         render: (r: PricingPlan) => r.to_location                                           },
    { key: 'transport_type', header: 'Transport',  render: (r: PricingPlan) => TRANSPORT_LABELS[r.transport_type]                      },
    { key: 'base_price',     header: 'Base Price', render: (r: PricingPlan) => formatPrice(r.base_price)                               },
    { key: 'per_kg_rate',    header: 'Per KG',     render: (r: PricingPlan) => formatPrice(r.per_kg_rate)                              },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: PricingPlan) => (
        <Badge
          variant="outline"
          className={r.is_active
            ? 'border-green-200 bg-green-100 text-green-800'
            : 'border-gray-200 bg-gray-100 text-gray-600'}
        >
          {r.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: PricingPlan) => (
        <button
          onClick={() => toggleActive(r.id, r.is_active)}
          className="text-xs font-medium text-[#4A90D9] hover:underline"
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Plans"
        subtitle={loading ? 'Loading…' : `${plans.length} plans configured`}
        action={
          <Link href="/admin/pricing/new" className={cn(buttonVariants(), 'bg-[#1B2E5E] text-white hover:bg-[#152449]')}>
            <Plus className="mr-2 h-4 w-4" />New Pricing Plan
          </Link>
        }
      />

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : <DataTable<PricingPlan> columns={columns} data={plans} emptyMessage="No pricing plans yet." />
      }
    </div>
  )
}
