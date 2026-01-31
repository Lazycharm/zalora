'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { AuthSync } from '@/components/auth-sync'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setUserStore = useUserStore((state) => state.setUser)
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string; avatar?: string | null; isImpersonating?: boolean } | null>(null)
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const data = await res.json()

        if (cancelled) return

        if (res.ok && data.user) {
          const u = data.user
          if (u.role !== 'ADMIN' && u.role !== 'MANAGER') {
            setStatus('denied')
            router.replace('/')
            return
          }
          setUserStore(u)
          setUser(u)
          setStatus('allowed')
          return
        }

        setStatus('denied')
        router.replace('/auth/login?redirect=' + encodeURIComponent('/admin'))
      } catch {
        if (!cancelled) {
          setStatus('denied')
          router.replace('/auth/login?redirect=' + encodeURIComponent('/admin'))
        }
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [router, setUserStore])

  if (status === 'denied') {
    return null
  }

  if (status !== 'allowed' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthSync />
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <AdminHeader user={user} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
