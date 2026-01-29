import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { FavoritesClient } from './favorites-client'

async function getUserFavorites(userId: string) {
  const { data: favorites, error } = await supabaseAdmin
    .from('favorites')
    .select(`
      userId,
      productId,
      product:products!favorites_productId_fkey (
        id,
        name,
        slug,
        price,
        comparePrice,
        rating,
        totalReviews,
        isFeatured,
        images:product_images!inner (
          url
        )
      )
    `)
    .eq('userId', userId)
    .eq('product.images.isPrimary', true)
    .order('createdAt', { ascending: false })

  if (error) {
    throw error
  }

  return (favorites || []).map((fav: any) => ({
    userId: fav.userId,
    productId: fav.productId,
    product: {
      id: fav.product.id,
      name: fav.product.name,
      slug: fav.product.slug,
      price: Number(fav.product.price),
      comparePrice: fav.product.comparePrice ? Number(fav.product.comparePrice) : null,
      rating: Number(fav.product.rating || 0),
      reviews: fav.product.totalReviews || 0,
      image: fav.product.images && fav.product.images.length > 0 ? fav.product.images[0].url : '/placeholder-product.jpg',
      isFeatured: fav.product.isFeatured,
    },
  }))
}

export default async function FavoritesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const favorites = await getUserFavorites(user.id)

  return <FavoritesClient favorites={favorites} />
}
