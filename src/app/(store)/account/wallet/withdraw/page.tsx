'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'

export default function WithdrawPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account/wallet" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Withdraw Funds
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:money-bag-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Withdrawal Coming Soon</h3>
              <p className="text-muted-foreground text-center">
                Withdrawal functionality will be available soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
