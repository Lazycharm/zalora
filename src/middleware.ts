import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { createServerClient } from '@supabase/ssr'
import { getRedirectBase } from '@/lib/redirect-base'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zalora-secret-key'
)

const protectedRoutes = ['/checkout']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  if (pathname === '/maintenance') {
    return response
  }

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))

  // Refresh Supabase Auth session (required so Server Components get the session on Netlify)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
              cookiesToSet.forEach(({ name, value, options }) => {
                const opts = (options ?? {}) as { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: string }
                response.cookies.set(name, value, {
                  path: opts.path ?? '/',
                  maxAge: opts.maxAge ?? 60 * 60 * 24 * 7,
                  httpOnly: opts.httpOnly ?? true,
                  secure: opts.secure ?? process.env.NODE_ENV === 'production',
                  sameSite: (opts.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
                })
              })
            },
          },
        }
      )
      await supabase.auth.getUser()
    } catch (e) {
      // Ignore; auth will be checked in layout/API
    }
  }

  if (pathname.startsWith('/account') || pathname.startsWith('/seller')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value))
    return res
  }

  if (!isProtectedRoute && !isAdminRoute) {
    return response
  }

  const token = request.cookies.get('auth-token')?.value

  const base = getRedirectBase(request)

  if (!token) {
    const loginUrl = new URL('/auth/login', base)
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value))
    return redirectResponse
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.exp && payload.exp < Date.now() / 1000) {
      const redirectResponse = NextResponse.redirect(new URL('/auth/login', base))
      redirectResponse.cookies.set('auth-token', '', { path: '/', maxAge: 0 })
      response.cookies.getAll().forEach((c) => { if (c.name !== 'auth-token') redirectResponse.cookies.set(c.name, c.value) })
      return redirectResponse
    }
    if (isAdminRoute && payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/', base))
    }
    return response
  } catch (error) {
    const redirectResponse = NextResponse.redirect(new URL('/auth/login', base))
    redirectResponse.cookies.set('auth-token', '', { path: '/', maxAge: 0 })
    response.cookies.getAll().forEach((c) => { if (c.name !== 'auth-token') redirectResponse.cookies.set(c.name, c.value) })
    return redirectResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|images|icons).*)',
  ],
}
