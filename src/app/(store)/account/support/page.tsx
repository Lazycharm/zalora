'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Support Center
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold font-heading">Support Center</h1>
            <p className="text-muted-foreground mt-2">Get help with your orders</p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:headphones-round-sound-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No support tickets</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Need help? Contact our support team
              </p>
              <div className="flex gap-2">
                <Button>
                  <Icon icon="solar:chat-round-dots-bold" className="mr-2 size-4" />
                  Live Chat
                </Button>
                <Button variant="outline">
                  <Icon icon="solar:letter-bold" className="mr-2 size-4" />
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
