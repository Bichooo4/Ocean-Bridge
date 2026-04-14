/**
 * Pagination — prev / page-numbers / next controls.
 * Shows at most 5 page numbers centred around the current page.
 */
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page:       number      // 0-based current page
  totalPages: number
  total:      number      // total row count
  pageSize:   number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from  = page * pageSize + 1
  const to    = Math.min((page + 1) * pageSize, total)

  // Build window of at most 5 page indices
  const WINDOW = 5
  let start = Math.max(0, page - Math.floor(WINDOW / 2))
  const end = Math.min(totalPages - 1, start + WINDOW - 1)
  if (end - start < WINDOW - 1) start = Math.max(0, end - WINDOW + 1)
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className={cn('flex items-center justify-between gap-4 pt-4', className)}>
      {/* Row count */}
      <p className="text-sm text-[#6B7280]">
        Showing <span className="font-medium text-[#1B2E5E]">{from}–{to}</span> of{' '}
        <span className="font-medium text-[#1B2E5E]">{total}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1B2E5E] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {start > 0 && (
          <>
            <PageBtn n={0}    current={page} onClick={onPageChange} />
            {start > 1 && <span className="px-1 text-sm text-[#6B7280]">…</span>}
          </>
        )}

        {pageNumbers.map((n) => (
          <PageBtn key={n} n={n} current={page} onClick={onPageChange} />
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span className="px-1 text-sm text-[#6B7280]">…</span>}
            <PageBtn n={totalPages - 1} current={page} onClick={onPageChange} />
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1B2E5E] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PageBtn({
  n, current, onClick,
}: { n: number; current: number; onClick: (n: number) => void }) {
  const active = n === current
  return (
    <button
      onClick={() => onClick(n)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-sm font-medium transition',
        active
          ? 'border-[#1B2E5E] bg-[#1B2E5E] text-white'
          : 'border-[#E5E7EB] bg-white text-[#1B2E5E] hover:bg-[#F3F4F6]',
      )}
    >
      {n + 1}
    </button>
  )
}
