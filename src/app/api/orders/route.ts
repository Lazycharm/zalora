import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { message: 'Please login to place an order' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, address, paymentMethod, cryptoType, cryptoAddressId, total } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'No items in order' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Calculate values
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const shippingCost = 0 // Free shipping
    const tax = subtotal * 0.1 // 10% tax
    const totalAmount = subtotal + shippingCost + tax

    // Get product details for order items
    const productIds = items.map((item: any) => item.productId)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        images:product_images!inner (
          url
        )
      `)
      .in('id', productIds)
      .eq('images.isPrimary', true)

    const productMap = new Map((products || []).map((p: any) => [p.id, p]))

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        userId: session.userId,
        orderNumber,
        subtotal,
        shipping: shippingCost,
        tax,
        total: totalAmount,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod === 'cod' 
          ? 'CASH_ON_DELIVERY' 
          : paymentMethod === 'card'
          ? 'BANK_TRANSFER'
          : cryptoType,
        cryptoCurrency: paymentMethod === 'crypto' ? cryptoType : undefined,
        notes: JSON.stringify({ 
          shippingAddress: address,
          cryptoAddressId: paymentMethod === 'crypto' ? cryptoAddressId : undefined
        }),
      })
      .select()
      .single()

    if (orderError || !order) {
      throw orderError || new Error('Failed to create order')
    }

    // Create order items
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId)
      return {
        orderId: order.id,
        productId: item.productId,
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: product?.images && product.images.length > 0 ? product.images[0].url : null,
      }
    })

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback order if items fail
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    // Fetch complete order with items
    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        items:order_items (*),
        user:users!orders_userId_fkey (
          id
        )
      `)
      .eq('id', order.id)
      .single()

    // Create notification for order placement
    try {
      await createNotification({
        userId: session.userId,
        title: 'Order Placed',
        message: `Your order ${order.orderNumber} has been placed successfully`,
        type: 'order',
        link: `/account/orders/${order.id}`,
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      orderId: order.id,
      order: completeOrder,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: 'Failed to place order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
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
      .eq('userId', session.userId)
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    // Format orders to match expected structure
    const formattedOrders = (orders || []).map((order: any) => ({
      ...order,
      items: (order.items || []).map((item: any) => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: item.product.images || [],
        } : null,
      })),
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
