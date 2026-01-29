'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  } | null
  messages: Array<{
    id: string
    message: string
    senderEmail: string | null
    isFromAdmin: boolean
    isAI: boolean
    createdAt: string
  }>
}

interface TicketDetailClientProps {
  ticket: Ticket
}

export function TicketDetailClient({ ticket: initialTicket }: TicketDetailClientProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState(initialTicket)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setTicket({ ...ticket, status: newStatus })
      toast.success('Status updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (!res.ok) throw new Error('Failed to update priority')

      setTicket({ ...ticket, priority: newPriority })
      toast.success('Priority updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update priority')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (!res.ok) throw new Error('Failed to send reply')

      toast.success('Reply sent successfully')
      setReplyMessage('')
      router.refresh()
    } catch (error) {
      toast.error('Failed to send reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/support">
          <Button variant="ghost" size="icon">
            <Icon icon="solar:arrow-left-linear" className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading">{ticket.subject}</h1>
          <p className="text-muted-foreground">Ticket #{ticket.ticketNumber}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isFromAdmin ? 'flex-row-reverse' : ''}`}
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon={message.isFromAdmin ? 'solar:user-id-bold' : 'solar:user-bold'}
                      className="size-5 text-primary"
                    />
                  </div>
                  <div className={`flex-1 ${message.isFromAdmin ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.isFromAdmin ? 'Admin' : message.senderEmail || 'Customer'}
                      </span>
                      {message.isAI && (
                        <Badge variant="outline" className="text-xs">AI</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(new Date(message.createdAt))}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isFromAdmin
                          ? 'bg-primary text-primary-foreground ml-auto inline-block'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSendReply} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
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
                <div>
                  <p className="font-medium">{ticket.user?.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(new Date(ticket.createdAt))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDateTime(new Date(ticket.updatedAt))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
