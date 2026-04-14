// Client hook — fetches invoices from GET /api/invoices with pagination.
// RLS on the server scopes company users to their own invoices.
// Redirects to /login on 401 (session expired).
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Invoice } from '@/types/database'

export interface InvoiceWithDetails extends Invoice {
  company_name:  string
  booking_short: string
}

export interface PaginatedInvoices {
  invoices:   InvoiceWithDetails[]
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

export function useInvoices(
  status?:   string,
  fromDate?: string,
  toDate?:   string,
  pageSize:  number = DEFAULT_PAGE_SIZE,
): PaginatedInvoices {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchInvoices = useCallback(async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (status)   params.set('status',    status)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate)   params.set('to_date',   toDate)
      params.set('limit',  String(pageSize))
      params.set('offset', String(currentPage * pageSize))

      const res = await fetch(`/api/invoices?${params.toString()}`)

      if (res.status === 401) {
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to fetch invoices')
      }
      const data = await res.json() as { invoices: InvoiceWithDetails[]; total: number }
      setInvoices(data.invoices)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [status, fromDate, toDate, pageSize])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0)
  }, [status, fromDate, toDate])

  useEffect(() => { fetchInvoices(page) }, [fetchInvoices, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSetPage(next: number) {
    const clamped = Math.max(0, Math.min(next, totalPages - 1))
    setPage(clamped)
  }

  return { invoices, total, page, pageSize, totalPages, loading, error, refetch: () => fetchInvoices(page), setPage: handleSetPage }
}
