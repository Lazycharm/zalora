'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/contexts/language-context'

export default function AccountSettingsPage() {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          {t('settings')}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold font-heading">{t('accountSettings')}</h1>
            <p className="text-muted-foreground mt-2">{t('manageYourPreferences')}</p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('notifications')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('orderUpdates')}</Label>
                    <p className="text-xs text-muted-foreground">{t('getNotifiedAboutOrderStatus')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('promotions')}</Label>
                    <p className="text-xs text-muted-foreground">{t('receiveDealsAndOffers')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('newsletter')}</Label>
                    <p className="text-xs text-muted-foreground">{t('weeklyUpdatesAndNews')}</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('privacy')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('profileVisibility')}</Label>
                    <p className="text-xs text-muted-foreground">{t('showProfileToOtherUsers')}</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('activityStatus')}</Label>
                    <p className="text-xs text-muted-foreground">{t('showWhenActive')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
