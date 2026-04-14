'use client'
// Global error boundary — catches unhandled runtime errors across the app.
// Next.js renders this when an error is thrown in a Server Component or
// during rendering. The reset() function re-renders the failed subtree.

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2E5E]">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
            An unexpected error occurred. Our team has been notified.
          </p>
          <Button
            onClick={reset}
            className="mt-6 bg-[#1B2E5E] text-white hover:bg-[#152449]"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
