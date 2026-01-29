import { supabaseAdmin } from '@/lib/supabase'
import { AdminDashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const [
      usersCount,
      ordersCount,
      productsCount,
      revenueResult,
      pendingOrdersCount,
      activeShopsCount,
      openTicketsCount,
      recentOrdersResult,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('orders')
        .select('total')
        .eq('paymentStatus', 'COMPLETED'),
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING_PAYMENT'),
      supabaseAdmin
        .from('shops')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE'),
      supabaseAdmin
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'OPEN'),
      supabaseAdmin
        .from('orders')
        .select(`
          id,
          orderNumber,
          total,
          status,
          user:users!orders_userId_fkey (
            name,
            email
          )
        `)
        .order('createdAt', { ascending: false })
        .limit(5),
    ])

    // Calculate total revenue
    const totalRevenue = (revenueResult.data || []).reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
      0
    )

    return {
      totalUsers: usersCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalProducts: productsCount.count || 0,
      totalRevenue,
      pendingOrders: pendingOrdersCount.count || 0,
      activeShops: activeShopsCount.count || 0,
      openTickets: openTicketsCount.count || 0,
      recentOrders: (recentOrdersResult.data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userName: order.user?.name || 'Unknown',
        total: Number(order.total || 0),
        status: order.status,
      })),
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    // Return default values on error
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeShops: 0,
      openTickets: 0,
      recentOrders: [],
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  return <AdminDashboardClient stats={stats} />
}
