'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function getRedirectPath(type: string | undefined): string {
  if (type === 'admin') return '/admin'
  if (type === 'staff') return '/staff'
  if (type === 'company') return '/company'
  return '/login'
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      const userType = data.user?.app_metadata?.role as string | undefined
      router.push(getRedirectPath(userType))
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2E5E]">Welcome back</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Sign in to your Ocean Bridge account</p>
      </div>

      {}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="pr-10"
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
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {}
      <p className="mt-6 text-center text-sm text-[#6B7280]">
        New company?{' '}
        <Link
          href="/signup"
          className={cn(
            'font-medium text-[#4A90D9] hover:underline',
            loading && 'pointer-events-none opacity-50',
          )}
        >
          Create an account →
        </Link>
      </p>
    </div>
  )
}
