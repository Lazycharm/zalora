import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zalora-secret-key'
)

// Protected routes checked in middleware (Edge - token only)
// /account/* and /seller/* are NOT here: auth is done in layout/pages (Node) so cookies work
const protectedRoutes = ['/checkout']

// Admin routes that require admin/manager role
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // /account/* and /seller/*: let through; layout/pages check auth in Node (cookies work)
  if (pathname.startsWith('/account') || pathname.startsWith('/seller')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.set('auth-token', '', { path: '/', maxAge: 0 })
      return response
    }
    
    // For admin routes, check role
    if (isAdminRoute) {
      if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Check if it's a JWT expiration error
    const isExpired = error instanceof Error && (
      error.message.includes('expired') || 
      error.message.includes('ExpirationTime')
    )
    
    if (isExpired) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.set('auth-token', '', { path: '/', maxAge: 0 })
      return response
    }

    // For other errors (malformed token, wrong secret, etc.), redirect and clear cookie
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.set('auth-token', '', { path: '/', maxAge: 0 })
    return response
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
