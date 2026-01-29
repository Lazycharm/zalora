'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/lib/store'

export function AuthSync() {
  const pathname = usePathname()
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  useEffect(() => {
    // Skip auth check for auth pages and public pages
    if (
      pathname?.startsWith('/auth/') ||
      pathname === '/' ||
      pathname === '/maintenance' ||
      pathname?.startsWith('/products') ||
      pathname?.startsWith('/categories')
    ) {
      return
    }

    // Check if user is still authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        const data = await res.json()
        
        if (res.ok && data.user) {
          // User is authenticated, sync state
          setUser(data.user)
        } else {
          // User is not authenticated, clear state
          clearUser()
        }
      } catch (error) {
        // On error, don't clear user (might be network issue)
        console.error('Auth check error:', error)
      }
    }

    checkAuth()
  }, [pathname, setUser, clearUser])

  return null
}
