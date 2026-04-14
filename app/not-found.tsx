// Server Component — custom 404 page.
// Rendered by Next.js when notFound() is called or a route doesn't match.

import Link from 'next/link'
import { Ship } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
        <Ship className="h-8 w-8 text-[#4A90D9]" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-[#4A90D9]">404</p>
      <h1 className="mt-2 text-2xl font-bold text-[#1B2E5E]">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-[#1B2E5E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#152449]"
      >
        Go back home
      </Link>
    </div>
  )
};