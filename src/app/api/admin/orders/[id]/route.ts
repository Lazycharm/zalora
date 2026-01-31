import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

export async function GET(
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
      .select(`
        *,
        user:users!orders_userId_fkey (
          id,
          name,
          email,
          phone
        ),
        address:addresses (*),
        items:order_items (
          *,
          product:products!order_items_productId_fkey (
            id,
            name,
            slug,
            images:product_images!inner (
              url
            )
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Format product images
    const formattedOrder = {
      ...order,
      items: (order.items || []).map((item: any) => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: item.product.images || [],
        } : null,
      })),
    }

    return NextResponse.json({ order: formattedOrder })
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const { status, paymentStatus, trackingNumber, adminNotes, shippedAt, deliveredAt } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
      // Auto-set timestamps based on status
      if (status === 'SHIPPED' && !shippedAt) {
        updateData.shippedAt = new Date().toISOString()
      }
      if (status === 'DELIVERED' && !deliveredAt) {
        updateData.deliveredAt = new Date().toISOString()
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
      if (paymentStatus === 'COMPLETED' && !body.paidAt) {
        updateData.paidAt = new Date().toISOString()
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber || null
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes || null
    }

    if (shippedAt) {
      updateData.shippedAt = new Date(shippedAt).toISOString()
    }

    if (deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt).toISOString()
    }

    // Get order before update to check for status changes and shopId
    const { data: oldOrder, error: oldOrderError } = await supabaseAdmin
      .from('orders')
      .select('userId, shopId, status, paymentStatus, orderNumber, total')
      .eq('id', params.id)
      .single()

    if (oldOrderError || !oldOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // When payment is marked COMPLETED, credit shop balance if order has shopId
    if (paymentStatus === 'COMPLETED' && oldOrder.paymentStatus !== 'COMPLETED' && oldOrder.shopId) {
      const { data: shop } = await supabaseAdmin
        .from('shops')
        .select('balance')
        .eq('id', oldOrder.shopId)
        .single()
      const currentBalance = Number(shop?.balance ?? 0)
      const orderTotal = Number(oldOrder.total ?? 0)
      await supabaseAdmin
        .from('shops')
        .update({ balance: currentBalance + orderTotal })
        .eq('id', oldOrder.shopId)
    }

    // Update order
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        user:users!orders_userId_fkey (
          id,
          name,
          email
        ),
        items:order_items (
          *,
          product:products!order_items_productId_fkey (
            name,
            slug
          )
        )
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    // Create notifications for status changes
    try {
      if (status && status !== oldOrder.status) {
        let notificationTitle = ''
        let notificationMessage = ''
        let notificationType: 'order' | 'payment' | 'promo' | 'system' | 'support' = 'order'

        switch (status) {
          case 'SHIPPED':
            notificationTitle = 'Order Shipped'
            notificationMessage = `Your order ${order.orderNumber} has been shipped${order.trackingNumber ? ` with tracking number ${order.trackingNumber}` : ''}`
            break
          case 'DELIVERED':
            notificationTitle = 'Order Delivered'
            notificationMessage = `Your order ${order.orderNumber} has been delivered`
            break
          case 'CANCELLED':
            notificationTitle = 'Order Cancelled'
            notificationMessage = `Your order ${order.orderNumber} has been cancelled`
            break
          case 'REFUNDED':
            notificationTitle = 'Order Refunded'
            notificationMessage = `Your order ${order.orderNumber} has been refunded`
            break
          case 'PAID':
            notificationTitle = 'Payment Received'
            notificationMessage = `Payment for order ${order.orderNumber} has been received`
            notificationType = 'payment'
            break
        }

        if (notificationTitle) {
          await createNotification({
            userId: order.user.id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            link: `/account/orders/${order.id}`,
          })
        }
      }

      if (paymentStatus && paymentStatus !== oldOrder.paymentStatus) {
        if (paymentStatus === 'COMPLETED') {
          await createNotification({
            userId: order.user.id,
            title: 'Payment Confirmed',
            message: `Payment for order ${order.orderNumber} has been confirmed`,
            type: 'payment',
            link: `/account/orders/${order.id}`,
          })
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { message: 'Failed to update order' },
      { status: 500 }
    )
  }
}
