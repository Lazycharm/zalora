import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createNotification, createNotificationsForUsers } from '@/lib/notifications'

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
    const { items, address, paymentMethod, cryptoType, cryptoAddressId, total, shopId, payWithShopBalance, addToStore } = body

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

    // Validate balance only (deduct after order is created so we never deduct then fail)
    if (paymentMethod === 'balance') {
      if (payWithShopBalance) {
        const { data: shop } = await supabaseAdmin
          .from('shops')
          .select('id, balance, userId')
          .eq('userId', session.userId)
          .maybeSingle()
        if (!shop || Number(shop.balance) < totalAmount) {
          return NextResponse.json(
            { message: 'Insufficient shop balance' },
            { status: 400 }
          )
        }
      } else {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('id, balance')
          .eq('id', session.userId)
          .single()
        if (!userRow || Number(userRow.balance) < totalAmount) {
          return NextResponse.json(
            { message: 'Insufficient account balance' },
            { status: 400 }
          )
        }
      }
    }

    // Get product details for order items (include shopId for seller notifications)
    const productIds = items.map((item: any) => item.productId)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        shopId,
        images:product_images!inner (
          url
        )
      `)
      .in('id', productIds)
      .eq('images.isPrimary', true)

    const productMap = new Map((products || []).map((p: any) => [p.id, p]))

    // Create order — use enum values: PaymentMethod has BANK_TRANSFER, PaymentStatus has COMPLETED, OrderStatus has PAID
    const orderPaymentStatus = paymentMethod === 'balance' ? 'COMPLETED' : 'PENDING'
    const orderPaymentMethod =
      paymentMethod === 'balance'
        ? 'BANK_TRANSFER'
        : paymentMethod === 'card'
          ? 'BANK_TRANSFER'
          : cryptoType
    const notesObj: Record<string, unknown> = {
      shippingAddress: address,
      cryptoAddressId: paymentMethod === 'crypto' ? cryptoAddressId : undefined,
    }
    if (paymentMethod === 'balance') {
      notesObj.paymentSource = payWithShopBalance ? 'shop_balance' : 'user_balance'
    }
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        userId: session.userId,
        shopId: shopId || null,
        orderNumber,
        subtotal,
        shipping: shippingCost,
        tax,
        total: totalAmount,
        status: paymentMethod === 'balance' ? 'PAID' : 'PENDING_PAYMENT',
        paymentStatus: orderPaymentStatus,
        paymentMethod: orderPaymentMethod,
        cryptoCurrency: paymentMethod === 'crypto' ? cryptoType : undefined,
        notes: JSON.stringify(notesObj),
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

    // Deduct balance only after order + items are created (so we never deduct then fail on order insert)
    if (paymentMethod === 'balance') {
      if (payWithShopBalance) {
        const { data: shop } = await supabaseAdmin
          .from('shops')
          .select('id, balance, userId')
          .eq('userId', session.userId)
          .maybeSingle()
        if (!shop || Number(shop.balance) < totalAmount) {
          await supabaseAdmin.from('orders').delete().eq('id', order.id)
          return NextResponse.json(
            { message: 'Insufficient shop balance' },
            { status: 400 }
          )
        }
        const { error: updateErr } = await supabaseAdmin
          .from('shops')
          .update({ balance: Number(shop.balance) - totalAmount })
          .eq('id', shop.id)
        if (updateErr) {
          await supabaseAdmin.from('orders').delete().eq('id', order.id)
          return NextResponse.json(
            { message: 'Failed to deduct shop balance' },
            { status: 500 }
          )
        }
      } else {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('id, balance')
          .eq('id', session.userId)
          .single()
        if (!userRow || Number(userRow.balance) < totalAmount) {
          await supabaseAdmin.from('orders').delete().eq('id', order.id)
          return NextResponse.json(
            { message: 'Insufficient account balance' },
            { status: 400 }
          )
        }
        const { error: updateErr } = await supabaseAdmin
          .from('users')
          .update({ balance: Number(userRow.balance) - totalAmount })
          .eq('id', session.userId)
        if (updateErr) {
          await supabaseAdmin.from('orders').delete().eq('id', order.id)
          return NextResponse.json(
            { message: 'Failed to deduct account balance' },
            { status: 500 }
          )
        }
      }
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

    // Create notification for buyer (order placement)
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

    // Notify shop owner(s) when their shop gets an order
    try {
      const shopIds = new Set<string>()
      for (const item of items) {
        const product = productMap.get(item.productId)
        if (product?.shopId) shopIds.add(product.shopId)
      }
      if (shopIds.size > 0) {
        const { data: shops } = await supabaseAdmin
          .from('shops')
          .select('id, userId')
          .in('id', Array.from(shopIds))

        const ownerIds = new Set<string>()
        for (const shop of shops || []) {
          if (shop.userId && shop.userId !== session.userId) {
            ownerIds.add(shop.userId)
          }
        }
        await createNotificationsForUsers(Array.from(ownerIds), {
          title: 'New order received',
          message: `Your shop has a new order: ${order.orderNumber}`,
          type: 'order',
          link: `/seller/orders/${order.id}`,
        })
      }
    } catch (error) {
      console.error('Error creating seller order notification:', error)
      // Don't fail the request if notification creation fails
    }

    // Add main-shop products to buyer's store when addToStore and payment is done (balance)
    if (addToStore && paymentMethod === 'balance') {
      try {
        const { data: buyerShop } = await supabaseAdmin
          .from('shops')
          .select('id')
          .eq('userId', session.userId)
          .maybeSingle()
        if (buyerShop) {
          const mainShopProductIds = items
            .map((item: any) => {
              const p = productMap.get(item.productId)
              return p?.shopId == null ? item.productId : null
            })
            .filter(Boolean) as string[]
          const uniqueIds = Array.from(new Set(mainShopProductIds))
          if (uniqueIds.length > 0) {
            const { data: fullProducts } = await supabaseAdmin
              .from('products')
              .select('*')
              .in('id', uniqueIds)
              .is('shopId', null)
            const { data: productImages } = await supabaseAdmin
              .from('product_images')
              .select('*')
              .in('productId', uniqueIds)
            const imageByProduct = new Map<string, any[]>()
            for (const img of productImages || []) {
              if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, [])
              imageByProduct.get(img.productId)!.push(img)
            }
            for (const orig of fullProducts || []) {
              const newSlug = `${orig.slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
              const { data: newProduct, error: insertErr } = await supabaseAdmin
                .from('products')
                .insert({
                  shopId: buyerShop.id,
                  categoryId: orig.categoryId,
                  name: orig.name,
                  slug: newSlug,
                  description: orig.description,
                  shortDesc: orig.shortDesc,
                  price: orig.price,
                  comparePrice: orig.comparePrice,
                  costPrice: orig.costPrice,
                  sku: orig.sku ? `${orig.sku}-${Date.now().toString(36)}` : null,
                  barcode: orig.barcode,
                  stock: orig.stock,
                  lowStockAlert: orig.lowStockAlert,
                  weight: orig.weight,
                  status: 'ACTIVE',
                  isFeatured: false,
                  isPromoted: false,
                })
                .select('id')
                .single()
              if (insertErr || !newProduct) continue
              const imgs = imageByProduct.get(orig.id) || []
              if (imgs.length > 0) {
                await supabaseAdmin.from('product_images').insert(
                  imgs.map((img: any, i: number) => ({
                    productId: newProduct.id,
                    url: img.url,
                    alt: img.alt,
                    sortOrder: img.sortOrder ?? i,
                    isPrimary: img.isPrimary ?? i === 0,
                  }))
                )
              }
            }
          }
        }
      } catch (err) {
        console.error('Add to store clone error:', err)
        // Don't fail the order
      }
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
