import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get admin user email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', session.userId)
      .single()

    // Create the reply message
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('ticket_messages')
      .insert({
        ticketId: params.id,
        senderId: session.userId,
        senderEmail: user?.email || 'admin@zalora.com',
        message,
        isFromAdmin: true,
      })
      .select()
      .single()

    if (replyError) {
      throw replyError
    }

    // Update ticket status to IN_PROGRESS if it's OPEN
    await supabaseAdmin
      .from('support_tickets')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', params.id)
      .eq('status', 'OPEN')

    return NextResponse.json({ success: true, message: reply })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
