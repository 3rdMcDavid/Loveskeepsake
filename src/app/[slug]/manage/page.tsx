import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SECTIONS, type CustomConfig, type SectionConfig } from './checklist/checklistData'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { OverviewDashboard } from './OverviewDashboard'
import { SectionView } from './checklist/SectionView'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function ManagePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { section } = await searchParams

  const activeSection =
    section !== undefined && /^\d+$/.test(section) && Number(section) < SECTIONS.length
      ? Number(section)
      : undefined

  // If the section index corresponds to a custom route or hidden section, redirect
  if (activeSection !== undefined) {
    const sec = SECTIONS[activeSection]
    if (sec.customRoute) redirect(`/${slug}/manage/${sec.customRoute}`)
    if (sec.hidden) redirect(`/${slug}/manage`)
  }

  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name, wedding_date')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const { data: checklistRow } = await supabase
    .from('checklist_states')
    .select('state, custom_config')
    .eq('wedding_id', wedding.id)
    .single()

  const state = (checklistRow?.state ?? {}) as Record<string, Record<string, boolean>>
  const customConfig = (checklistRow?.custom_config ?? {}) as CustomConfig

  const coupleNames = coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)
  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date not yet set'

  if (activeSection === undefined) {
    return (
      <OverviewDashboard
        state={state}
        customConfig={customConfig}
        slug={slug}
        coupleNames={coupleNames}
        weddingDate={weddingDate}
        weddingId={wedding.id}
      />
    )
  }

  const sk = `s${activeSection}`
  const initialChecked = (state[sk] ?? {}) as Record<string, boolean>
  const initialConfig: SectionConfig = customConfig[sk] ?? { removed: [], added: [] }

  return (
    <SectionView
      weddingId={wedding.id}
      slug={slug}
      si={activeSection}
      initialChecked={initialChecked}
      initialConfig={initialConfig}
    />
  )
}
