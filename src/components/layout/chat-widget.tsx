'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { useUIStore } from '@/lib/store'
import { useLanguage } from '@/contexts/language-context'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

const quickQuestionKeys = [
  { id: '1', key: 'trackMyOrder' as const, icon: 'solar:box-linear' },
  { id: '2', key: 'paymentHelp' as const, icon: 'solar:card-linear' },
  { id: '3', key: 'refundPolicy' as const, icon: 'solar:restart-linear' },
  { id: '4', key: 'shippingInfo' as const, icon: 'solar:delivery-linear' },
]

export function ChatWidget() {
  const { t } = useLanguage()
  const isChatOpen = useUIStore((s) => s.isChatOpen)
  const setChatOpen = useUIStore((s) => s.setChatOpen)
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (isChatOpen) setIsOpen(true)
  }, [isChatOpen])
  const setOpen = (open: boolean) => {
    setIsOpen(open)
    setChatOpen(open)
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Hi! I'm ZALORA's AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [showEscalation, setShowEscalation] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickQuestion = async (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
        credentials: 'include',
      })

      const data = await res.json()

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: res.ok && data.response ? data.response : "I'm sorry, something went wrong. Would you like to create a support ticket?",
          isBot: true,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        if (data.needsEscalation || !res.ok) {
          setShowEscalation(true)
        }
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting. Would you like to create a support ticket instead?",
          isBot: true,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setShowEscalation(true)
      }, 500)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    handleQuickQuestion(input)
    setInput('')
  }

  const handleEscalate = () => {
    setShowEscalation(false)
    setShowTicketForm(true)
    const botMessage: Message = {
      id: Date.now().toString(),
      text: "Great! Please fill in the form below and our team will get back to you within 24 hours.",
      isBot: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const handleSubmitTicket = async () => {
    if (!ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ticketForm.email,
          subject: ticketForm.subject,
          message: ticketForm.message,
          priority: 'MEDIUM',
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ticket')
      }

      toast.success('Support ticket created successfully!')
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Ticket created! Your ticket number is ${data.ticket.ticketNumber}. We'll get back to you at ${ticketForm.email} within 24 hours.`,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      
      setShowTicketForm(false)
      setTicketForm({ email: '', subject: '', message: '' })
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      toast.error(error.message || 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Assistant button: links to Online Customer Service page */}
      <Link
        href="/account/support"
        className={cn(
          'fixed right-4 bottom-24 lg:bottom-6 z-50',
          'bg-primary text-primary-foreground size-14 rounded-xl shadow-lg',
          'flex flex-col items-center justify-center gap-0.5 border-2 border-white/20',
          'hover:scale-105 transition-transform'
        )}
        aria-label="Online Customer Service"
      >
        <div className="relative size-6">
          <Image
            src="/assistant.png"
            alt="Assistant"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-[9px] font-bold">assistant</span>
      </Link>

      {/* Chat Window */}
      <AnimatePresence>
            {(isOpen || isChatOpen) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              'fixed right-4 bottom-40 lg:bottom-24 z-50',
              'w-[calc(100vw-2rem)] max-w-sm',
              'bg-card rounded-xl shadow-2xl border border-border overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <div className="relative size-6">
                    <Image
                      src="/assistant.png"
                      alt="Assistant"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">ZALORA Assistant</h3>
                  <p className="text-[10px] text-white/70">AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <Icon icon="solar:close-circle-linear" className="size-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    msg.isBot
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground ml-auto'
                  )}
                >
                  {msg.text}
                </div>
              ))}

              {showEscalation && (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowEscalation(false)}>
                    No, thanks
                  </Button>
                  <Button size="sm" onClick={handleEscalate}>
                    Yes, connect me
                  </Button>
                </div>
              )}

              {showTicketForm && (
                <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Your Email</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Subject</label>
                    <Input
                      placeholder="What do you need help with?"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Message</label>
                    <Textarea
                      placeholder="Describe your issue..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setShowTicketForm(false)
                        setTicketForm({ email: '', subject: '', message: '' })
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitTicket}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {!showTicketForm && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestionKeys.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuickQuestion(t(q.key))}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-[11px] font-medium hover:bg-muted/80 transition-colors"
                    >
                      <Icon icon={q.icon} className="size-3" />
                      {t(q.key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            {!showTicketForm && (
              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Icon icon="solar:arrow-right-linear" className="size-5" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
