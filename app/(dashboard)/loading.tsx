import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
