import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GuestSeatLookup from '@/components/portal/GuestSeatLookup'
import type { Metadata } from 'next'
import type { TimelineEvent, Vendor } from '@/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('partner1_name, partner2_name')
    .eq('slug', slug)
    .single()

  if (!wedding) return { title: 'LovesKeepsake' }
  const name = wedding.partner2_name
    ? `${wedding.partner1_name} & ${wedding.partner2_name}`
    : (wedding.partner1_name ?? 'Your Wedding')
  return { title: `${name} — LoveKeepsake` }
}

export default async function CouplePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const [{ data: timeline }, { data: vendors }] = await Promise.all([
    supabase
      .from('timeline_events')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('sort_order'),
    supabase
      .from('vendors')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('category'),
  ])

  const formattedDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b border-stone-100 px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">You&apos;re invited</p>
        <h1 className="text-4xl font-serif text-stone-800">
          {wedding.partner2_name
            ? `${wedding.partner1_name} & ${wedding.partner2_name}`
            : wedding.partner1_name}
        </h1>
        {formattedDate && <p className="text-stone-500 mt-3">{formattedDate}</p>}
        {wedding.venue_name && (
          <p className="text-stone-500 mt-1">{wedding.venue_name}</p>
        )}
        {wedding.venue_address && (
          <p className="text-stone-400 text-sm mt-0.5">{wedding.venue_address}</p>
        )}
        {wedding.dress_code && (
          <p className="mt-3 text-sm text-stone-500">
            <span className="font-medium">Dress code:</span> {wedding.dress_code}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* Seat lookup */}
        <section>
          <h2 className="text-lg font-serif text-stone-700 mb-4">Find Your Seat</h2>
          <GuestSeatLookup weddingId={wedding.id} />
        </section>

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <section>
            <h2 className="text-lg font-serif text-stone-700 mb-4">Day-of Schedule</h2>
            <div className="space-y-3">
              {timeline.map((event: TimelineEvent) => (
                <div key={event.id} className="flex gap-4">
                  <span className="text-sm text-rose-500 font-medium w-16 shrink-0 pt-0.5">
                    {event.time}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-stone-500 mt-0.5">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {wedding.notes && (
          <section>
            <h2 className="text-lg font-serif text-stone-700 mb-2">A Note from the Couple</h2>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{wedding.notes}</p>
          </section>
        )}
      </div>
    </div>
  )
}
