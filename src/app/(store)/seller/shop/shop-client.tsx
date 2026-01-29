'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
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
  rating: number
  _count: {
    products: number
  }
}

interface ShopStats {
  todayOrders: number
  cumulativeOrders: number
  todaySales: number
  totalSales: number
  todayProfit: number
  totalProfit: number
  followersCount: number
  creditScore: number
}

interface ShopDetailsClientProps {
  shop: Shop
  stats: ShopStats
}

const levelColors: Record<string, string> = {
  BRONZE: 'bg-amber-600',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-purple-500',
}

const levelIcons: Record<string, string> = {
  BRONZE: 'solar:medal-ribbons-star-bold',
  SILVER: 'solar:medal-ribbons-star-bold',
  GOLD: 'solar:medal-ribbons-star-bold',
  PLATINUM: 'solar:medal-ribbons-star-bold',
}

export function ShopDetailsClient({ shop: initialShop, stats }: ShopDetailsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [formData, setFormData] = useState({
    name: initialShop.name,
    slug: initialShop.slug,
    description: initialShop.description || '',
    logo: initialShop.logo || '',
    banner: initialShop.banner || '',
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingLogo(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'shops')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload logo')
      }

      setFormData((prev) => ({ ...prev, logo: data.url }))
      toast.success('Logo uploaded!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingBanner(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'shops')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload banner')
      }

      setFormData((prev) => ({ ...prev, banner: data.url }))
      toast.success('Banner uploaded!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/seller/shop`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update shop')
      }

      toast.success('Shop updated successfully!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Shop Details</h1>
          <p className="text-muted-foreground">Manage your shop information</p>
        </div>
        <Link href="/seller/dashboard">
          <Button variant="outline">
            <Icon icon="solar:arrow-left-linear" className="mr-2 size-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Shop Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Shop Logo */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white flex-shrink-0">
              {initialShop.logo ? (
                <Image
                  src={initialShop.logo}
                  alt={initialShop.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                  <span className="text-white font-bold text-xl">
                    {initialShop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Store Name: {initialShop.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Shop level:</span>
                  <Badge className={`${levelColors[initialShop.level] || 'bg-gray-500'} text-white`}>
                    <Icon icon={levelIcons[initialShop.level] || 'solar:star-bold'} className="mr-1 size-3" />
                    {initialShop.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Account Balance:</span>
                  <span className="font-semibold">{formatPrice(Number(initialShop.balance))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Store Rating:</span>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:star-bold" className="size-4 text-yellow-500" />
                    <span className="font-semibold">{Number(initialShop.rating).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Quantity of products:</span>
                  <span className="font-semibold">{initialShop._count.products}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Credit Score</p>
            <p className="text-3xl font-bold">{stats.creditScore}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Today's Order</p>
            <p className="text-3xl font-bold">{stats.todayOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Cumulative order quantity</p>
            <p className="text-3xl font-bold">{stats.cumulativeOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Today's total sales</p>
            <p className="text-3xl font-bold">{formatPrice(stats.todaySales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total sales</p>
            <p className="text-3xl font-bold">{formatPrice(stats.totalSales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Today's sales profit</p>
            <p className="text-3xl font-bold">{formatPrice(stats.todayProfit)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Sales Profit</p>
            <p className="text-3xl font-bold">{formatPrice(stats.totalProfit)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Number of followers</p>
            <p className="text-3xl font-bold">{stats.followersCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Account Balance</p>
            <p className="text-3xl font-bold">{formatPrice(Number(initialShop.balance))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Settings Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shop Settings</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Shop URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your shop URL: /shop/{formData.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="logo">Shop Logo</Label>
              <div className="mt-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
                {formData.logo && (
                  <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="banner">Shop Banner</Label>
              <div className="mt-2">
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                />
                {formData.banner && (
                  <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-border">
                    <Image src={formData.banner} alt="Banner" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/seller/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
