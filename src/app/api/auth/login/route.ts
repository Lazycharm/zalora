import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[LOGIN] Supabase not configured')
      return NextResponse.json(
        { 
          error: 'Database not configured. Please set Supabase environment variables.',
          code: 'DATABASE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

    console.log(`[LOGIN] Attempting login for: ${email}`)
    const result = await login(email, password)

    if (!result.success || !result.user) {
      console.log(`[LOGIN] Failed: ${result.error}`)
      
      // Provide more helpful error message
      let errorMessage = result.error || 'Invalid email or password'
      let statusCode = 401
      
      // If database connection error, return 503
      if (errorMessage.includes('Database connection') || errorMessage.includes('Supabase')) {
        statusCode = 503
        errorMessage = 'Database connection error. Please check your Supabase configuration.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      )
    }

    console.log(`[LOGIN] Success: ${email} (${result.user.role})`)
    return NextResponse.json({ 
      success: true,
      user: result.user 
    })
  } catch (error) {
    console.error('[LOGIN] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
