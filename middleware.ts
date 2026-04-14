/**
 * Auth + role-based route protection middleware
 * Runs on the Edge runtime BEFORE every page render.
 *
 * Rules:
 *   - Public routes  (/  /login  /signup)  → always allowed
 *   - Protected routes → must be authenticated
 *   - /admin/*  → app_metadata.role must be 'admin'
 *   - /staff/*  → app_metadata.role must be 'staff'
 *   - /company/* → app_metadata.role must be 'company'
 *   - Authenticated users visiting /login or /signup → redirect to their dashboard
 *
 * Role is read from app_metadata (set ONLY via service role on the server).
 * Users cannot tamper with app_metadata — it is never writable by the client.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that anyone can access without being logged in
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth/callback']

// Routes that redirect authenticated users away (auth pages)
const AUTH_ROUTES = ['/login', '/signup']

// Default landing route per user type
function getDefaultRoute(type: string | undefined): string {
  if (type === 'admin')   return '/admin'
  if (type === 'staff')   return '/staff'
  if (type === 'company') return '/company'
  return '/login'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a mutable response so cookie refreshes are forwarded to the browser
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Apply cookies to the outgoing request so server components can read them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Rebuild the response so the browser receives the refreshed session cookie
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: getUser() must be called here — it refreshes the session token
  // Do NOT add any early returns between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Read role from app_metadata — only writable by the service role (server-side).
  // user_metadata is writable by the client and MUST NOT be trusted for authorization.
  const userType: string | undefined = user?.app_metadata?.role

  // ── Unauthenticated user ──────────────────────────────────────────────────
  if (!user) {
    // Allow public routes through
    if (PUBLIC_ROUTES.includes(pathname)) return supabaseResponse

    // Redirect everything else to /login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // ── Authenticated user on an auth page → send to their dashboard ──────────
  if (AUTH_ROUTES.includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = getDefaultRoute(userType)
    return NextResponse.redirect(dashboardUrl)
  }

  // ── Role-based route enforcement ──────────────────────────────────────────
  if (pathname.startsWith('/admin') && userType !== 'admin') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = getDefaultRoute(userType)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/staff') && userType !== 'staff') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = getDefaultRoute(userType)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/company') && userType !== 'company') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = getDefaultRoute(userType)
    return NextResponse.redirect(redirectUrl)
  }

  // Pass through with updated session cookies
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
