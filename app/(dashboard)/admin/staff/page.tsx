'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { createClient }   from '@/lib/supabase/client'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StaffForm }      from '@/components/forms/StaffForm'
import { Button }         from '@/components/ui/button'
import { Badge }          from '@/components/ui/badge'
import { formatDate }     from '@/lib/utils'
import type { User }      from '@/types/database'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminStaffPage() {
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers((data ?? []) as User[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const columns = [
    {
      key: 'full_name',
      header: 'Name',
      render: (r: User) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B2E5E] text-xs font-bold text-white">
            {getInitials(r.full_name)}
          </div>
          <span className="font-medium">{r.full_name}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (r: User) => (
        <Badge
          variant="outline"
          className={r.role === 'admin'
            ? 'border-blue-200 bg-blue-100 text-blue-800'
            : 'border-sky-200 bg-sky-100 text-sky-800'}
        >
          {r.role === 'admin' ? 'Admin' : 'Staff'}
        </Badge>
      ),
    },
    { key: 'phone',      header: 'Phone',  render: (r: User) => r.phone ?? '—'           },
    { key: 'created_at', header: 'Joined', render: (r: User) => formatDate(r.created_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle={loading ? 'Loading…' : `${users.length} team members`}
        action={
          <Button onClick={() => setOpen(true)} className="bg-[#1B2E5E] text-white hover:bg-[#152449]">
            <Plus className="mr-2 h-4 w-4" />Add Staff Member
          </Button>
        }
      />

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : <DataTable<User> columns={columns} data={users} emptyMessage="No team members found." />
      }

      <StaffForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
