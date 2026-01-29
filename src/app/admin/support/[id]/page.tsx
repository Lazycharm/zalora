import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { TicketDetailClient } from './ticket-detail-client'

async function getTicket(id: string) {
  const { data: ticket, error } = await supabaseAdmin
    .from('support_tickets')
    .select(`
      *,
      user:users!support_tickets_userId_fkey (
        id,
        name,
        email,
        avatar
      ),
      messages:ticket_messages (
        *
      )
    `)
    .eq('id', id)
    .single()

  if (error || !ticket) {
    return null
  }

  // Sort messages by createdAt
  const sortedMessages = (ticket.messages || []).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    user: ticket.user
      ? {
          id: ticket.user.id,
          name: ticket.user.name,
          email: ticket.user.email,
          avatar: ticket.user.avatar,
        }
      : null,
    messages: sortedMessages.map((msg: any) => ({
      id: msg.id,
      message: msg.message,
      senderEmail: msg.senderEmail,
      isFromAdmin: msg.isFromAdmin,
      createdAt: msg.createdAt,
    })),
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const ticket = await getTicket(params.id)

  if (!ticket) {
    notFound()
  }

  return <TicketDetailClient ticket={ticket} />
}
