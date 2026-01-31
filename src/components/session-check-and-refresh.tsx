'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'

/**
 * Used when the server didn't get the auth cookie (e.g. Netlify). We don't render
 * the protected page at all — we run a client-side session check. If /api/auth/me
 * returns the user, we set the user and router.refresh() so the layout re-runs
 * with cookies and can render the real page. If not, redirect to login.
 */
export function SessionCheckAndRefresh() {
  const router = useRouter()
  const pathname = usePathname()
  const setUser = useUserStore((state) => state.setUser)
  const [message, setMessage] = useState('Checking session...')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const data = await res.json()

        if (cancelled) return

        if (res.ok && data.user) {
          setUser(data.user)
          setMessage('Loading...')
          router.refresh()
          return
        }

        const redirectPath = pathname?.startsWith('/') ? pathname : '/account'
        router.replace('/auth/login?redirect=' + encodeURIComponent(redirectPath))
      } catch {
        if (!cancelled) {
          router.replace('/auth/login?redirect=' + encodeURIComponent(pathname || '/account'))
        }
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [pathname, router, setUser])

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
