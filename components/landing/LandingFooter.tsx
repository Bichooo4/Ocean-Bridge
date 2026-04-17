import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

const PLATFORM_LINKS = [
  { label: 'Features',    href: '#features'     },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Sign In',     href: '/login'         },
  { label: 'Get Started', href: '/signup'        },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '#' },
  { label: 'Terms of Service', href: '#' },
]

export function LandingFooter() {
  return (
    <footer className="bg-[#0F1E3D]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {}
        <div className="grid gap-10 md:grid-cols-3">
          {}
          <div className="flex flex-col gap-4">
            <Logo size="lg" white />
            <p className="text-sm text-white/50">Move Smart · Ship Strong</p>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} Ocean Bridge. All rights reserved.
            </p>
          </div>

          {}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              Platform
            </p>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/30">
            Built for modern logistics teams worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
