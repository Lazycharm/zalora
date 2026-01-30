import { redirect } from 'next/navigation'
import { getCurrentUser, getSellerShopAccess } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ShopDetailsClient } from './shop-client'

export const dynamic = 'force-dynamic'

async function getShopStats(shopId: string, shop: { followers: number; totalSales: number }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get product IDs for this shop
  const { data: shopProducts } = await supabaseAdmin
    .from('products')
    .select('id, costPrice')
    .eq('shopId', shopId)

  const productIds = (shopProducts || []).map((p: any) => p.id)
  const productCostMap = new Map((shopProducts || []).map((p: any) => [p.id, Number(p.costPrice || 0)]))

  if (productIds.length === 0) {
    return {
      todayOrders: 0,
      cumulativeOrders: 0,
      todaySales: 0,
      totalSales: shop.totalSales || 0,
      todayProfit: 0,
      totalProfit: 0,
      followersCount: shop.followers || 0,
      creditScore: 0,
    }
  }

  // Get orders that have items with products from this shop
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select(`
      orderId,
      productId,
      price,
      quantity,
      order:orders!order_items_orderId_fkey (
        createdAt,
        status
      )
    `)
    .in('productId', productIds)

  if (!orderItems || orderItems.length === 0) {
    return {
      todayOrders: 0,
      cumulativeOrders: 0,
      todaySales: 0,
      totalSales: shop.totalSales || 0,
      todayProfit: 0,
      totalProfit: 0,
      followersCount: shop.followers || 0,
      creditScore: 0,
    }
  }

  // Group by order
  const ordersMap = new Map()
  orderItems.forEach((item: any) => {
    const orderId = item.orderId
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        createdAt: item.order?.createdAt,
        status: item.order?.status,
        items: [],
      })
    }
    ordersMap.get(orderId).items.push({
      productId: item.productId,
      price: Number(item.price),
      quantity: item.quantity,
    })
  })

  const allOrders = Array.from(ordersMap.values())

  // Calculate today's orders
  const todayOrders = allOrders.filter((order: any) => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= today && orderDate < tomorrow
  })

  // Calculate today's sales and profit
  const todaySales = todayOrders.reduce((sum: number, order: any) => {
    const orderTotal = order.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0)
    return sum + orderTotal
  }, 0)

  const todayProfit = todayOrders.reduce((sum: number, order: any) => {
    const orderProfit = order.items.reduce((itemSum: number, item: any) => {
      const costPrice = productCostMap.get(item.productId) || 0
      const profit = (item.price - costPrice) * item.quantity
      return itemSum + profit
    }, 0)
    return sum + orderProfit
  }, 0)

  // Calculate total sales and profit
  const totalSales = allOrders.reduce((sum: number, order: any) => {
    const orderTotal = order.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0)
    return sum + orderTotal
  }, 0)

  const totalProfit = allOrders.reduce((sum: number, order: any) => {
    const orderProfit = order.items.reduce((itemSum: number, item: any) => {
      const costPrice = productCostMap.get(item.productId) || 0
      const profit = (item.price - costPrice) * item.quantity
      return itemSum + profit
    }, 0)
    return sum + orderProfit
  }, 0)

  // Get followers count
  const followersCount = shop.followers || 0

  // Use stored totalSales from shop if available, otherwise use calculated value
  const finalTotalSales = shop.totalSales > 0 ? shop.totalSales : totalSales

  // Calculate credit score
  const completedOrders = allOrders.filter((o: any) => o.status === 'DELIVERED').length
  const orderCompletionRate = allOrders.length > 0 ? (completedOrders / allOrders.length) * 100 : 0
  const creditScore = Math.min(100, Math.round(orderCompletionRate + (allOrders.length > 0 ? 20 : 0)))

  return {
    todayOrders: todayOrders.length,
    cumulativeOrders: allOrders.length,
    todaySales,
    totalSales: finalTotalSales,
    todayProfit,
    totalProfit,
    followersCount,
    creditScore,
  }
}

export default async function ShopDetailsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const { shop: shopFromAccess, canAccessShop } = await getSellerShopAccess(currentUser.id)

  if (!shopFromAccess) {
    redirect('/seller/create-shop')
  }

  if (!canAccessShop) {
    redirect('/seller/verification-status')
  }

  // Get full shop with product count
  const { data: user } = await supabaseAdmin
    .from('users')
    .select(`
      shops (
        *,
        products:products!inner (
          id
        )
      )
    `)
    .eq('id', currentUser.id)
    .single()

  if (!user?.shops || !Array.isArray(user.shops) || user.shops.length === 0) {
    redirect('/seller/create-shop')
  }

  const shop = user.shops[0]
  const stats = await getShopStats(shop.id, shop)

  // Get product count
  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('shopId', shop.id)

  // Convert Decimal fields to numbers for client component
  const shopData = {
    ...shop,
    balance: Number(shop.balance || 0),
    rating: Number(shop.rating || 0),
    commissionRate: Number(shop.commissionRate || 0),
    followers: shop.followers || 0,
    totalSales: shop.totalSales || 0,
    _count: {
      products: productCount || 0,
    },
  }

  return <ShopDetailsClient shop={shopData} stats={stats} />
}
