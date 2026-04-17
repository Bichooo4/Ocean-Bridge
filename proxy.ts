import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth/callback']

const AUTH_ROUTES = ['/login', '/signup']

function getDefaultRoute(type: string | undefined): string {
  if (type === 'admin')   return '/admin'
  if (type === 'staff')   return '/staff'
  if (type === 'company') return '/company'
  return '/login'
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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

          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userType: string | undefined = user?.app_metadata?.role

  if (!user) {

    if (PUBLIC_ROUTES.includes(pathname)) return supabaseResponse

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = getDefaultRoute(userType)
    return NextResponse.redirect(dashboardUrl)
  }

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

  return supabaseResponse
}

export const config = {
  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
