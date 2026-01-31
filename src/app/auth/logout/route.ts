import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  // Clear the auth token cookie (must use same path as when set)
  cookieStore.set('auth-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // Redirect to home page
  return NextResponse.redirect(new URL('/', req.url))
}
