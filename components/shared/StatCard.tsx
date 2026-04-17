import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  className?: string
}

export function StatCard({ label, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm',
        className,
      )}
    >
      {}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
        {icon}
      </div>

      {}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
        <p className="mt-1 text-2xl font-bold text-[#1B2E5E]">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]',
            )}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}
