import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { WithdrawalRecordClient } from './withdrawal-record-client'

export const dynamic = 'force-dynamic'

export default async function WithdrawalRecordPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/auth/login')

  return <WithdrawalRecordClient />
}
