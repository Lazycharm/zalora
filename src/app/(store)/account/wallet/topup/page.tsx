import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TopUpClient } from './topup-client'

export const dynamic = 'force-dynamic'

export default async function TopUpPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/auth/login')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('id', currentUser.id)
    .single()

  const balance = Number(user?.balance ?? 0)
  return <TopUpClient balance={balance} />
}
