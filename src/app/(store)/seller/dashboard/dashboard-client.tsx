'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getStatusColor, formatDateTime } from '@/lib/utils'

interface Shop {
  id: string
  name: string
  slug: string
  status: string
  balance: number
}

interface SellerDashboardClientProps {
  stats: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    activeProducts: number
    recentOrders: Array<{
      id: string
      orderNumber: string
      userName: string
      total: number
      status: string
      createdAt: string
    }>
  }
  shop: Shop | null
}

export function SellerDashboardClient({ stats, shop }: SellerDashboardClientProps) {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: 'solar:box-bold',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      href: '/seller/products',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: 'solar:check-circle-bold',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      href: '/seller/products?status=published',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'solar:bill-list-bold',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      href: '/seller/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'solar:clock-circle-bold',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      href: '/seller/orders?status=pending',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: 'solar:wallet-bold',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      href: '/seller/orders',
    },
    {
      title: 'Shop Balance',
      value: formatPrice(Number(shop?.balance || 0)),
      icon: 'solar:wallet-money-bold',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      href: '/seller/shop',
    },
  ]

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            {shop ? `Welcome back, ${shop.name}!` : 'Create your shop to start selling'}
          </p>
        </div>
        {!shop && (
          <Link href="/seller/create-shop">
            <Button>
              <Icon icon="solar:shop-bold" className="mr-2 size-4" />
              Create Shop
            </Button>
          </Link>
        )}
      </div>

      {!shop ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Icon icon="solar:shop-2-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Shop Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your shop to start selling products on ZALORA
            </p>
            <Link href="/seller/create-shop">
              <Button size="lg">
                <Icon icon="solar:add-circle-bold" className="mr-2 size-5" />
                Create Your Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Shop Status Banner */}
          {shop.status !== 'ACTIVE' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:info-circle-bold" className="size-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">
                      Your shop is {shop.status.toLowerCase()}
                    </p>
                    <p className="text-sm text-orange-700">
                      {shop.status === 'PENDING'
                        ? 'Your shop is pending approval. You can add products, but they won\'t be visible to customers until approved.'
                        : 'Your shop is currently suspended. Contact support for more information.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon icon={stat.icon} className={`size-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          {stats.recentOrders.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link href="/seller/orders">
                    <Button variant="outline" size="sm">
                      View All
                      <Icon icon="solar:alt-arrow-right-linear" className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/seller/orders/${order.id}`}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{order.orderNumber}</span>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.userName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/seller/products/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Icon icon="solar:add-circle-bold" className="size-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Add New Product</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a new product listing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/seller/shop">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <Icon icon="solar:settings-bold" className="size-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Manage Shop</h3>
                      <p className="text-sm text-muted-foreground">
                        Update shop details and settings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
