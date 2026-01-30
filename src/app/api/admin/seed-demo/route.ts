import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Hero slide image paths (public/slides)
const SLIDE_IMAGES = [
  '/slides/046587279f41690ba8e987c3ce4857b1.jpg',
  '/slides/10f168a0a82e509f71360dab1cba2760.jpg',
  '/slides/90641ab4127cdd0d0613ab926c414e6c.jpg',
  '/slides/d7f05235627baed415adf2a49ef2309f.jpg',
]

const SLIDE_TITLES = [
  'The Icon Event',
  'New Season Arrivals',
  'Style Your Way',
  'Premium Collection',
]
const SLIDE_SUBTITLES = [
  'Iconic Style. Curated For You.',
  'Fresh styles for the new season',
  'Discover trends that define you',
  'Quality fashion at your fingertips',
]
const CTA_TEXTS = ['Shop Now', 'Explore', 'View Collection', 'Get Started']
const CTA_LINKS = ['/products', '/products?sort=newest', '/categories', '/products?featured=1']

// Demo product image paths (public/demo data) - use .webp and .jpg
function getDemoImagePaths(): string[] {
  const paths: string[] = []
  const base = '/demo data'
  for (let i = 1; i <= 60; i++) {
    paths.push(`${base}/demo-data (${i}).webp`)
  }
  for (let i = 1; i <= 5; i++) {
    paths.push(`${base}/demo-data (${i}).jpg`)
  }
  return paths
}

const DEMO_IMAGE_PATHS = getDemoImagePaths()

const PRODUCT_NAMES_BY_CATEGORY: Record<string, string[]> = {
  lifestyle: ['Premium Gift Set', 'Lifestyle Bundle', 'Curated Box', 'Essential Kit', 'Daily Companion', 'Luxe Set', 'Trendy Pack', 'Classic Collection', 'Modern Essentials', 'Style Kit'],
  'men-shoes': ['Classic Oxford', 'Running Sneakers', 'Casual Loafers', 'Leather Boots', 'Canvas Sneakers', 'Formal Derby', 'Slip-On Shoes', 'Athletic Trainers', 'Desert Boots', 'Slip Resistant'],
  'women-shoes': ['Heeled Sandals', 'Ankle Boots', 'Ballet Flats', 'Platform Heels', 'Wedges', 'Espadrilles', 'Pumps', 'Loafers', 'Strappy Heels', 'Comfort Sneakers'],
  accessories: ['Sunglasses', 'Leather Belt', 'Silk Scarf', 'Watch', 'Cap', 'Wallet', 'Crossbody Bag', 'Bracelet', 'Necklace', 'Earrings'],
  'men-clothing': ['Cotton T-Shirt', 'Oxford Shirt', 'Chino Pants', 'Denim Jacket', 'Polo Shirt', 'Sweater', 'Blazer', 'Shorts', 'Hoodie', 'Coat'],
  'women-bags': ['Tote Bag', 'Crossbody', 'Clutch', 'Backpack', 'Satchel', 'Bucket Bag', 'Shoulder Bag', 'Mini Bag', 'Straw Bag', 'Leather Handbag'],
  'men-bags': ['Messenger Bag', 'Backpack', 'Briefcase', 'Duffel', 'Laptop Bag', 'Travel Bag', 'Waist Pack', 'Crossbody', 'Holdall', 'Weekender'],
  'women-clothing': ['Midi Dress', 'Blouse', 'High-Waist Pants', 'Blazer', 'Skirt', 'Jumpsuit', 'Cardigan', 'Jacket', 'Top', 'Coat'],
  girls: ['Floral Dress', 'T-Shirt', 'Leggings', 'Sweater', 'Skirt', 'Jacket', 'Sneakers', 'Hair Clip', 'Backpack', 'Party Dress'],
  boys: ['Polo Shirt', 'Cargo Pants', 'Hoodie', 'Jacket', 'Shorts', 'Sneakers', 'Cap', 'Backpack', 'T-Shirt', 'Jeans'],
  electronics: ['Wireless Earbuds', 'Smart Watch', 'Power Bank', 'Phone Stand', 'Cable Set', 'Charger', 'Speaker', 'Tablet Case', 'Laptop Sleeve', 'USB Hub'],
  'home-garden': ['Throw Pillow', 'Candle Set', 'Vase', 'Rug', 'Plant Pot', 'Blanket', 'Lamp', 'Wall Art', 'Tray', 'Basket'],
}

const SHORT_DESCS = [
  'Premium quality. Designed for comfort and style.',
  'A must-have for your collection.',
  'Perfect for everyday wear.',
  'Crafted with attention to detail.',
  'Trendy and versatile.',
  'Elevate your look with this piece.',
  'Quality materials, timeless design.',
  'Comfort meets style.',
]

const DESCRIPTIONS = [
  'This product is made from high-quality materials to ensure durability and comfort. Perfect for daily use or special occasions. Care instructions included.',
  'Designed with both style and functionality in mind. A versatile addition to your wardrobe that pairs well with multiple outfits.',
  'Experience premium craftsmanship. Each piece is carefully selected to meet our quality standards and deliver the best value.',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const expected = process.env.SEED_SECRET_KEY || 'change-this-in-production'
    if (key !== expected) {
      return NextResponse.json({ error: 'Unauthorized. Use ?key=<SEED_SECRET_KEY>' }, { status: 401 })
    }

    // 1) Replace hero slides with slides from public/slides
    await supabaseAdmin.from('hero_slides').delete().neq('id', '')
    for (let i = 0; i < SLIDE_IMAGES.length; i++) {
      await supabaseAdmin.from('hero_slides').insert({
        title: SLIDE_TITLES[i] ?? SLIDE_TITLES[0],
        subtitle: SLIDE_SUBTITLES[i] ?? SLIDE_SUBTITLES[0],
        image: SLIDE_IMAGES[i],
        mobileImage: null,
        ctaText: CTA_TEXTS[i] ?? pick(CTA_TEXTS),
        ctaLink: CTA_LINKS[i] ?? pick(CTA_LINKS),
        sortOrder: i,
        isActive: true,
      })
    }
    const heroCount = SLIDE_IMAGES.length

    // 2) Categories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, slug')
      .eq('isActive', true)
      .order('sortOrder')

    if (!categories?.length) {
      return NextResponse.json({
        success: true,
        heroSlidesCreated: heroCount,
        demoProductsCreated: 0,
        message: 'Hero slides created. No categories found; run main seed first.',
      })
    }

    // 3) Delete existing demo products (slug starts with demo-)
    await supabaseAdmin.from('products').delete().like('slug', 'demo-%')

    let productCount = 0

    for (const category of categories) {
      const names = PRODUCT_NAMES_BY_CATEGORY[category.slug] ?? Array.from({ length: 10 }, (_, i) => `Demo Product ${i + 1}`)
      for (let n = 1; n <= 10; n++) {
        const name = names[n - 1] ?? `Demo ${category.slug} ${n}`
        const slug = `demo-${category.slug}-${n}`
        const price = Math.round((19.99 + Math.random() * 80) * 100) / 100
        const comparePrice = price * (1.1 + Math.random() * 0.3)
        const stock = 5 + Math.floor(Math.random() * 95)
        const numImages = 1 + Math.floor(Math.random() * 3)
        const urls = pickN(DEMO_IMAGE_PATHS, numImages)
        const primaryUrl = urls[0]!

        const { data: product } = await supabaseAdmin
          .from('products')
          .insert({
            shopId: null,
            categoryId: category.id,
            name,
            slug,
            description: pick(DESCRIPTIONS),
            shortDesc: pick(SHORT_DESCS),
            price,
            comparePrice: Math.round(comparePrice * 100) / 100,
            costPrice: null,
            sku: `DEMO-${category.slug.toUpperCase().replace(/-/g, '')}-${n}`,
            barcode: null,
            stock,
            lowStockAlert: 5,
            weight: null,
            status: 'PUBLISHED',
            isFeatured: n <= 2,
            isPromoted: n === 1,
            rating: 3.5 + Math.random() * 1.5,
            totalReviews: Math.floor(Math.random() * 50),
            totalSales: Math.floor(Math.random() * 30),
            views: Math.floor(Math.random() * 200),
          })
          .select('id')
          .single()

        if (product?.id) {
          productCount++
          for (let i = 0; i < urls.length; i++) {
            await supabaseAdmin.from('product_images').insert({
              productId: product.id,
              url: urls[i],
              alt: `${name} - view ${i + 1}`,
              sortOrder: i,
              isPrimary: i === 0,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      heroSlidesCreated: heroCount,
      demoProductsCreated: productCount,
      categoriesUsed: categories.length,
    })
  } catch (e) {
    console.error('Seed demo failed:', e)
    return NextResponse.json(
      { error: 'Seed demo failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
