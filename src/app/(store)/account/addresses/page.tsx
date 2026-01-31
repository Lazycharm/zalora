import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AddressesClient } from './addresses-client'

export const dynamic = 'force-dynamic'

export default async function AddressesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  return <AddressesClient />
}
