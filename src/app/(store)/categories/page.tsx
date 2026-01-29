import { supabaseAdmin } from '@/lib/supabase'
import { CategoriesClient } from './categories-client'

// Avoid prerender-time DB access on deploy/build environments.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Categories - ZALORA',
  description: 'Browse all product categories',
}

async function getCategories() {
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select(`
      *,
      children:categories!categories_parentId_fkey (
        *
      )
    `)
    .eq('isActive', true)
    .is('parentId', null)
    .order('sortOrder', { ascending: true })

  if (error) {
    throw error
  }

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category: any) => {
      const { count } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('categoryId', category.id)

      // Filter active children
      const activeChildren = (category.children || []).filter((c: any) => c.isActive)

      return {
        ...category,
        children: activeChildren,
        _count: {
          products: count || 0,
        },
      }
    })
  )

  return categoriesWithCounts
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  // Default category colors for visual appeal
  const categoryColors = [
    { color: '#E3F2FD', iconColor: '#1976D2' }, // Lifestyle
    { color: '#FFF3E0', iconColor: '#F57C00' }, // Men Shoes
    { color: '#FFF8E1', iconColor: '#FFA000' }, // Women Shoes
    { color: '#F3E5F5', iconColor: '#7B1FA2' }, // Accessories
    { color: '#E0F2F1', iconColor: '#00796B' }, // Men Clothing
    { color: '#FCE4EC', iconColor: '#C2185B' }, // Women Bags
    { color: '#E8EAF6', iconColor: '#303F9F' }, // Men Bags
    { color: '#FBE9E7', iconColor: '#D84315' }, // Women Clothing
    { color: '#F1F8E9', iconColor: '#689F38' }, // Girls
    { color: '#EFEBE9', iconColor: '#5D4037' }, // Boys
    { color: '#E0F7FA', iconColor: '#0097A7' }, // Global
  ]

  return <CategoriesClient categories={categories} />
}
