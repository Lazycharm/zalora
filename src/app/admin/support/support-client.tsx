'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    avatar: string | null
  } | null
  lastMessage: {
    message: string
    senderEmail: string | null
    createdAt: string
  } | null
}

interface SupportTicketsClientProps {
  tickets: Ticket[]
}

export function SupportTicketsClient({ tickets }: SupportTicketsClientProps) {
  const [filter, setFilter] = useState<string>('all')

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RESOLVED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const statusCounts = {
    all: tickets.length,
    OPEN: tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold font-heading">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support requests</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilter('OPEN')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'OPEN'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Open ({statusCounts.OPEN})
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'IN_PROGRESS'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          In Progress ({statusCounts.IN_PROGRESS})
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'RESOLVED'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Resolved ({statusCounts.RESOLVED})
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon icon="solar:chat-round-dots-linear" className="size-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {filter === 'all' 
                ? 'No support tickets have been created yet.'
                : `No tickets with status "${filter}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {ticket.user?.avatar ? (
                      <img
                        src={ticket.user.avatar}
                        alt={ticket.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon icon="solar:user-bold" className="size-6 text-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-base">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ticket.user?.name || 'Guest'} • {ticket.user?.email || ticket.lastMessage?.senderEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>

                    {ticket.lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {ticket.lastMessage.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:ticket-bold" className="size-3" />
                          {ticket.ticketNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:calendar-bold" className="size-3" />
                          {formatDateTime(new Date(ticket.createdAt))}
                        </span>
                      </div>
                      <Link href={`/admin/support/${ticket.id}`} className="text-primary hover:underline font-medium">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
