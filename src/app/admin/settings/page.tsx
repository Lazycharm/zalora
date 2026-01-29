import { supabaseAdmin } from '@/lib/supabase'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

async function getSettings() {
  const { data: settings, error } = await supabaseAdmin.from('settings').select('*')

  if (error) {
    throw error
  }

  const settingsMap: Record<string, string> = {}
  ;(settings || []).forEach((s: any) => {
    settingsMap[s.key] = s.value
  })

  return settingsMap
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
