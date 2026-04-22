import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChecklistClient } from '../manage/checklist/ChecklistClient'
import type { CustomConfig } from '../manage/checklist/checklistData'
import { coupleDisplay } from '@/lib/coupleDisplay'

type Props = { params: Promise<{ slug: string }> }

export default async function PublicChecklistPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name, wedding_date')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const { data: row } = await supabase
    .from('checklist_states')
    .select('state, custom_config')
    .eq('wedding_id', wedding.id)
    .single()

  const state = (row?.state ?? {}) as Record<string, Record<string, boolean>>
  const customConfig = (row?.custom_config ?? {}) as CustomConfig

  const coupleNames = coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)
  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date not yet set'

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span
            className="text-xl font-light tracking-widest text-stone-800"
            style={{ fontFamily: "var(--font-cormorant), 'Georgia', serif" }}
          >
            LOVEKEEPSAKE
          </span>
          <span className="text-stone-300">·</span>
          <span className="text-sm italic text-stone-400" style={{ fontFamily: "'Georgia', serif" }}>
            Planning Progress
          </span>
          <span className="ml-auto text-xs tracking-widest uppercase bg-stone-800 text-stone-300 px-3 py-1">
            Read-only view
          </span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <ChecklistClient
          coupleNames={coupleNames}
          weddingDate={weddingDate}
          state={state}
          customConfig={customConfig}
          slug={slug}
        />
      </div>
    </div>
  )
}
