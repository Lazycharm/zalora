import { getCurrentUser } from '@/lib/auth'
import { SessionCheckAndRefresh } from '@/components/session-check-and-refresh'

export const dynamic = 'force-dynamic'

/**
 * Seller layout: if server didn't get the cookie (e.g. Netlify), don't run the page —
 * run SessionCheckAndRefresh and router.refresh() so the next request can send cookies.
 */
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (user) {
    return <>{children}</>
  }

  return <SessionCheckAndRefresh />
}
