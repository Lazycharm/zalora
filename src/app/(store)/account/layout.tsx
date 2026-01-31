import { getCurrentUser } from '@/lib/auth'
import { SessionCheckAndRefresh } from '@/components/session-check-and-refresh'

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

  // Server didn't get the cookie (e.g. Netlify). Don't run the page — run a
  // client check and router.refresh() so the next request can send cookies.
  return <SessionCheckAndRefresh />
}
