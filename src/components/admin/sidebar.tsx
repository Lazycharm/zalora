'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'solar:home-2-bold',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'solar:users-group-rounded-bold',
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: 'solar:box-bold',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: 'solar:widget-2-bold',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: 'solar:bill-list-bold',
  },
  {
    title: 'Shops & KYC',
    href: '/admin/shops',
    icon: 'solar:shop-bold',
  },
  {
    title: 'Homepage',
    href: '/admin/homepage',
    icon: 'solar:home-smile-bold',
  },
  {
    title: 'Coupons',
    href: '/admin/coupons',
    icon: 'solar:ticket-bold',
  },
  {
    title: 'Support',
    href: '/admin/support',
    icon: 'solar:chat-round-dots-bold',
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: 'solar:bell-bing-bold',
  },
  {
    title: 'CMS Pages',
    href: '/admin/pages',
    icon: 'solar:document-text-bold',
  },
  {
    title: 'Crypto Addresses',
    href: '/admin/crypto-addresses',
    icon: 'solar:wallet-bold',
  },
  {
    title: 'Deposit Approvals',
    href: '/admin/deposits',
    icon: 'solar:download-bold',
  },
  {
    title: 'Withdrawal Approvals',
    href: '/admin/withdrawals',
    icon: 'solar:upload-bold',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'solar:settings-bold',
  },
]

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
          <Image
            src="/images/logo.png"
            alt="ZALORA"
            width={100}
            height={32}
            className="object-contain"
            priority
          />
          <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = 
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon icon={item.icon} className="size-5" />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <Icon icon="solar:user-bold" className="size-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 pb-safe-area z-50">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = 
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon icon={item.icon} className="size-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
