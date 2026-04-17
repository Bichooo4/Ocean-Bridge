'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatCard }       from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge }          from '@/components/ui/badge'
import { Input }          from '@/components/ui/input'
import { formatPrice, formatDate } from '@/lib/utils'
import { useInvoices, type InvoiceWithDetails } from '@/hooks/useInvoices'
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

export default function CompanyInvoicesPage() {
  const { invoices, loading, error } = useInvoices()

  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  if (error) toast.error(error)

  const total  = invoices.reduce((s, i) => s + i.total_price, 0)
  const paid   = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total_price, 0)
  const unpaid = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.total_price, 0)

  const filtered = invoices.filter((i) => {
    const matchStatus = status === 'all' || i.status === status
    const matchSearch = search === '' || i.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const columns = [
    {
      key: 'id',
      header: 'Invoice #',
      render: (i: InvoiceWithDetails) => (
        <span className="font-mono text-xs font-semibold text-[#1B2E5E]">
          INV-{i.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'booking_id',
      header: 'Booking',
      render: (i: InvoiceWithDetails) => (
        <span className="font-mono text-xs text-[#6B7280]">{i.booking_id.toUpperCase()}</span>
      ),
    },
    {
      key: 'total_price',
      header: 'Amount',
      render: (i: InvoiceWithDetails) => <span className="font-semibold">{formatPrice(i.total_price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (i: InvoiceWithDetails) => <InvoiceBadge status={i.status as InvoiceStatus} />,
    },
    {
      key: 'issued_at',
      header: 'Issued',
      render: (i: InvoiceWithDetails) => formatDate(i.issued_at),
    },
    {
      key: 'paid_at',
      header: 'Paid Date',
      render: (i: InvoiceWithDetails) => (i.paid_at ? formatDate(i.paid_at) : '—'),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices"
        subtitle={loading ? 'Loading…' : `${invoices.length} invoices total`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Invoiced" value={formatPrice(total)}  icon={<DollarSign   className="h-5 w-5 text-[#4A90D9]" />} />
        <StatCard label="Paid"           value={formatPrice(paid)}   icon={<CheckCircle  className="h-5 w-5 text-[#22C55E]" />} />
        <StatCard label="Outstanding"    value={formatPrice(unpaid)} icon={<Clock        className="h-5 w-5 text-[#F59E0B]" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search invoice #…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : <DataTable<InvoiceWithDetails> columns={columns} data={filtered} emptyMessage="No invoices match your filters." />
      }

      {!loading && unpaid > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          You have {formatPrice(unpaid)} in outstanding invoices. Please contact us to arrange payment.
        </div>
      )}
    </div>
  )
}
