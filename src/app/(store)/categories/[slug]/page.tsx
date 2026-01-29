import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { CategoryProductsClient } from './category-products-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  sort?: string
}

async function getCategoryData(slug: string, searchParams: SearchParams) {
  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .select(`
      *,
      children:categories!categories_parentId_fkey (
        *
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !category) {
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
