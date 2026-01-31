import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { isValidEmail } from '@/lib/utils'
import { notifyAdmins } from '@/lib/notifications'
import { createSupabaseRouteHandlerClient, applyCookiesToResponse } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

const SUPABASE_AUTH_PASSWORD_PLACEHOLDER = '$supabase-auth$'

export async function POST(request: NextRequest) {
  try {
    let body: { name?: string; email?: string; password?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Please try again.' },
        { status: 400 }
      )
    }
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Database not configured. Please set Supabase environment variables.', code: 'DATABASE_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 1) New users: Supabase Auth (email provider) + public.users row with id = auth.user.id
    if (hasAnonKey) {
      try {
        const { supabase, cookiesToSet } = await createSupabaseRouteHandlerClient(request)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })

        if (!error && data?.user) {
          const { error: insertError } = await supabaseAdmin.from('users').insert({
            id: data.user.id,
            email: data.user.email ?? email,
            name: name,
            password: SUPABASE_AUTH_PASSWORD_PLACEHOLDER,
            role: 'USER',
            status: 'ACTIVE',
          })

          if (insertError) {
            if (insertError.code === '23505') {
              return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
            }
            console.error('[REGISTER] Insert app user error:', insertError)
            return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
          }

          try {
            await notifyAdmins({
              title: 'New user registered',
              message: `${name} (${email}) just signed up`,
              type: 'system',
              link: '/admin/users',
            })
          } catch (e) {
            console.error('Notify admins error:', e)
          }

          const response = NextResponse.json({
            success: true,
            user: { id: data.user.id, email: data.user.email ?? email, name, role: 'USER' },
          })
          applyCookiesToResponse(response, cookiesToSet)
          return response
        }
        if (error?.message?.toLowerCase().includes('already registered') || error?.message?.toLowerCase().includes('already exists')) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
        }
        if (error?.message?.toLowerCase().includes('rate limit') || error?.message?.toLowerCase().includes('rate_limit')) {
          return NextResponse.json(
            { error: 'Too many sign-up attempts. Please wait a few minutes and try again.' },
            { status: 429 }
          )
        }
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      } catch (e) {
        console.warn('[REGISTER] Supabase Auth signUp failed, trying legacy:', e)
      }
    }

    // 2) Legacy register (no anon key or Supabase signUp failed)
    const result = await register({ name, email, password })
    if (!result.success) {
      const errorMessage = result.error || 'Registration failed'
      const statusCode = errorMessage.includes('Database connection') || errorMessage.includes('Supabase') ? 503 : 400
      return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
    try {
      await notifyAdmins({
        title: 'New user registered',
        message: `${result.user?.name || email} (${email}) just signed up`,
        type: 'system',
        link: '/admin/users',
      })
    } catch (e) {
      console.error('Notify admins error:', e)
    }
    const res = NextResponse.json({ success: true, user: result.user })
    if (result.token) {
      res.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    return res
  } catch (error) {
    console.error('[REGISTER] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage, code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
