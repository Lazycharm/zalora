'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { formatPrice } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  balance: number
  role: string
  canSell: boolean
  shop: {
    id: string
    name: string
  } | null
}

interface AccountClientProps {
  user: User
  stats: {
    orders: number
    favorites: number
    sellerOrdersCount?: number
  }
}

export function AccountClient({ user, stats }: AccountClientProps) {
  // Menu order and styling from reference: account-management/account-management.tsx
  const menuItems: Array<{ icon: string; label: string; href: string; color: string; show: boolean; badge?: number }> = [
    { icon: 'solar:megaphone-bold', label: 'Wholesale Management', href: '/account/wholesale', color: 'text-chart-1', show: user.canSell },
    { icon: 'solar:shop-bold', label: 'Shop Details', href: user.shop ? '/seller/shop' : '/seller/create-shop', color: 'text-chart-2', show: user.canSell },
    { icon: 'solar:box-bold', label: 'Product Management', href: '/seller/products', color: 'text-chart-2', show: user.canSell && !!user.shop },
    { icon: 'solar:bill-list-bold', label: 'Store Orders', href: '/seller/orders', color: 'text-cyan-500', show: user.canSell && !!user.shop, badge: (stats.sellerOrdersCount ?? 0) || undefined },
    { icon: 'solar:document-text-bold', label: 'Billing records', href: '/account/billing', color: 'text-chart-3', show: true },
    { icon: 'solar:map-point-bold', label: 'Delivery address', href: '/account/addresses', color: 'text-destructive', show: true },
    { icon: 'solar:heart-bold', label: 'Shop Collection', href: '/account/favorites', color: 'text-chart-2', show: true },
    { icon: 'solar:headset-bold', label: 'Service Center', href: '/account/support', color: 'text-destructive', show: true },
    { icon: 'solar:wallet-bold', label: 'Wallet Management', href: '/account/wallet', color: 'text-chart-4', show: true },
    { icon: 'solar:lock-password-bold', label: 'Login Password', href: '/account/password', color: 'text-cyan-500', show: true },
    { icon: 'solar:shield-keyhole-bold', label: 'Payment password', href: '/account/password', color: 'text-chart-3', show: true },
    { icon: 'solar:file-download-bold', label: 'Download the app', href: '#', color: 'text-chart-4', show: true },
    { icon: 'solar:settings-bold', label: 'Set up', href: '/account/settings', color: 'text-cyan-500', show: true },
  ]

  const visibleMenuItems = menuItems.filter((item) => item.show)

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 font-sans text-foreground">
      {/* Header - matches reference */}
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Account Management
        </h1>
        <Link href="/account/settings" className="absolute right-4 text-primary-foreground" aria-label="Settings">
          <Icon icon="solar:globe-linear" className="size-6" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Section - matches reference layout */}
        <div className="flex items-center justify-between p-4 bg-card mb-2">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full overflow-hidden border border-border bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                <Icon icon="solar:user-bold" className="size-8 text-primary" />
              )}
            </div>
            <div>
              <div className="font-bold text-base">{user.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {user.email.replace(/(.{4}).*(@.*)/, '$1****$2')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">ID: {user.id.slice(-8)}</div>
            </div>
          </div>
          <Link href="/account/profile">
            <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Stats - matches reference 4-column grid */}
        <div className="grid grid-cols-4 bg-card py-4 mb-2">
          <Link href="/account/favorites" className="flex flex-col items-center gap-1 border-r border-transparent">
            <span className="text-base font-semibold">{stats.favorites}</span>
            <span className="text-[10px] text-muted-foreground text-center px-1">My Collection</span>
          </Link>
          <div className="flex flex-col items-center gap-1 border-r border-transparent">
            <span className="text-base font-semibold">0</span>
            <span className="text-[10px] text-muted-foreground text-center px-1">Shop Collection</span>
          </div>
          <Link href="/account/orders" className="flex flex-col items-center gap-1 border-r border-transparent">
            <span className="text-base font-semibold">{stats.orders}</span>
            <span className="text-[10px] text-muted-foreground text-center px-1">My Browse</span>
          </Link>
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-bold text-foreground">{formatPrice(user.balance)}</span>
            <span className="text-[10px] text-muted-foreground text-center px-1">Account Balance</span>
          </div>
        </div>

        {/* My Orders - matches reference */}
        <div className="bg-card mb-px">
          <div className="px-4 py-3 text-sm font-semibold border-b border-border">My Orders</div>
          <Link href="/account/orders" className="grid grid-cols-5 py-4">
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:card-linear" className="size-7 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Payment<br />pending
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:box-linear" className="size-7 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Waiting for<br />delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:delivery-linear" className="size-7 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Waiting for<br />receipt
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:chat-square-check-linear" className="size-7 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">Completed</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:restart-linear" className="size-7 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Refund/<br />After-sales
              </span>
            </div>
          </Link>
        </div>

        {/* Top-up / Withdrawal - matches reference (lowercase "top up") */}
        <div className="flex bg-card py-3 mb-2 divide-x divide-border">
          <Link href="/account/wallet/topup" className="flex-1 flex items-center justify-center gap-2 py-1">
            <Icon icon="solar:download-linear" className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium">top up</span>
          </Link>
          <Link href="/account/wallet/withdraw" className="flex-1 flex items-center justify-center gap-2 py-1">
            <Icon icon="solar:upload-linear" className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium">Withdrawal</span>
          </Link>
        </div>

        {/* Apply for a store / Verification - Zalora-specific, before main menu */}
        {!user.shop && user.canSell && (
          <div className="bg-card flex flex-col mb-px">
            <Link href="/seller/create-shop" className="flex items-center px-4 py-3.5 border-b border-border/50 active:bg-muted/30">
              <Icon icon="solar:shop-bold" className="size-6 text-chart-1 mr-3" />
              <span className="flex-1 text-sm font-medium">Apply for a store</span>
              <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
            </Link>
            <Link href="/seller/verification-status" className="flex items-center px-4 py-3.5 active:bg-muted/30">
              <Icon icon="solar:verified-check-bold" className="size-6 text-cyan-500 mr-3" />
              <span className="flex-1 text-sm font-medium">Verification status</span>
              <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
            </Link>
          </div>
        )}

        {/* Menu Items - order and labels from reference */}
        <div className="bg-card flex flex-col">
          {visibleMenuItems.map((item, index) => (
            <Link
              key={item.href + index}
              href={item.href}
              className={`flex items-center px-4 py-3.5 active:bg-muted/30 ${
                index < visibleMenuItems.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <Icon icon={item.icon} className={`size-6 ${item.color} mr-3`} />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="mr-2 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
            </Link>
          ))}

          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <Link href="/admin" className="flex items-center px-4 py-3.5 border-b border-border/50 active:bg-muted/30">
              <Icon icon="solar:shield-keyhole-bold" className="size-6 text-chart-3 mr-3" />
              <span className="flex-1 text-sm font-medium">Admin Panel</span>
              <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
            </Link>
          )}

          <Link href="/auth/logout" className="flex items-center px-4 py-3.5 active:bg-muted/30">
            <Icon icon="solar:logout-bold" className="size-6 text-chart-5 mr-3" />
            <span className="flex-1 text-sm font-medium">Log out</span>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  )
}
