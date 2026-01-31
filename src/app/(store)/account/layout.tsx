import { getCurrentUser } from '@/lib/auth'
import { SessionGate } from '@/components/session-gate'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (user) {
    return <>{children}</>
  }

  // Server didn't get the cookie (e.g. Netlify cold start). Let the client
  // try with credentials so we don't log the user out unnecessarily.
  return <SessionGate>{children}</SessionGate>
}
