// Client hook — fetches bookings from GET /api/bookings with pagination.
// RLS on the server scopes company users to their own bookings.
// Redirects to /login on 401 (session expired).
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Booking } from '@/types/database'

// Shape returned by the API — Booking enriched with joined display fields
export interface BookingWithDetails extends Booking {
  company_name:     string
  trip_route:       string
  trip_transport:   string
  containers_count: number
}

export interface PaginatedBookings {
  bookings:    BookingWithDetails[]
  total:       number
  page:        number
  pageSize:    number
  totalPages:  number
  loading:     boolean
  error:       string | null
  refetch:     () => void
  setPage:     (page: number) => void
}

const DEFAULT_PAGE_SIZE = 50

export function useBookings(
  status?:   string,
  tripId?:   string,
  fromDate?: string,
  toDate?:   string,
  pageSize:  number = DEFAULT_PAGE_SIZE,
): PaginatedBookings {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchBookings = useCallback(async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (status)   params.set('status',    status)
      if (tripId)   params.set('trip_id',   tripId)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate)   params.set('to_date',   toDate)
      params.set('limit',  String(pageSize))
      params.set('offset', String(currentPage * pageSize))

      const res = await fetch(`/api/bookings?${params.toString()}`)

      if (res.status === 401) {
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to fetch bookings')
      }
      const data = await res.json() as { bookings: BookingWithDetails[]; total: number }
      setBookings(data.bookings)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [status, tripId, fromDate, toDate, pageSize])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0)
  }, [status, tripId, fromDate, toDate])

  useEffect(() => { fetchBookings(page) }, [fetchBookings, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSetPage(next: number) {
    const clamped = Math.max(0, Math.min(next, totalPages - 1))
    setPage(clamped)
  }

  return {
    bookings,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    refetch: () => fetchBookings(page),
    setPage: handleSetPage,
  }
}
