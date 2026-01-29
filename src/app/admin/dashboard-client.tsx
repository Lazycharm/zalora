'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
  activeShops: number
  openTickets: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    userName: string
    total: number
    status: string
  }>
}

interface AdminDashboardClientProps {
  stats: DashboardStats
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'solar:users-group-rounded-bold',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      href: '/admin/users',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'solar:bill-list-bold',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      href: '/admin/orders',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: 'solar:box-bold',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      href: '/admin/products',
    },
    {
      title: 'Revenue',
      value: formatPrice(Number(stats.totalRevenue)),
      icon: 'solar:wallet-bold',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
      href: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'solar:clock-circle-bold',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      href: '/admin/orders?status=pending',
    },
    {
      title: 'Active Shops',
      value: stats.activeShops,
      icon: 'solar:shop-bold',
      color: 'text-pink-500',
      bgColor: 'bg-pink-100',
      href: '/admin/shops',
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      icon: 'solar:chat-round-dots-bold',
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      href: '/admin/support',
    },
  ]

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ZALORA Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon icon={stat.icon} className={`size-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Icon icon="solar:add-circle-bold" className="size-8 text-primary" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
            <Link
              href="/admin/categories/new"
              className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Icon icon="solar:widget-add-bold" className="size-8 text-green-500" />
              <span className="text-sm font-medium">Add Category</span>
            </Link>
            <Link
              href="/admin/coupons/new"
              className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Icon icon="solar:ticket-bold" className="size-8 text-purple-500" />
              <span className="text-sm font-medium">Create Coupon</span>
            </Link>
            <Link
              href="/admin/homepage"
              className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Icon icon="solar:palette-bold" className="size-8 text-pink-500" />
              <span className="text-sm font-medium">Edit Homepage</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon icon="solar:bag-3-bold" className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.userName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
