import { getWeddingBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { VenuesEditor } from './VenuesEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Venues' }

export default async function VenuesPage({ params }: Props) {
  const { slug } = await params
  const wedding = await getWeddingBySlug(slug)
  if (!wedding) notFound()

  return (
    <VenuesEditor
      weddingId={wedding.id}
      slug={slug}
      initial={wedding.venue_data as never}
    />
  )
}
