import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole, UserStatus } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== UserRole.ADMIN && session.role !== UserRole.MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user with shop
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        phone,
        role,
        status,
        balance,
        canSell,
        lastLoginAt,
        lastLoginIp,
        createdAt,
        updatedAt,
        shops (
          id,
          name,
          slug,
          status
        )
      `)
      .eq('id', params.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get counts
    const [ordersCount, reviewsCount, ticketsCount] = await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('userId', params.id),
      supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }).eq('userId', params.id),
      supabaseAdmin.from('support_tickets').select('*', { count: 'exact', head: true }).eq('userId', params.id),
    ])

    const shop = Array.isArray(user.shops) && user.shops.length > 0 ? user.shops[0] : null

    return NextResponse.json({
      user: {
        ...user,
        shop,
        _count: {
          orders: ordersCount.count || 0,
          reviews: reviewsCount.count || 0,
          supportTickets: ticketsCount.count || 0,
        },
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== UserRole.ADMIN && session.role !== UserRole.MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { role, status, canSell, name, email, phone, balance } = body

    // Validate role change (only admin can create other admins)
    if (role === UserRole.ADMIN && session.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Only admins can create other admins' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status
    if (canSell !== undefined) updateData.canSell = canSell
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone || null
    if (balance !== undefined) updateData.balance = parseFloat(balance)

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
