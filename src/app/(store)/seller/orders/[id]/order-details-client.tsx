'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, getStatusColor, formatDateTime } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string | null
  product: {
    name: string
    slug: string
  } | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  total: number
  subtotal: number
  shipping: number
  tax: number
  createdAt: Date
  user: {
    name: string
    email: string
  }
  address: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  items: OrderItem[]
}

interface SellerOrderDetailsClientProps {
  order: Order
}

export function SellerOrderDetailsClient({ order }: SellerOrderDetailsClientProps) {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
        </div>
        <Link href="/seller/orders">
          <Button variant="outline">
            <Icon icon="solar:arrow-left-linear" className="mr-2 size-4" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Order Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge variant="outline">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Items</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    {item.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {item.product ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium hover:text-primary line-clamp-2"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-medium line-clamp-2">{item.name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold mt-2">
                        {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {order.address && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Shipping Address</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.address.name}</p>
                  <p className="text-muted-foreground">{order.address.phone}</p>
                  <p className="text-muted-foreground">{order.address.address}</p>
                  <p className="text-muted-foreground">
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{order.user.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 font-medium">{order.user.email}</span>
                </div>
                {order.paymentMethod && (
                  <div>
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="ml-2 font-medium">{order.paymentMethod}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
