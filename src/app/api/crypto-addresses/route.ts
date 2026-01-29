import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET active crypto addresses for checkout
export async function GET() {
  try {
    const { data: addresses, error } = await supabaseAdmin
      .from('crypto_addresses')
      .select('id, currency, address, network, label, qrCode')
      .eq('isActive', true)
      .order('currency', { ascending: true })

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
