'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'

interface TicketMessage {
  id: string
  message: string
  senderEmail: string | null
  isFromAdmin: boolean
  isAI: boolean
  createdAt: string
}

interface TicketDetail {
  id: string
  ticketNumber: string
  subject: string
  status: string
  createdAt: string
  messages: TicketMessage[]
}

interface TicketListItem {
  id: string
  ticketNumber: string
  subject: string
  status: string
  createdAt: string
  messages: Array<{ message: string; createdAt: string }>
}

export function SupportClient() {
  const setChatOpen = useUIStore((s) => s.setChatOpen)
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/support/tickets', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setTickets(data.tickets || [])
        }
      } catch (e) {
        console.error('Failed to fetch tickets', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const openTicket = async (id: string) => {
    setLoadingDetail(true)
    setSelectedTicket(null)
    try {
      const res = await fetch(`/api/support/tickets/${id}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSelectedTicket(data)
      }
    } catch (e) {
      console.error('Failed to fetch ticket', e)
    } finally {
      setLoadingDetail(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-center h-14 bg-primary px-4 shadow-sm lg:hidden">
        <Link href="/account" className="absolute left-4 text-white">
          <Icon icon="solar:arrow-left-linear" className="size-6" />
        </Link>
        <h1 className="text-lg font-semibold text-primary-foreground font-heading">
          Support Center
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold font-heading">Support Center</h1>
            <p className="text-muted-foreground mt-2">Your tickets and conversations</p>
          </div>

          {selectedTicket ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                    className="gap-1"
                  >
                    <Icon icon="solar:arrow-left-linear" className="size-4" />
                    Back
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedTicket.ticketNumber}
                  </span>
                </div>
                <h2 className="font-semibold text-lg mb-2">{selectedTicket.subject}</h2>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {selectedTicket.status}
                </span>

                <div className="mt-6 space-y-4">
                  {(selectedTicket.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromAdmin || msg.isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          msg.isFromAdmin || msg.isAI
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="text-xs opacity-80 mb-0.5">
                          {msg.isFromAdmin
                            ? 'Support'
                            : msg.isAI
                              ? 'Assistant'
                              : 'You'}
                          {' · '}
                          {formatDateTime(msg.createdAt)}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon
                      icon="solar:headphones-round-sound-linear"
                      className="size-16 text-muted-foreground/30 mb-4"
                    />
                    <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                      Need help? Start a conversation with our team
                    </p>
                    <Button onClick={() => setChatOpen(true)}>
                      <Icon icon="solar:chat-round-dots-bold" className="mr-2 size-4" />
                      Live Chat
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Your tickets</h2>
                    <Button size="sm" onClick={() => setChatOpen(true)}>
                      New chat
                    </Button>
                  </div>
                  {tickets.map((ticket) => {
                    const latest = Array.isArray(ticket.messages) && ticket.messages.length > 0
                      ? ticket.messages[0]
                      : null
                    return (
                      <Card
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => openTicket(ticket.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{ticket.subject}</p>
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {latest?.message || 'No messages'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ticket.ticketNumber} · {formatDateTime(ticket.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {loadingDetail && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading conversation...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
