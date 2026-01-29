'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  rating?: number
  reviews?: number
  image: string
  isFeatured?: boolean
  categoryName?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
    
    toast.success('Added to cart!')
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col group">
        {/* Product Image */}
        <div className="aspect-[4/5] relative bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
            sizes="(max-width: 768px) 160px, 200px"
          />
        </div>

        {/* Product Info */}
        <div className="p-3.5 flex flex-col flex-1">
          {/* Product Name */}
          <h3 className="text-sm font-normal text-gray-900 line-clamp-2 mb-2.5 min-h-[40px] leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-gray-900">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
