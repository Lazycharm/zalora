'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'

const withdrawalMethods = [
  { id: 'usdt-erc20', label: 'USDT-ERC20', icon: 'simple-icons:tether', color: 'bg-emerald-500' },
  { id: 'usdt-trc20', label: 'USDT-TRC20', icon: 'simple-icons:tether', color: 'bg-emerald-500' },
  { id: 'eth', label: 'ETH', icon: 'cryptocurrency:eth', color: 'bg-violet-500' },
  { id: 'btc', label: 'BTC', icon: 'cryptocurrency:btc', color: 'bg-amber-500' },
  { id: 'bank', label: 'Online Banking Withdrawal', icon: 'solar:card-bold', color: 'bg-blue-500' },
]

export default function WithdrawPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account/wallet" className="text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Withdrawal Methods
        </h1>
        <Link href="/account/billing" className="text-sm text-primary-foreground">
          Withdrawal Record
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {withdrawalMethods.map((method) => (
                <Link
                  key={method.id}
                  href="/account/wallet/withdraw"
                  className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={`size-10 rounded-full ${method.color} flex items-center justify-center`}>
                    <Icon icon={method.icon} className="size-5 text-white" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{method.label}</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
