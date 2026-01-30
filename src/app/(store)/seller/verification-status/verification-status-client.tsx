'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

interface VerificationStatusClientProps {
  verification: {
    id: string
    shopId: string
    status: string
    rejectionReason: string | null
    reviewedAt: string | null
    createdAt: string
  } | null
  shop: {
    id: string
    name: string
    slug: string
    status: string
  } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'solar:clock-circle-bold',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: 'solar:verified-check-bold',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: 'solar:close-circle-bold',
  },
}

export function VerificationStatusClient({
  verification,
  shop,
}: VerificationStatusClientProps) {
  if (!verification) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">KYC Verification Status</h1>
          <Link href="/account">
            <Button variant="outline">
              <Icon icon="solar:arrow-left-linear" className="mr-2 size-4" />
              Back to Account
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon icon="solar:document-text-linear" className="size-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No verification yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You have not applied for a store yet. When you apply and submit your KYC details, your verification status will appear here.
            </p>
            <Link href="/seller/create-shop">
              <Button>
                <Icon icon="solar:shop-bold" className="mr-2 size-4" />
                Apply for a store
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const config = statusConfig[verification.status] || statusConfig.PENDING

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">KYC Verification Status</h1>
        <Link href={verification.status === 'APPROVED' ? '/seller/shop' : '/account'}>
          <Button variant="outline">
            <Icon icon="solar:arrow-left-linear" className="mr-2 size-4" />
            {verification.status === 'APPROVED' ? 'Go to Shop' : 'Back to Account'}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Status</CardTitle>
            <Badge className={config.color}>
              <Icon icon={config.icon} className="mr-1 size-4" />
              {config.label}
            </Badge>
          </div>
          {shop && (
            <p className="text-sm text-muted-foreground">
              Shop: <span className="font-medium text-foreground">{shop.name}</span>
              {shop.status === 'PENDING' && (
                <span className="ml-2 text-amber-600">(Shop approval pending)</span>
              )}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span>{formatDateTime(verification.createdAt)}</span>
            </div>
            {verification.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed</span>
                <span>{formatDateTime(verification.reviewedAt)}</span>
              </div>
            )}
          </div>

          {verification.status === 'PENDING' && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your application is under review. When an admin approves your shop, your verification will be marked as Approved and you will be able to access your shop dashboard.
              </p>
            </div>
          )}

          {verification.status === 'APPROVED' && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                Your verification has been approved. You can now access your shop and start selling.
              </p>
              <Link href="/seller/shop" className="mt-3 inline-block">
                <Button size="sm">
                  <Icon icon="solar:shop-bold" className="mr-2 size-4" />
                  Open Shop Dashboard
                </Button>
              </Link>
            </div>
          )}

          {verification.status === 'REJECTED' && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Rejection reason</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {verification.rejectionReason || 'Your application was not approved. Please contact support for more information.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
