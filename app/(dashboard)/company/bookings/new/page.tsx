import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader }    from '@/components/shared/PageHeader'
import { BookingForm }   from '@/components/forms/BookingForm'

export default async function CompanyNewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>
}) {
  const { trip_id } = await searchParams

  return (
    <div className="space-y-6">
      <Link
        href="/company/bookings"
        className="flex items-center gap-1 text-sm text-[#4A90D9] hover:underline"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Bookings
      </Link>

      <PageHeader
        title="New Booking"
        subtitle="Select a trip and add your containers"
      />

      <div className="max-w-2xl">
        <BookingForm defaultTripId={trip_id} />
      </div>
    </div>
  )
}
