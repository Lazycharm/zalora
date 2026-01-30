'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice, getStatusColor, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  status: string
  level: string
  balance: number
  totalSales: number
  rating: number
  commissionRate: number
  createdAt: string
  productCount: number
  orderCount: number
  followersCount: number
}

interface Owner {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  status: string
  balance: number
  canSell: boolean
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  status: string
  image: string | null
  categoryName: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  userName: string
  createdAt: string
}

interface Verification {
  id: string
  status: string
  contactName: string
  idNumber: string
  reviewedAt: string | null
  rejectionReason: string | null
}

interface AdminShopDetailsClientProps {
  shop: Shop
  owner: Owner
  products: Product[]
  recentOrders: Order[]
  verification: Verification | null
}

export function AdminShopDetailsClient({
  shop: initialShop,
  owner,
  products,
  recentOrders,
  verification,
}: AdminShopDetailsClientProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editData, setEditData] = useState({
    name: initialShop.name,
    slug: initialShop.slug,
    description: initialShop.description || '',
    status: initialShop.status,
    level: initialShop.level,
    balance: initialShop.balance.toString(),
    rating: initialShop.rating.toString(),
    commissionRate: initialShop.commissionRate.toString(),
    followersCount: initialShop.followersCount.toString(),
    totalSales: initialShop.totalSales.toString(),
    orderCount: initialShop.orderCount.toString(),
  })

  const handleEditShop = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/shops/${initialShop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          slug: editData.slug,
          description: editData.description,
          status: editData.status,
          level: editData.level,
          balance: parseFloat(editData.balance),
          rating: parseFloat(editData.rating),
          commissionRate: parseFloat(editData.commissionRate),
          followers: parseInt(editData.followersCount),
          totalSales: parseInt(editData.totalSales),
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update shop')
      }

      toast.success('Shop updated successfully!')
      setIsEditDialogOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Shop Details</h1>
          <p className="text-muted-foreground">{initialShop.name}</p>
        </div>
        <Link href="/admin/shops">
          <Button variant="outline">
            <Icon icon="solar:arrow-left-linear" className="mr-2 size-4" />
            Back to Shops
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop Banner & Logo */}
          <Card>
            <div className="relative h-48 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
              {initialShop.banner && (
                <Image
                  src={initialShop.banner}
                  alt={initialShop.name}
                  fill
                  className="object-cover"
                />
              )}
              {initialShop.logo && (
                <div className="absolute bottom-4 left-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    <Image
                      src={initialShop.logo}
                      alt={initialShop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{initialShop.name}</h2>
                  <p className="text-muted-foreground">@{initialShop.slug}</p>
                  {initialShop.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {initialShop.description}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(initialShop.status)}>
                  {initialShop.status}
                </Badge>
              </div>
              {verification && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-1">KYC Verification</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        verification.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : verification.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {verification.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Contact: {verification.contactName} · ID: ***
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    When you set Shop Status to <strong>Active</strong>, KYC verification is automatically set to Approved and the seller can access their shop.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shop Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Products</p>
                <p className="text-2xl font-bold">{initialShop.productCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Orders</p>
                <p className="text-2xl font-bold">{initialShop.orderCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-2xl font-bold">{initialShop.totalSales}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Followers</p>
                <p className="text-2xl font-bold">{initialShop.followersCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(initialShop.balance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Products */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Products</CardTitle>
                  <Link href={`/admin/products?shop=${initialShop.id}`}>
                    <Button variant="outline" size="sm">
                      View All
                      <Icon icon="solar:alt-arrow-right-linear" className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                      className="group"
                    >
                      <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-2">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon icon="solar:box-linear" className="size-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link href={`/admin/orders?shop=${initialShop.id}`}>
                    <Button variant="outline" size="sm">
                      View All
                      <Icon icon="solar:alt-arrow-right-linear" className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.userName} • {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shop Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {owner.avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={owner.avatar}
                      alt={owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon icon="solar:user-bold" className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{owner.name}</p>
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="outline">{owner.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(owner.status)}>{owner.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">{formatPrice(owner.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Can Sell</span>
                  <Badge variant={owner.canSell ? 'default' : 'secondary'}>
                    {owner.canSell ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              <Link href={`/admin/users/${owner.id}`}>
                <Button variant="outline" className="w-full">
                  <Icon icon="solar:user-bold" className="mr-2 size-4" />
                  View Owner Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shop Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Shop Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(initialShop.status)}>
                    {initialShop.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <Badge variant="outline">{initialShop.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">{formatPrice(initialShop.balance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:star-bold" className="size-4 text-yellow-500" />
                    <span className="font-medium">{initialShop.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission Rate</span>
                  <span className="font-medium">{initialShop.commissionRate}%</span>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  setEditData({
                    name: initialShop.name,
                    slug: initialShop.slug,
                    description: initialShop.description || '',
                    status: initialShop.status,
                    level: initialShop.level,
                    balance: initialShop.balance.toString(),
                    rating: initialShop.rating.toString(),
                    commissionRate: initialShop.commissionRate.toString(),
                    followersCount: initialShop.followersCount.toString(),
                    totalSales: initialShop.totalSales.toString(),
                    orderCount: initialShop.orderCount.toString(),
                  })
                  setIsEditDialogOpen(true)
                }}
              >
                <Icon icon="solar:pen-bold" className="mr-2 size-4" />
                Edit Shop Details
              </Button>

              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(initialShop.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop Details</DialogTitle>
            <DialogDescription>
              Update all shop information for {initialShop.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Shop Slug *</Label>
              <Input
                id="slug"
                value={editData.slug}
                onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData({ ...editData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Shop Level</Label>
                <Select
                  value={editData.level}
                  onValueChange={(value) => setEditData({ ...editData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="balance">Account Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editData.balance}
                  onChange={(e) => setEditData({ ...editData, balance: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rating">Store Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editData.rating}
                  onChange={(e) => setEditData({ ...editData, rating: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editData.commissionRate}
                onChange={(e) => setEditData({ ...editData, commissionRate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of each sale that goes to the platform
              </p>
            </div>

            <div>
              <Label htmlFor="followersCount">Followers Count</Label>
              <Input
                id="followersCount"
                type="number"
                min="0"
                value={editData.followersCount}
                onChange={(e) => setEditData({ ...editData, followersCount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of followers for this shop
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalSales">Total Sales</Label>
                <Input
                  id="totalSales"
                  type="number"
                  min="0"
                  value={editData.totalSales}
                  onChange={(e) => setEditData({ ...editData, totalSales: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total sales amount (will update when user views shop)
                </p>
              </div>

              <div>
                <Label htmlFor="orderCount">Order Count (Read-only)</Label>
                <Input
                  id="orderCount"
                  type="number"
                  value={editData.orderCount}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Calculated from actual orders
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleEditShop} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Shop'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
