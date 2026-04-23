import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RehearsalEditor } from './RehearsalEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Rehearsal' }

export default async function RehearsalPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, rehearsal_data')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  return (
    <RehearsalEditor
      weddingId={wedding.id}
      slug={slug}
      initial={wedding.rehearsal_data as never}
    />
  )
}
