'use client'

import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CMSPagesPage() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">CMS Pages</h1>
          <p className="text-muted-foreground">Manage static pages like About, Terms, Privacy Policy</p>
        </div>
        <Button>
          <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
          Add Page
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icon icon="solar:document-text-linear" className="size-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">CMS Page Management</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create and edit static pages like About Us, Terms & Conditions, Privacy Policy, and more. This feature is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
