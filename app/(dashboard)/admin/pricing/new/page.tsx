// Admin — create new pricing plan page.
// Form logic lives in PricingPlanForm component.
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader }      from '@/components/shared/PageHeader'
import { PricingPlanForm } from '@/components/forms/PricingPlanForm'

export default function AdminNewPricingPlanPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/pricing" className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline">
        <ArrowLeft className="h-3 w-3" /> Back to Pricing
      </Link>
      <PageHeader title="New Pricing Plan" subtitle="Define a route and pricing structure" />
      <PricingPlanForm />
    </div>
  )
}
