import { Ship } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'lg'
  className?: string
  white?: boolean
}

export function Logo({ size = 'sm', className, white = false }: LogoProps) {
  const isLg = size === 'lg'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Ship
        className={cn(
          white ? 'text-white' : 'text-[#1B2E5E]',
          isLg ? 'h-8 w-8' : 'h-5 w-5',
        )}
        strokeWidth={2}
      />
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            'font-bold tracking-tight',
            white ? 'text-white' : 'text-[#1B2E5E]',
            isLg ? 'text-2xl' : 'text-base',
          )}
        >
          Ocean Bridge
        </span>
        {isLg && (
          <span className={cn('text-xs font-medium', white ? 'text-white/70' : 'text-[#4A90D9]')}>
            Move Smart · Ship Strong
          </span>
        )}
      </div>
    </div>
  )
}
