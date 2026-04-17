'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  userName: string
  userEmail: string
  role: 'admin' | 'staff' | 'company'
}

export function DashboardLayout({
  children,
  title,
  userName,
  userEmail,
  role,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      {}
      <div className="hidden shrink-0 md:flex">
        <Sidebar role={role} userName={userName} userEmail={userEmail} />
      </div>

      {}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            role={role}
            userName={userName}
            userEmail={userEmail}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          title={title}
          userName={userName}
          userEmail={userEmail}
          role={role}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
