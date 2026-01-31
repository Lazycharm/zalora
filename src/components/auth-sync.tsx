'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/lib/store'

const PROTECTED_PREFIXES = ['/account', '/seller', '/checkout']

function isProtectedRoute(pathname: string | null) {
  if (!pathname) return false
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

export function AuthSync() {
  const pathname = usePathname()
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  useEffect(() => {
    if (
      pathname?.startsWith('/auth/') ||
      pathname === '/maintenance' ||
      pathname?.startsWith('/products') ||
      pathname?.startsWith('/categories')
    ) {
      return
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const data = await res.json()

        if (res.ok && data.user) {
          setUser(data.user)
        } else if (!isProtectedRoute(pathname)) {
          clearUser()
        }
      } catch {
        // Don't clear user on network error; server/middleware will redirect if needed
      }
    }

    checkAuth()
  }, [pathname, setUser, clearUser])

  return null
}
