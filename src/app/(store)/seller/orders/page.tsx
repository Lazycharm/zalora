import { redirect } from 'next/navigation'
import { getCurrentUser, getSellerShopAccess } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { SellerOrdersClient } from './orders-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  status?: string
}

async function getSellerOrders(userId: string, searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // Get user's shop (Supabase can return shops as array or single object)
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('shops (*)')
    .eq('id', userId)
    .single()

  const rawShops = user?.shops
  const shop =
    Array.isArray(rawShops) && rawShops.length > 0
      ? rawShops[0]
      : rawShops && typeof rawShops === 'object' && rawShops !== null && 'id' in rawShops
        ? rawShops
        : null

  if (!shop) {
    return {
      orders: [],
      total: 0,
      pages: 0,
      page: 1,
    }
  }

  // Get product IDs for this shop
  const { data: shopProducts } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('shopId', shop.id)

  const productIds = (shopProducts || []).map((p: any) => p.id)

  if (productIds.length === 0) {
    return {
      orders: [],
      total: 0,
      pages: 0,
      page: 1,
    }
  }

  // Get order IDs that have items from this shop
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('orderId')
    .in('productId', productIds)

  const orderIds = Array.from(new Set((orderItems || []).map((item: any) => item.orderId)))

  if (orderIds.length === 0) {
    return {
      orders: [],
      total: 0,
      pages: 0,
      page: 1,
    }
  }

  // Build orders query
  let ordersQuery = supabaseAdmin
    .from('orders')
    .select(`
      id,
      orderNumber,
      status,
      paymentStatus,
      total,
      createdAt,
      user:users!orders_userId_fkey (
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .in('id', orderIds)

  // Apply status filter
  if (searchParams.status && searchParams.status !== 'all') {
    ordersQuery = ordersQuery.eq('status', searchParams.status)
  }

  // Apply pagination and ordering
  ordersQuery = ordersQuery.order('createdAt', { ascending: false }).range(skip, skip + limit - 1)

  const { data: orders, count: total, error } = await ordersQuery

  if (error) {
    throw error
  }

  // Get items for each order
  const ordersWithItems = await Promise.all(
    (orders || []).map(async (order: any) => {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select(`
          id,
          name,
          quantity,
          price,
          image,
          product:products!order_items_productId_fkey (
            name,
            slug
          )
        `)
        .eq('orderId', order.id)
        .in('productId', productIds)

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: Number(order.total || 0),
        createdAt: order.createdAt,
        userName: order.user?.name || 'Unknown',
        userEmail: order.user?.email || '',
        items: (items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          image: item.image,
        })),
      }
    })
  )

  return {
    orders: ordersWithItems,
    total: total || 0,
    pages: Math.ceil((total || 0) / limit),
    page,
  }
}

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) return null

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const { shop, canAccessShop } = await getSellerShopAccess(currentUser.id)
  if (!shop) redirect('/seller/create-shop')
  if (!canAccessShop) redirect('/seller/verification-status')

  const data = await getSellerOrders(currentUser.id, searchParams)

  return <SellerOrdersClient {...data} searchParams={searchParams} />
}
