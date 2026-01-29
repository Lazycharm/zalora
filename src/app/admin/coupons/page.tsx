'use client'

import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CouponsPage() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button>
          <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icon icon="solar:ticket-linear" className="size-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Coupon Management</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create discount codes, set expiry dates, and track coupon usage. This feature is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
