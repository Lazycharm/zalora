import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { AboutPageClient } from './about-client'

// Avoid prerender-time DB access on deploy/build environments.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About Us - ZALORA',
  description: 'Learn more about ZALORA Fashion and our mission',
}

async function getAboutPage() {
  const { data: page, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('slug', 'about')
    .single()

  if (error || !page) {
    return null
  }

  return page
}

export default async function AboutPage() {
  const page = await getAboutPage()

  if (!page || !page.isActive) {
    notFound()
  }

  return <AboutPageClient page={page} />
}
