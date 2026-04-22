import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { CamLanding } from './CamLanding'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Guest Camera' }

export default async function CamPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name, wedding_date, venue_name')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  return (
    <CamLanding
      weddingId={wedding.id}
      slug={slug}
      coupleName={coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
      weddingDate={wedding.wedding_date}
      venueName={wedding.venue_name}
    />
  )
}
