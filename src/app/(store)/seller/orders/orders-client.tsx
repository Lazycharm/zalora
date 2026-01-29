'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getStatusColor, formatDateTime } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: Date
  userName: string
  userEmail: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string | null
  }>
}

interface SellerOrdersClientProps {
  orders: Order[]
  total: number
  pages: number
  page: number
  searchParams: {
    status?: string
  }
}

export function SellerOrdersClient({
  orders,
  total,
  pages,
  page,
  searchParams,
}: SellerOrdersClientProps) {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Store Orders</h1>
          <p className="text-muted-foreground">Manage orders for your products</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form method="get" className="flex flex-wrap gap-4">
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="px-4 py-2 bg-input border border-border rounded-lg text-sm"
            >
              <option value="all">All Orders</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button type="submit" variant="secondary">
              <Icon icon="solar:filter-bold" className="mr-2 size-4" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Showing {orders.length} of {total} orders</span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon icon="solar:bill-list-linear" className="size-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground">Orders for your products will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/seller/orders/${order.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {order.orderNumber}
                        </h3>
                      </Link>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Customer: {order.userName} ({order.userEmail})
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {item.image && (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </p>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full lg:w-auto">
                        View Details
                        <Icon icon="solar:alt-arrow-right-linear" className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/seller/orders?page=${Math.max(1, page - 1)}`}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" size="icon">
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </Button>
          </Link>
          
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {pages}
          </span>
          
          <Link
            href={`/seller/orders?page=${Math.min(pages, page + 1)}`}
            className={page >= pages ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" size="icon">
              <Icon icon="solar:arrow-right-linear" className="size-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
