import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { SellerOrderDetailsClient } from './order-details-client'

async function getOrder(orderId: string, userId: string) {
  // Get user's shop
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('shops (*)')
    .eq('id', userId)
    .single()

  if (!user?.shops || !Array.isArray(user.shops) || user.shops.length === 0) {
    return null
  }

  const shop = user.shops[0]

  // Get order
  const { data: order, error } = await supabaseAdmin
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
          slug,
          shopId
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return null
  }

  // Filter items to only include products from this shop
  const shopItems = (order.items || []).filter((item: any) => item.product?.shopId === shop.id)

  // Verify order has items from this shop
  if (shopItems.length === 0) {
    return null
  }

  return {
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    items: shopItems.map((item: any) => ({
      ...item,
      price: Number(item.price),
      product: item.product
        ? {
            name: item.product.name,
            slug: item.product.slug,
          }
        : null,
    })),
  }
}

export default async function SellerOrderDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const order = await getOrder(params.id, currentUser.id)

  if (!order) {
    redirect('/seller/orders')
  }

  return <SellerOrderDetailsClient order={order} />
}
