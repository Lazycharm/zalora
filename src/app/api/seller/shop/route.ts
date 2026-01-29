import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { ShopStatus } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can sell
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('canSell, shops (*)')
      .eq('id', session.userId)
      .single()

    if (!user?.canSell) {
      return NextResponse.json({ error: 'You do not have permission to create a shop' }, { status: 403 })
    }

    if (user.shops && Array.isArray(user.shops) && user.shops.length > 0) {
      return NextResponse.json({ error: 'You already have a shop' }, { status: 400 })
    }

    const body = await req.json()
    const { name, slug, description, logo, banner } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Create shop
    const { data: shop, error } = await supabaseAdmin
      .from('shops')
      .insert({
        userId: session.userId,
        name,
        slug,
        description: description || null,
        logo: logo || null,
        banner: banner || null,
        status: ShopStatus.PENDING,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error creating shop:', error)
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('shops (*)')
      .eq('id', session.userId)
      .single()

    if (!user?.shops || !Array.isArray(user.shops) || user.shops.length === 0) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const shop = user.shops[0]
    const body = await req.json()
    const { name, slug, description, logo, banner } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description || null
    if (logo !== undefined) updateData.logo = logo || null
    if (banner !== undefined) updateData.banner = banner || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // If slug is being updated, check if it's already taken
    if (slug && slug !== shop.slug) {
      const { data: existing } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('slug', slug)
        .neq('id', shop.id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const { data: updatedShop, error } = await supabaseAdmin
      .from('shops')
      .update(updateData)
      .eq('id', shop.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ shop: updatedShop })
  } catch (error) {
    console.error('Error updating shop:', error)
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}
