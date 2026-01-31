import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        paymentStatus: 'COMPLETED',
        status: 'PAID',
        paidAt: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Credit shop balance when order is paid and belongs to a shop
    if (order?.shopId) {
      const { data: shop } = await supabaseAdmin
        .from('shops')
        .select('balance')
        .eq('id', order.shopId)
        .single()
      const currentBalance = Number(shop?.balance ?? 0)
      const orderTotal = Number(order.total ?? 0)
      await supabaseAdmin
        .from('shops')
        .update({ balance: currentBalance + orderTotal })
        .eq('id', order.shopId)
    }

    return NextResponse.json({
      message: 'Order payment approved successfully',
      order,
    })
  } catch (error) {
    console.error('Approve order error:', error)
    return NextResponse.json(
      { message: 'Failed to approve order' },
      { status: 500 }
    )
  }
}
