import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { SellerProductFormClient } from '../product-form-client'

export const dynamic = 'force-dynamic'

async function getProduct(id: string, userId: string) {
  if (id === 'new') {
    return null
  }

  // Get user's shop
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('shops (*)')
    .eq('id', userId)
    .single()

  if (!user?.shops || !Array.isArray(user.shops) || user.shops.length === 0) {
    return null
  }

  const shop = user.shops[0]

  // Get product
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      images:product_images (*)
    `)
    .eq('id', id)
    .single()

  if (error || !product) {
    return null
  }

  // Verify product belongs to user's shop
  if (product.shopId !== shop.id) {
    return null
  }

  // Sort images by sortOrder
  const sortedImages = (product.images || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder)

  return {
    ...product,
    images: sortedImages,
  }
}

async function getFormData() {
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('isActive', true)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return {
    categories: (categories || []).map((c: any) => ({ id: c.id, name: c.name })),
  }
}

export default async function SellerProductPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  // Check if user has shop
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('shops (*)')
    .eq('id', currentUser.id)
    .single()

  if (!user?.shops || !Array.isArray(user.shops) || user.shops.length === 0) {
    redirect('/seller/create-shop')
  }

  const [product, formData] = await Promise.all([
    getProduct(params.id, currentUser.id),
    getFormData(),
  ])

  // If editing and product not found, redirect
  if (params.id !== 'new' && !product) {
    redirect('/seller/products')
  }

  // Convert Decimal fields to numbers for client component
  const productData = product
    ? {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        costPrice: product.costPrice ? Number(product.costPrice) : null,
      }
    : null

  return <SellerProductFormClient product={productData} categories={formData.categories} />
}
