import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  // Clear the auth token cookie
  cookies().delete('auth-token')

  // Redirect to home page
  return NextResponse.redirect(new URL('/', req.url))
}
