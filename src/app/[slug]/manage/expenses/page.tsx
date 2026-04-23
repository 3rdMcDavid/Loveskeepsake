import { createClient } from '@/lib/supabase/server'
import { getWeddingBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { ExpensesEditor } from './ExpensesEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Expenses' }

export default async function ExpensesPage({ params }: Props) {
  const { slug } = await params
  const [wedding, supabase] = await Promise.all([
    getWeddingBySlug(slug),
    createClient(),
  ])
  if (!wedding) notFound()

  const { data: items } = await supabase
    .from('expense_items')
    .select('id, description, amount')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <ExpensesEditor
      weddingId={wedding.id}
      slug={slug}
      initialItems={items ?? []}
      initialCeiling={wedding.budget_ceiling}
    />
  )
}
