import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AttireEditor } from './AttireEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Attire' }

export default async function AttirePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, attire_data, partner1_name, partner2_name')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  return (
    <AttireEditor
      weddingId={wedding.id}
      slug={slug}
      initial={wedding.attire_data as never}
      partner1Label={wedding.partner1_name ?? 'Partner 1'}
      partner2Label={wedding.partner2_name ?? 'Partner 2'}
    />
  )
}
