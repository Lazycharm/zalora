import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? '/account'
    redirect('/auth/login?redirect=' + encodeURIComponent(pathname))
  }

  return <>{children}</>
}
