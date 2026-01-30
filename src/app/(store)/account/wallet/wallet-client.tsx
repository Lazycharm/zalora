'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface WalletClientProps {
  balance: number
}

export function WalletClient({ balance }: WalletClientProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          My Wallet
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold font-heading">Wallet Management</h1>
            <p className="text-muted-foreground mt-2">Manage your account balance</p>
          </div>

          {/* Balance Card */}
          <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-90">Available Balance</span>
                <Icon icon="solar:wallet-bold" className="size-6" />
              </div>
              <div className="text-4xl font-bold mb-6">{formatPrice(balance)}</div>
              <div className="flex gap-3">
                <Link href="/account/wallet/topup" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
                    Top Up
                  </Button>
                </Link>
                <Link href="/account/wallet/withdraw" className="flex-1">
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    <Icon icon="solar:download-bold" className="mr-2 size-4" />
                    Withdraw
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Icon icon="solar:receipt-linear" className="size-16 mb-4 opacity-30" />
                <p>No transactions yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
