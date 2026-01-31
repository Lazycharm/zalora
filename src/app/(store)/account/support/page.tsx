import { getCurrentUser } from '@/lib/auth'
import { SupportClient } from './support-client'

export default async function SupportPage() {
  const user = await getCurrentUser()
  if (!user) return null
  return <SupportClient />
}
