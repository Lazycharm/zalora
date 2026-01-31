import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Seller layout: auth runs in Node so cookies are read reliably.
 * Redirects to login with ?redirect=<path> so user returns here after signing in.
 */
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? '/seller'
    const safeRedirect = pathname.startsWith('/seller') ? pathname : '/seller'
    redirect('/auth/login?redirect=' + encodeURIComponent(safeRedirect))
  }

  return <>{children}</>
}
