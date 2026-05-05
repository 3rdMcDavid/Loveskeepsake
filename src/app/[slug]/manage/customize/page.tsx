import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlanEditor } from '../settings/PlanEditor'

type Props = { params: Promise<{ slug: string }> }

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function CustomizePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, plan_config')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const planConfig = (wedding.plan_config as { mode?: 'preset' | 'scratch'; hiddenSections?: number[] } | null) ?? {}

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
          Customize Your Plan
        </h1>
        <p className="text-sm italic mt-1" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
          Choose your checklist style and decide which tabs are visible
        </p>
      </div>

      <PlanEditor
        weddingId={wedding.id}
        slug={slug}
        initial={planConfig}
      />
    </div>
  )
}
