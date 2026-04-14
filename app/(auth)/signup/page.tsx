// Client Component — needs useState for multi-field form management
// Company self-registration page. Admin and staff are NOT created here.
// POSTs to /api/auth/signup (server route) which uses the adminClient to set
// role in app_metadata — the only field that cannot be self-modified by users.
// DB trigger handle_new_auth_user() auto-inserts into companies table.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'

interface FormData {
  company_name: string
  contact_name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  company_name?: string
  contact_name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const INITIAL_FORM: FormData = {
  company_name: '',
  contact_name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (data.company_name.trim().length < 2)
    errors.company_name = 'Company name must be at least 2 characters.'
  if (data.contact_name.trim().length < 2)
    errors.contact_name = 'Contact name must be at least 2 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Please enter a valid email address.'
  if (data.password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.'

  return errors
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      // POST to server route — role is set in app_metadata (server-only writable)
      // so users cannot escalate their own privileges via supabase.auth.updateUser().
      const res = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        formData.email,
          password:     formData.password,
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          phone:        formData.phone || null,
        }),
      })

      const body = await res.json()

      if (!res.ok) {
        setError((body as { error?: string }).error ?? 'Registration failed.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#1B2E5E]">Check your email!</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            We sent a confirmation link to <strong>{formData.email}</strong>.
            Click it to activate your account.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-[#4A90D9] hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2E5E]">Create your account</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Join Ocean Bridge and start shipping</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Acme Shipping Co."
            value={formData.company_name}
            onChange={handleChange('company_name')}
            disabled={loading}
            className={cn(errors.company_name && 'border-red-400 focus-visible:ring-red-400')}
          />
          {errors.company_name && (
            <p className="text-xs text-red-600">{errors.company_name}</p>
          )}
        </div>

        {/* Contact Name */}
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Contact Person Name</Label>
          <Input
            id="contact_name"
            type="text"
            placeholder="John Smith"
            value={formData.contact_name}
            onChange={handleChange('contact_name')}
            disabled={loading}
            className={cn(errors.contact_name && 'border-red-400 focus-visible:ring-red-400')}
          />
          {errors.contact_name && (
            <p className="text-xs text-red-600">{errors.contact_name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone Number{' '}
            <span className="font-normal text-[#6B7280]">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@company.com"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={loading}
            autoComplete="email"
            className={cn(errors.email && 'border-red-400 focus-visible:ring-red-400')}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={loading}
              autoComplete="new-password"
              className={cn(
                'pr-10',
                errors.password && 'border-red-400 focus-visible:ring-red-400',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2E5E]"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading}
              autoComplete="new-password"
              className={cn(
                'pr-10',
                errors.confirmPassword && 'border-red-400 focus-visible:ring-red-400',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2E5E]"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B2E5E] hover:bg-[#152449] text-white"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Already have an account?{' '}
        <Link
          href="/login"
          className={cn(
            'font-medium text-[#4A90D9] hover:underline',
            loading && 'pointer-events-none opacity-50',
          )}
        >
          Sign in →
        </Link>
      </p>
    </div>
  )
}
