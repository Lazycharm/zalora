import { supabaseAdmin } from '@/lib/supabase'
import { UsersClient } from './users-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  search?: string
  role?: string
  status?: string
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // Build query
  let usersQuery = supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      name,
      avatar,
      role,
      status,
      balance,
      canSell,
      lastLoginAt,
      lastLoginIp,
      createdAt,
      shops (
        id,
        name,
        status
      )
    `, { count: 'exact' })

  // Apply filters
  if (searchParams.search) {
    usersQuery = usersQuery.or(`name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  if (searchParams.role) {
    usersQuery = usersQuery.eq('role', searchParams.role)
  }

  if (searchParams.status) {
    usersQuery = usersQuery.eq('status', searchParams.status)
  }

  // Apply pagination and ordering
  usersQuery = usersQuery
    .order('createdAt', { ascending: false })
    .range(skip, skip + limit - 1)

  const { data: users, count: total, error } = await usersQuery

  if (error) {
    throw error
  }

  return {
    users: (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      balance: Number(u.balance || 0),
      canSell: u.canSell,
      lastLoginAt: u.lastLoginAt || null,
      shop: u.shops && Array.isArray(u.shops) && u.shops.length > 0 ? {
        id: u.shops[0].id,
        name: u.shops[0].name,
        status: u.shops[0].status,
      } : null,
    })),
    total: total || 0,
    pages: Math.ceil((total || 0) / limit),
    page,
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const data = await getUsers(searchParams)
  return <UsersClient {...data} searchParams={searchParams} />
}
