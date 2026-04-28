import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { coupleDisplay } from '@/lib/coupleDisplay'
import ResetCredentialsButton from './ResetCredentialsButton'
import EditWeddingForm from './EditWeddingForm'
import DeleteWeddingButton from './DeleteWeddingButton'
import type { Wedding } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function AdminWeddingPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single<Wedding>()

  if (!wedding) notFound()

  const formattedDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date not yet set'

  return (
    <div className="p-8 max-w-2xl">
      {/* Back */}
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
        ← All weddings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">
            {coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
          </h1>
          <p className="text-stone-400 text-sm mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <EditWeddingForm wedding={wedding} />
          <a
            href={`/${wedding.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
          >
            View portal ↗
          </a>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 mb-6">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide">Details</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Slug</dt>
            <dd className="text-stone-800 font-mono">/{wedding.slug}</dd>
          </div>
          {wedding.venue_name && (
            <div className="flex justify-between">
              <dt className="text-stone-500">Venue</dt>
              <dd className="text-stone-800 text-right max-w-xs">
                {wedding.venue_name}
                {wedding.venue_address && <span className="block text-stone-400">{wedding.venue_address}</span>}
              </dd>
            </div>
          )}
          {wedding.dress_code && (
            <div className="flex justify-between">
              <dt className="text-stone-500">Dress code</dt>
              <dd className="text-stone-800">{wedding.dress_code}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-xl p-6 mb-6">
        <h2 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">Permanently removes this wedding and all associated data.</p>
          <DeleteWeddingButton
            weddingId={wedding.id}
            weddingName={coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
          />
        </div>
      </div>

      {/* Credentials card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Couple Login</h2>
        {wedding.couple_email && wedding.couple_user_id ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-stone-800">{wedding.couple_email}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Login at{' '}
                <span className="font-mono">/{wedding.slug}/sign-in</span>
              </p>
            </div>
            <ResetCredentialsButton
              weddingId={wedding.id}
              coupleUserId={wedding.couple_user_id}
              coupleEmail={wedding.couple_email}
              slug={wedding.slug}
            />
          </div>
        ) : (
          <p className="text-sm text-stone-400">No couple account on file.</p>
        )}
      </div>
    </div>
  )
}
