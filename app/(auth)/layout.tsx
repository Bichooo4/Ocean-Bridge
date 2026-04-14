// Server Component
// Shared layout for all auth pages (login, signup).
// Split screen: navy branding panel on left, form on right.
// Left panel is hidden on mobile — form takes full width.

import { CheckCircle } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

const FEATURES = [
  'Track your shipments in real time',
  'Manage bookings with ease',
  'Get instant invoice summaries',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden flex-col justify-between bg-[#1B2E5E] p-10 md:flex md:w-1/2 lg:w-2/5">
        <div className="flex flex-1 flex-col items-center justify-center gap-10">
          <Logo size="lg" white />

          <ul className="w-full max-w-xs space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/90">
                <CheckCircle className="h-5 w-5 shrink-0 text-[#4A90D9]" />
                <span className="text-sm font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} Ocean Bridge. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}
