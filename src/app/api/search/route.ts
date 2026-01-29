import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] })
    }

    // Search products by name, description, or shortDesc
    // Supabase uses ilike for case-insensitive search
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        comparePrice,
        description,
        shortDesc,
        category:categories!products_categoryId_fkey (
          name
        ),
        images:product_images!inner (
          url
        )
      `)
      .eq('status', 'PUBLISHED')
      .eq('images.isPrimary', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,shortDesc.ilike.%${query}%`)
      .order('totalSales', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    // Format the response
    const formattedProducts = (products || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      image: product.images && product.images.length > 0 ? product.images[0].url : null,
      categoryName: product.category?.name || 'Uncategorized',
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
