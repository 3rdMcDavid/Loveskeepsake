import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getWeddingBySlug } from '@/lib/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ManageNav } from './ManageNav'
import { coupleDisplay } from '@/lib/coupleDisplay'

export default async function ManageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [user, wedding] = await Promise.all([
    getCurrentUser(),
    getWeddingBySlug(slug),
  ])

  if (!user) redirect(`/${slug}/sign-in`)
  if (!wedding) notFound()

  const isCouple =
    wedding.couple_user_id === user.id ||
    (!wedding.couple_user_id && wedding.couple_email === user.email)

  if (!isCouple) redirect('/')

  if (!wedding.couple_user_id) {
    const supabase = await createClient()
    await supabase
      .from('weddings')
      .update({ couple_user_id: user.id })
      .eq('id', wedding.id)
  }

  async function signOut() {
    'use server'
    const { createClient: cc } = await import('@/lib/supabase/server')
    const sb = await cc()
    await sb.auth.signOut()
    redirect(`/${slug}/sign-in`)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-serif text-stone-800">
              {coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
            </span>
            <span className="ml-2 text-xs text-stone-400">Planning</span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
              Sign out
            </button>
          </form>
        </div>
        <Suspense fallback={<div className="h-8" />}>
          <ManageNav slug={slug} />
        </Suspense>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
