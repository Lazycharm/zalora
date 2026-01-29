'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'

export default function BillingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Billing Records
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold font-heading">Billing Records</h1>
            <p className="text-muted-foreground mt-2">View your payment history</p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:bill-list-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No billing records</h3>
              <p className="text-muted-foreground">Your payment history will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
