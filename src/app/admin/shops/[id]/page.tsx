import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { AdminShopDetailsClient } from './shop-details-client'

export const dynamic = 'force-dynamic'

async function getShopData(shopId: string) {
  // Get shop with user
  const { data: shop, error: shopError } = await supabaseAdmin
    .from('shops')
    .select(`
      *,
      user:users!shops_userId_fkey (
        id,
        name,
        email,
        avatar,
        role,
        status,
        balance,
        canSell,
        createdAt
      )
    `)
    .eq('id', shopId)
    .single()

  if (shopError || !shop) {
    return null
  }

  // Get products
  const { data: products } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      images:product_images!inner (
        url
      ),
      category:categories!products_categoryId_fkey (
        name
      )
    `)
    .eq('shopId', shopId)
    .eq('images.isPrimary', true)
    .order('createdAt', { ascending: false })
    .limit(10)

  // Get product IDs for this shop
  const productIds = (products || []).map((p: any) => p.id)

  // Get orders that have items with products from this shop
  let recentOrders: any[] = []
  if (productIds.length > 0) {
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('orderId')
      .in('productId', productIds)

    const orderIds = Array.from(new Set((orderItems || []).map((item: any) => item.orderId)))

    if (orderIds.length > 0) {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          orderNumber,
          status,
          paymentStatus,
          total,
          createdAt,
          user:users!orders_userId_fkey (
            name,
            email
          )
        `)
        .in('id', orderIds)
        .order('createdAt', { ascending: false })
        .limit(5)

      recentOrders = orders || []
    }
  }

  // Get counts
  const [productsCount, ordersCount] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('shopId', shopId),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('shopId', shopId),
  ])

  // Get followers count
  let followersCount = shop.followers || 0
  if (followersCount === 0 && productIds.length > 0) {
    const { data: favorites } = await supabaseAdmin
      .from('favorites')
      .select('userId')
      .in('productId', productIds)

    const uniqueUserIds = Array.from(new Set((favorites || []).map((f: any) => f.userId)))
    followersCount = uniqueUserIds.length
  }

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      logo: shop.logo,
      banner: shop.banner,
      status: shop.status,
      level: shop.level,
      balance: Number(shop.balance || 0),
      totalSales: shop.totalSales || 0,
      rating: Number(shop.rating || 0),
      commissionRate: Number(shop.commissionRate || 0),
      createdAt: shop.createdAt,
      productCount: productsCount.count || 0,
      orderCount: ordersCount.count || 0,
      followersCount,
    },
    owner: {
      id: shop.user.id,
      name: shop.user.name,
      email: shop.user.email,
      avatar: shop.user.avatar,
      role: shop.user.role,
      status: shop.user.status,
      balance: Number(shop.user.balance || 0),
      canSell: shop.user.canSell,
      createdAt: shop.user.createdAt,
    },
    products: (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      stock: p.stock,
      status: p.status,
      image: p.images && p.images.length > 0 ? p.images[0].url : null,
      categoryName: p.category?.name || 'Uncategorized',
    })),
    recentOrders: recentOrders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total || 0),
      userName: order.user?.name || 'Unknown',
      createdAt: order.createdAt,
    })),
  }
}

export default async function AdminShopDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
    redirect('/')
  }

  const data = await getShopData(params.id)

  if (!data) {
    redirect('/admin/shops')
  }

  return <AdminShopDetailsClient {...data} />
}
