import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        messages:ticket_messages (
          id,
          message,
          senderEmail,
          isFromAdmin,
          isAI,
          createdAt
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Users can only view their own tickets; admins/managers can view any
    const isAdmin = session.role === 'ADMIN' || session.role === 'MANAGER'
    if (!isAdmin && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = (ticket.messages || []).sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return NextResponse.json({
      ...ticket,
      messages,
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}
