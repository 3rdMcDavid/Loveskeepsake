import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SetPasswordForm } from './SetPasswordForm'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function WelcomePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { mode } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${slug}/sign-in`)

  return (
    <SetPasswordForm
      slug={slug}
      mode={mode === 'reset' ? 'reset' : 'welcome'}
    />
  )
}
