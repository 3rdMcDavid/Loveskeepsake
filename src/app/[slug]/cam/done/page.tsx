import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Roll Complete' }

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function DonePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('family_name, partner1_name, partner2_name')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const coupleName = coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Icon */}
      <div className="mb-8 text-5xl select-none">🎞️</div>

      {/* Heading */}
      <h1
        className="text-4xl sm:text-5xl font-light tracking-wide mb-5"
        style={{ fontFamily: CF, color: '#faf8f5' }}
      >
        Roll complete
      </h1>

      {/* Count badge */}
      <div
        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10 text-sm tracking-widest uppercase"
        style={{
          background: 'rgba(122,158,126,0.1)',
          color: '#7a9e7e',
          border: '1px solid rgba(122,158,126,0.25)',
        }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7a9e7e' }} />
        20 photos captured
      </div>

      {/* Thank you */}
      <p
        className="text-xl font-light leading-relaxed mb-4 max-w-sm"
        style={{ color: '#d9cfc4', fontFamily: CF }}
      >
        Thank you for celebrating with {coupleName}
      </p>
      <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#8a7568' }}>
        Your photos will be part of their keepsake album — a forever memory of this day.
      </p>

      {/* Divider */}
      <div className="w-12 h-px my-12" style={{ background: '#1a1410' }} />

      {/* Branding */}
      <p
        className="text-xs tracking-widest uppercase"
        style={{ color: '#3d2e28', fontFamily: CF }}
      >
        LoveKeepsake
      </p>
    </div>
  )
}
