import { Info } from 'lucide-react'
import { PageHeader }   from '@/components/shared/PageHeader'
import { TripsFilter }  from '@/components/shared/TripsFilter'

export default function StaffTripsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="All Trips"
        subtitle="View all scheduled trips and their capacity"
      />

      {}
      <div className="flex items-start gap-3 rounded-xl border border-[#4A90D9]/30 bg-[#EFF6FF] px-4 py-3 text-sm text-[#1B2E5E]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#4A90D9]" />
        <p>
          You can view trip details but cannot create or modify trips.
          Contact an admin to add new trips.
        </p>
      </div>

      <TripsFilter />
    </div>
  )
}
