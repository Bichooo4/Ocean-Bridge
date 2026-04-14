// Client Component — admin invoices with live data.
// Uses useInvoices hook; toggle calls PATCH /api/invoices/[id].
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatCard }       from '@/components/shared/StatCard'
import { ConfirmDialog }  from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge }          from '@/components/ui/badge'
import { Input }          from '@/components/ui/input'
import { formatPrice, formatDate }               from '@/lib/utils'
import { Pagination }                              from '@/components/shared/Pagination'
import { useInvoices, type InvoiceWithDetails }    from '@/hooks/useInvoices'
import type { InvoiceStatus } from '@/types/database'

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  unpaid:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid:      'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="outline" className={INVOICE_STATUS_COLORS[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const STATUS_OPTIONS: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All Statuses' },
  { value: 'unpaid',    label: 'Unpaid'       },
  { value: 'paid',      label: 'Paid'         },
  { value: 'cancelled', label: 'Cancelled'    },
]

export default function AdminInvoicesPage() {
  const [search,       setSearch]   = useState('')
  const [status,       setStatus]   = useState<InvoiceStatus | 'all'>('all')
  const [dateFrom,     setDateFrom] = useState('')
  const [dateTo,       setDateTo]   = useState('')
  const [toggleTarget, setToggle]   = useState<string | null>(null)
  const [toggling,     setToggling] = useState(false)

  // Pass server-filterable params to the hook; text search stays client-side.
  const {
    invoices, total: totalCount, page, pageSize, totalPages, loading, error, refetch, setPage,
  } = useInvoices(
    status   !== 'all' ? status   : undefined,
    dateFrom || undefined,
    dateTo   || undefined,
  )

  if (error) toast.error(error)

  // Aggregate over the current page only (use the Reports page for full totals)
  const totalAmt  = invoices.reduce((s, i) => s + i.total_price, 0)
  const paid      = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total_price, 0)
  const unpaid    = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.total_price, 0)

  const filtered = invoices.filter((i) =>
    search === '' || i.company_name.toLowerCase().includes(search.toLowerCase()),
  )

  const targetInv = invoices.find((i) => i.id === toggleTarget)

  async function handleToggle() {
    if (!toggleTarget || !targetInv) return
    setToggling(true)
    try {
      const newStatus = targetInv.status === 'paid' ? 'unpaid' : 'paid'
      const res = await fetch(`/api/invoices/${toggleTarget}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Update failed')
      }
      toast.success('Invoice status updated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setToggling(false)
      setToggle(null)
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'Invoice #',
      render: (r: InvoiceWithDetails) => (
        <span className="font-mono text-xs font-semibold text-[#1B2E5E]">
          INV-{r.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    { key: 'company_name', header: 'Company',   render: (r: InvoiceWithDetails) => <span className="font-medium">{r.company_name}</span>                              },
    { key: 'booking_id',   header: 'Booking',   render: (r: InvoiceWithDetails) => <span className="font-mono text-xs text-[#6B7280]">{r.booking_id.toUpperCase()}</span> },
    { key: 'total_price',  header: 'Amount',    render: (r: InvoiceWithDetails) => <span className="font-semibold">{formatPrice(r.total_price)}</span>                 },
    { key: 'status',       header: 'Status',    render: (r: InvoiceWithDetails) => <InvoiceBadge status={r.status as InvoiceStatus} />                                },
    { key: 'issued_at',    header: 'Issued',    render: (r: InvoiceWithDetails) => formatDate(r.issued_at)                                                            },
    { key: 'paid_at',      header: 'Paid Date', render: (r: InvoiceWithDetails) => r.paid_at ? formatDate(r.paid_at) : '—'                                           },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: InvoiceWithDetails) =>
        r.status !== 'cancelled' ? (
          <button
            onClick={() => setToggle(r.id)}
            className="text-xs font-medium text-[#4A90D9] hover:underline"
          >
            Mark {r.status === 'paid' ? 'Unpaid' : 'Paid'}
          </button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle={loading ? 'Loading…' : `${totalCount} invoices total`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Invoiced (page)" value={formatPrice(totalAmt)} icon={<DollarSign className="h-5 w-5 text-[#4A90D9]" />} />
        <StatCard label="Paid (page)"           value={formatPrice(paid)}     icon={<TrendingUp  className="h-5 w-5 text-[#22C55E]" />} />
        <StatCard label="Unpaid (page)"         value={formatPrice(unpaid)}   icon={<Clock       className="h-5 w-5 text-[#F59E0B]" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search company…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-38" />
        <Input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="w-38" />
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : (
          <>
            <DataTable<InvoiceWithDetails>
              columns={columns}
              data={filtered}
              emptyMessage="No invoices match your filters."
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )
      }

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => { if (!o) setToggle(null) }}
        title={`Mark Invoice ${targetInv?.status === 'paid' ? 'Unpaid' : 'Paid'}`}
        description={`Update invoice INV-${(toggleTarget ?? '').slice(-6).toUpperCase()} to ${targetInv?.status === 'paid' ? 'unpaid' : 'paid'}?`}
        confirmLabel="Confirm"
        onConfirm={handleToggle}
        loading={toggling}
      />
    </div>
  )
}
