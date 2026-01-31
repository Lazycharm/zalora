import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, applyCookiesToResponse } from '@/lib/supabase-server'
import { getRedirectBase } from '@/lib/redirect-base'

export async function GET(req: NextRequest) {
  const base = getRedirectBase(req)
  const response = NextResponse.redirect(new URL('/', base))

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { supabase, cookiesToSet } = await createSupabaseRouteHandlerClient(req)
      await supabase.auth.signOut()
      applyCookiesToResponse(response, cookiesToSet)
    } catch (e) {
      console.warn('[LOGOUT] Supabase signOut failed:', e)
    }
  }

  response.cookies.set('auth-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return response
}
