'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UserRole } from '@/types/database'

interface FormState {
  full_name: string
  email:     string
  phone:     string
  role:      UserRole
  password:  string
}

interface FormErrors {
  full_name?: string
  email?:     string
  password?:  string
}

const EMPTY: FormState = {
  full_name: '', email: '', phone: '', role: 'staff', password: '',
}

function validate(form: FormState): FormErrors {
  const errs: FormErrors = {}
  if (form.full_name.trim().length < 2)
    errs.full_name = 'At least 2 characters required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Enter a valid email address'
  if (form.password.length < 8)
    errs.password = 'Password must be at least 8 characters'
  return errs
}

interface StaffFormProps {
  open:       boolean
  onOpenChange: (open: boolean) => void
  onSuccess:  () => void
}

export function StaffForm({ open, onOpenChange, onSuccess }: StaffFormProps) {
  const [form,       setForm]       = useState<FormState>(EMPTY)
  const [errors,     setErrors]     = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleClose() {
    if (submitting) return
    setForm(EMPTY)
    setErrors({})
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/staff', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? 'Create failed')
      }
      toast.success(`Account created for ${form.full_name}`)
      setForm(EMPTY)
      setErrors({})
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
        </DialogHeader>

        <form id="staff-form" onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sf-full_name">Full Name</Label>
            <Input
              id="sf-full_name"
              placeholder="Jane Smith"
              value={form.full_name}
              onChange={handleChange('full_name')}
              disabled={submitting}
              className={errors.full_name ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-email">Email</Label>
            <Input
              id="sf-email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange('email')}
              disabled={submitting}
              className={errors.email ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-phone">
              Phone <span className="font-normal text-[#6B7280]">(optional)</span>
            </Label>
            <Input
              id="sf-phone"
              type="tel"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={handleChange('phone')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-role">Role</Label>
            <select
              id="sf-role"
              value={form.role}
              onChange={handleChange('role')}
              disabled={submitting}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-password">Temporary Password</Label>
            <Input
              id="sf-password"
              type="text"
              placeholder="Min. 8 characters"
              minLength={8}
              value={form.password}
              onChange={handleChange('password')}
              disabled={submitting}
              className={errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            form="staff-form"
            type="submit"
            disabled={submitting}
            className="bg-[#1B2E5E] text-white hover:bg-[#152449]"
          >
            {submitting
              ? <><LoadingSpinner size="sm" className="mr-2" />Creating…</>
              : 'Create Account'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
