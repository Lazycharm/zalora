import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET active crypto addresses for checkout. ?shopId=xxx for seller; no param = admin (shopId is null).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get('shopId')

    let query = supabaseAdmin
      .from('crypto_addresses')
      .select('id, currency, address, network, label, qrCode')
      .eq('isActive', true)
      .order('currency', { ascending: true })

    if (shopId === '' || shopId === null || shopId === undefined) {
      query = query.is('shopId', null)
    } else {
      query = query.eq('shopId', shopId)
    }

    const { data: addresses, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ addresses: addresses || [] })
  } catch (error) {
    console.error('Fetch crypto addresses error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch crypto addresses' },
      { status: 500 }
    )
  }
}
