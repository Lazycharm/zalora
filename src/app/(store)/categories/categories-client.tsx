'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/components/category-icon'
import { useLanguage } from '@/contexts/language-context'
import { getCategoryTranslationKey } from '@/lib/category-translations'
import { LanguageSelector } from '@/components/language-selector'

interface Subcategory {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  image: string | null
  productCount: number
  subcategories: Subcategory[]
  color: string
  iconColor: string
}

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const { t } = useLanguage()
  
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/" className="text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          {t('categories')}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="mobile" />
          <Link href="/cart" className="text-white">
            <Icon icon="solar:cart-large-linear" className="size-6" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Page Title - Desktop */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold font-heading">Shop by Category</h1>
            <p className="text-muted-foreground mt-2">
              Browse our wide selection of products organized by category
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:box-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground">Categories will appear here once added</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => {
                const translationKey = getCategoryTranslationKey(category.slug)
                const categoryName = translationKey ? t(translationKey) : category.name
                
                return (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                      {/* Category Image or Icon */}
                      <div
                        className="aspect-square relative flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: category.color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CategoryIcon 
                            src={category.image}
                            alt={categoryName}
                            icon={category.icon}
                            slug={category.slug}
                            size={120}
                          />
                        </div>
                        
                        {/* Product Count Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="secondary" className="bg-white/90">
                            {category.productCount} items
                          </Badge>
                        </div>
                      </div>

                      {/* Category Info */}
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {categoryName}
                        </h3>
                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {category.description}
                        </p>
                      )}

                      {/* Subcategories */}
                      {category.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <Badge key={sub.id} variant="outline" className="text-[10px]">
                              {sub.name}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{category.subcategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* View Products Link */}
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3">
                        <span>View Products</span>
                        <Icon icon="solar:arrow-right-linear" className="size-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
