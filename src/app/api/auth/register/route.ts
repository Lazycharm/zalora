import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { isValidEmail } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

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

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[REGISTER] Supabase not configured')
      return NextResponse.json(
        { 
          error: 'Database not configured. Please set Supabase environment variables.',
          code: 'DATABASE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

    console.log(`[REGISTER] Attempting registration for: ${email}`)
    const result = await register({ name, email, password })

    if (!result.success) {
      console.log(`[REGISTER] Failed: ${result.error}`)
      
      // Check if it's a database connection error
      let statusCode = 400
      let errorMessage = result.error || 'Registration failed'
      
      if (errorMessage.includes('Database connection') || errorMessage.includes('Supabase')) {
        statusCode = 503
        errorMessage = 'Database connection error. Please check your Supabase configuration.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      )
    }

    console.log(`[REGISTER] Success: ${email}`)
    return NextResponse.json({ 
      success: true,
      user: result.user 
    })
  } catch (error) {
    console.error('[REGISTER] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { 
        error: errorMessage,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
