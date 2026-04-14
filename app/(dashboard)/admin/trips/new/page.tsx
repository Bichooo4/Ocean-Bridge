// Admin — create new trip page.
// Form logic lives in TripForm component.
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { TripForm }   from '@/components/forms/TripForm'

export default function AdminNewTripPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/trips" className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline">
        <ArrowLeft className="h-3 w-3" /> Back to Trips
      </Link>
      <PageHeader title="New Trip" subtitle="Create a new shipping trip from a pricing plan" />
      <div className="mx-auto max-w-xl">
        <TripForm />
      </div>
    </div>
  )
}
