// Client hook — fetches pricing plans from GET /api/pricing-plans with pagination.
// Admin sees all plans; others see only active.
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { PricingPlan } from '@/types/database'

export interface PaginatedPricingPlans {
  plans:      PricingPlan[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
  loading:    boolean
  error:      string | null
  refetch:    () => void
  setPage:    (page: number) => void
}

const DEFAULT_PAGE_SIZE = 100

export function usePricingPlans(pageSize: number = DEFAULT_PAGE_SIZE): PaginatedPricingPlans {
  const [plans,   setPlans]   = useState<PricingPlan[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetchPlans = useCallback(async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit',  String(pageSize))
      params.set('offset', String(currentPage * pageSize))

      const res = await fetch(`/api/pricing-plans?${params.toString()}`)

      if (res.status === 401) {
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to fetch pricing plans')
      }
      const data = await res.json() as { plans: PricingPlan[]; total: number }
      setPlans(data.plans)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => { fetchPlans(page) }, [fetchPlans, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSetPage(next: number) {
    const clamped = Math.max(0, Math.min(next, totalPages - 1))
    setPage(clamped)
  }

  return { plans, total, page, pageSize, totalPages, loading, error, refetch: () => fetchPlans(page), setPage: handleSetPage }
}
