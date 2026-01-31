import { getCurrentUser } from '@/lib/auth'
import { SessionGate } from '@/components/session-gate'

export const dynamic = 'force-dynamic'

/**
 * Seller layout: auth runs in Node. If server didn't get the cookie (e.g. Netlify),
 * SessionGate gives the client a chance to send it so we don't log the user out.
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

  return <SessionGate>{children}</SessionGate>
}
