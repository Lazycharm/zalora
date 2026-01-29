import { supabaseAdmin } from '@/lib/supabase'
import { SupportTicketsClient } from './support-client'

export const dynamic = 'force-dynamic'

async function getSupportTickets() {
  const { data: tickets, error } = await supabaseAdmin
    .from('support_tickets')
    .select(`
      *,
      user:users!support_tickets_userId_fkey (
        name,
        email,
        avatar
      ),
      messages:ticket_messages (
        *
      )
    `)
    .order('createdAt', { ascending: false })

  if (error) {
    throw error
  }

  return (tickets || []).map((ticket: any) => {
    const messages = ticket.messages || []
    const lastMessage = messages.length > 0
      ? messages.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null

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
            name: ticket.user.name,
            email: ticket.user.email,
            avatar: ticket.user.avatar,
          }
        : null,
      lastMessage: lastMessage
        ? {
            message: lastMessage.message,
            senderEmail: lastMessage.senderEmail,
            createdAt: lastMessage.createdAt,
          }
        : null,
    }
  })
}

export default async function SupportPage() {
  const tickets = await getSupportTickets()
  return <SupportTicketsClient tickets={tickets} />
}
