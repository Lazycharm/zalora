import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const paymentMethod = searchParams.get('paymentMethod')

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users!orders_userId_fkey (
          id,
          name,
          email
        ),
        address:addresses (*),
        items:order_items (
          *,
          product:products!order_items_productId_fkey (
            name,
            slug
          )
        )
      `)

    if (status) {
      query = query.eq('status', status)
    }

    if (paymentStatus) {
      query = query.eq('paymentStatus', paymentStatus)
    }

    if (paymentMethod) {
      query = query.eq('paymentMethod', paymentMethod)
    }

    const { data: orders, error } = await query.order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
