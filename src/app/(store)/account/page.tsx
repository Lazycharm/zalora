import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { AccountClient } from './account-client'

export const dynamic = 'force-dynamic'

async function getAccountData(userId: string) {
  const [ordersCount, favoritesCount, userResult, settingResult] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('userId', userId),
    supabaseAdmin.from('favorites').select('*', { count: 'exact', head: true }).eq('userId', userId),
    supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar,
        balance,
        role,
        canSell,
        shops (
          id,
          name
        )
      `)
      .eq('id', userId)
      .single(),
    supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'user_selling_enabled')
      .single(),
  ])

  const user = userResult.data
  const userSellingEnabled = settingResult.data?.value === 'true'
  const shop = user?.shops && Array.isArray(user.shops) && user.shops.length > 0 ? user.shops[0] : null
  const shopId = shop?.id

  let sellerOrdersCount = 0
  if (shopId) {
    const { count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('shopId', shopId)
      .not('status', 'in', '("COMPLETED","CANCELLED","REFUNDED")')
    sellerOrdersCount = count ?? 0
  }

  return {
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          balance: Number(user.balance || 0),
          role: user.role,
          canSell: user.canSell && userSellingEnabled,
          shop,
        }
      : null,
    stats: {
      orders: ordersCount.count || 0,
      favorites: favoritesCount.count || 0,
      sellerOrdersCount,
    },
  }
}

export default async function AccountPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  const data = await getAccountData(currentUser.id)
  
  if (!data.user) {
    redirect('/auth/login')
  }

  return <AccountClient user={data.user} stats={data.stats} />
}
