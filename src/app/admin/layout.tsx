import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AuthSync } from '@/components/auth-sync'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    console.log('[ADMIN LAYOUT] Getting current user...')
    const user = await getCurrentUser()

    if (!user) {
      console.log('[ADMIN LAYOUT] No user found, redirecting to login')
      redirect('/auth/login')
    }

    console.log(`[ADMIN LAYOUT] User: ${user.email} (${user.role})`)

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      console.log('[ADMIN LAYOUT] Insufficient permissions, redirecting to home')
      redirect('/')
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
  } catch (error) {
    console.error('[ADMIN LAYOUT] Error:', error)
    if (error instanceof Error) {
      console.error('[ADMIN LAYOUT] Error message:', error.message)
      console.error('[ADMIN LAYOUT] Error stack:', error.stack)
    }
    // Redirect to login on database errors
    redirect('/auth/login?error=connection')
  }
}
