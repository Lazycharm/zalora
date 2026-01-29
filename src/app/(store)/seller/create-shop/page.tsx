import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { CreateShopClient } from './create-shop-client'

export const dynamic = 'force-dynamic'

export default async function CreateShopPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  // Check if user already has a shop
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('shops (*)')
    .eq('id', currentUser.id)
    .single()

  if (user?.shops && Array.isArray(user.shops) && user.shops.length > 0) {
    redirect('/seller/shop')
  }

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('isActive', true)
    .order('name', { ascending: true })

  return <CreateShopClient categories={(categories || []).map((c: any) => ({ id: c.id, name: c.name }))} />
}
