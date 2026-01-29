'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  rating: number
  reviews: number
  image: string
  isFeatured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  children: {
    id: string
    name: string
    slug: string
  }[]
}

interface SearchParams {
  page?: string
  sort?: string
}

interface CategoryProductsClientProps {
  category: Category
  products: Product[]
  total: number
  pages: number
  page: number
  searchParams: SearchParams
}

export function CategoryProductsClient({
  category,
  products,
  total,
  pages,
  page,
  searchParams,
}: CategoryProductsClientProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState(searchParams.sort || '')

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const params = new URLSearchParams()
    if (value) params.set('sort', value)
    router.push(`/categories/${category.slug}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/categories" className="text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading truncate">
          {category.name}
        </h1>
        <Link href="/cart" className="text-white">
          <Icon icon="solar:cart-large-linear" className="size-6" />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Icon icon="solar:arrow-right-linear" className="size-4" />
              <Link href="/categories" className="hover:text-foreground">
                Categories
              </Link>
              <Icon icon="solar:arrow-right-linear" className="size-4" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            <h1 className="text-3xl font-bold font-heading">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
          </div>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Subcategories:</h3>
              <div className="flex flex-wrap gap-2">
                {category.children.map((sub) => (
                  <Link key={sub.id} href={`/categories/${sub.slug}`}>
                    <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {sub.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'product' : 'products'} found
            </p>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-lg text-sm"
            >
              <option value="">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:box-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                This category doesn't have any products yet.
              </p>
              <Link href="/products">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Link
                href={`/categories/${category.slug}?page=${Math.max(1, page - 1)}${
                  searchParams.sort ? `&sort=${searchParams.sort}` : ''
                }`}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <Button variant="outline" size="icon">
                  <Icon icon="solar:arrow-left-linear" className="size-4" />
                </Button>
              </Link>

              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {pages}
              </span>

              <Link
                href={`/categories/${category.slug}?page=${Math.min(pages, page + 1)}${
                  searchParams.sort ? `&sort=${searchParams.sort}` : ''
                }`}
                className={page >= pages ? 'pointer-events-none opacity-50' : ''}
              >
                <Button variant="outline" size="icon">
                  <Icon icon="solar:arrow-right-linear" className="size-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
