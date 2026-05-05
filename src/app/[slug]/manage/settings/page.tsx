import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SettingsForm } from './SettingsForm'
import { PlanEditor } from './PlanEditor'

type Props = { params: Promise<{ slug: string }> }

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function SettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name, wedding_date, venue_name, venue_address, dress_code, notes, plan_config')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const planConfig = (wedding.plan_config as { mode?: 'preset' | 'scratch'; hiddenSections?: number[] } | null) ?? {}

  return (
    <div className="max-w-2xl space-y-16">

      {/* Wedding details */}
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Wedding Details
          </h1>
          <p className="text-sm italic mt-1" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Fill in your details — they appear on your guest portal and throughout your dashboard
          </p>
        </div>
        <SettingsForm
          weddingId={wedding.id}
          slug={slug}
          initial={{
            family_name: wedding.family_name,
            partner1_name: wedding.partner1_name,
            partner2_name: wedding.partner2_name,
            wedding_date: wedding.wedding_date,
            venue_name: wedding.venue_name,
            venue_address: wedding.venue_address,
            dress_code: wedding.dress_code,
            notes: wedding.notes,
          }}
        />
      </div>

      {/* Plan customisation */}
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Your Plan
          </h1>
          <p className="text-sm italic mt-1" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Customise your checklist style and choose which tabs are visible
          </p>
        </div>
        <PlanEditor
          weddingId={wedding.id}
          slug={slug}
          initial={planConfig}
        />
      </div>

    </div>
  )
}
