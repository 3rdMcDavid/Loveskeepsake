import { createClient } from '@/lib/supabase/server'
import { getWeddingBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { GuestListEditor } from './GuestListEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Guest List' }

export default async function GuestListPage({ params }: Props) {
  const { slug } = await params
  const [wedding, supabase] = await Promise.all([
    getWeddingBySlug(slug),
    createClient(),
  ])
  if (!wedding) notFound()

  const { data: guests } = await supabase
    .from('guest_list')
    .select('id, full_name, mailing_address, rsvp_confirmed')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <GuestListEditor
      weddingId={wedding.id}
      slug={slug}
      initialGuests={guests ?? []}
    />
  )
}
