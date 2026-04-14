// Client hook — fetches trips from GET /api/trips with pagination.
// Companies see only open/full trips; admin/staff see all.
// Redirects to /login on 401 (session expired).
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Trip } from '@/types/database'

export interface TripWithCount extends Trip {
  booking_count: number
}

export interface PaginatedTrips {
  trips:      TripWithCount[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
  loading:    boolean
  error:      string | null
  refetch:    () => void
  setPage:    (page: number) => void
}

const DEFAULT_PAGE_SIZE = 50

export function useTrips(
  status?:       string,
  transportType?: string,
  pageSize:      number = DEFAULT_PAGE_SIZE,
): PaginatedTrips {
  const [trips,   setTrips]   = useState<TripWithCount[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetchTrips = useCallback(async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (status)        params.set('status',         status)
      if (transportType) params.set('transport_type', transportType)
      params.set('limit',  String(pageSize))
      params.set('offset', String(currentPage * pageSize))

      const res = await fetch(`/api/trips?${params.toString()}`)

      if (res.status === 401) {
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to fetch trips')
      }
      const data = await res.json() as { trips: TripWithCount[]; total: number }
      setTrips(data.trips)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [status, transportType, pageSize])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0)
  }, [status, transportType])

  useEffect(() => { fetchTrips(page) }, [fetchTrips, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSetPage(next: number) {
    const clamped = Math.max(0, Math.min(next, totalPages - 1))
    setPage(clamped)
  }

  return { trips, total, page, pageSize, totalPages, loading, error, refetch: () => fetchTrips(page), setPage: handleSetPage }
}
