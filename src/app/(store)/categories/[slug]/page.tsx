import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { CategoryProductsClient } from './category-products-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  sort?: string
}

function normalizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function getCategoryData(slug: string, searchParams: SearchParams) {
  const slugDecoded = decodeURIComponent(slug || '').trim()
  if (!slugDecoded) return null

  const select = `
    *,
    children:categories!categories_parentId_fkey (
      *
    )
  `

  // Try exact match first
  let result = await supabaseAdmin
    .from('categories')
    .select(select)
    .eq('slug', slugDecoded)
    .maybeSingle()

  // Try normalized slug (lowercase, spaces to hyphens) if no exact match
  if (!result.data && slugDecoded) {
    const normalized = normalizeSlug(slugDecoded) || slugDecoded
    if (normalized !== slugDecoded) {
      result = await supabaseAdmin
        .from('categories')
        .select(select)
        .eq('slug', normalized)
        .maybeSingle()
    }
  }

  // Try case-insensitive match
  if (!result.data) {
    const { data: all } = await supabaseAdmin
      .from('categories')
      .select('id, slug')
      .eq('isActive', true)
    const match = (all || []).find(
      (c: { slug: string }) => c.slug && c.slug.toLowerCase() === slugDecoded.toLowerCase()
    )
    if (match) {
      const byId = await supabaseAdmin
        .from('categories')
        .select(select)
        .eq('id', match.id)
        .single()
      if (byId.data) result = byId
    }
  }

  const category = result.data
  if (!category) {
    return null
  }

  // Filter active children
  const activeChildren = (category.children || []).filter((c: any) => c.isActive)

  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // Build order by
  let orderByColumn = 'createdAt'
  let orderByAscending = false

  if (searchParams.sort === 'price-asc') {
    orderByColumn = 'price'
    orderByAscending = true
  } else if (searchParams.sort === 'price-desc') {
    orderByColumn = 'price'
    orderByAscending = false
  } else if (searchParams.sort === 'popular') {
    orderByColumn = 'totalReviews'
    orderByAscending = false
  } else if (searchParams.sort === 'rating') {
    orderByColumn = 'rating'
    orderByAscending = false
  }

  // Get products with pagination
  let productsQuery = supabaseAdmin
    .from('products')
    .select(`
      *,
      images:product_images!inner (
        url
      )
    `, { count: 'exact' })
    .eq('categoryId', category.id)
    .eq('status', 'PUBLISHED')
    .eq('images.isPrimary', true)
    .order(orderByColumn, { ascending: orderByAscending })
    .range(skip, skip + limit - 1)

  const { data: products, count: total, error: productsError } = await productsQuery

  if (productsError) {
    throw productsError
  }

  return {
    category: {
      ...category,
      children: activeChildren,
    },
    products: (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      rating: Number(p.rating || 0),
      reviews: p.totalReviews || 0,
      image: p.images && p.images.length > 0 ? p.images[0].url : '/placeholder-product.jpg',
      isFeatured: p.isFeatured,
    })),
    total: total || 0,
    pages: Math.ceil((total || 0) / limit),
    page,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  const data = await getCategoryData(params.slug, searchParams)

  if (!data) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryProductsClient
        category={data.category}
        products={data.products}
        total={data.total}
        pages={data.pages}
        page={data.page}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
