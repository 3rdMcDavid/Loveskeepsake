import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { ShootCamera } from './ShootCamera'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Camera' }

export default async function ShootPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  return (
    <ShootCamera
      weddingId={wedding.id}
      slug={slug}
      coupleName={coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
    />
  )
}
