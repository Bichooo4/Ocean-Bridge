// Client Component — needs usePathname for active link detection
// Main sidebar navigation. Renders different nav items based on user role.
// Used inside DashboardLayout.
// onNavClick: called when a link is clicked (used to close mobile sheet).
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Ship,
  Package,
  Tag,
  Users,
  FileText,
  BarChart2,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { ADMIN_NAV, STAFF_NAV, COMPANY_NAV } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const ICON_MAP = {
  LayoutDashboard,
  Ship,
  Package,
  Tag,
  Users,
  FileText,
  BarChart2,
} as const

type IconName = keyof typeof ICON_MAP

interface SidebarProps {
  role:        'admin' | 'staff' | 'company'
  userName:    string
  userEmail:   string
  onNavClick?: () => void
}

function getNavItems(role: SidebarProps['role']) {
  if (role === 'admin') return ADMIN_NAV
  if (role === 'staff') return STAFF_NAV
  return COMPANY_NAV
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Sidebar({ role, userName, userEmail, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const navItems = getNavItems(role)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-[#1B2E5E]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo size="sm" white />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon as IconName]
            const isActive =
              item.href === `/${role}`
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#4A90D9] text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A90D9] text-xs font-bold text-white">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-white/60">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
