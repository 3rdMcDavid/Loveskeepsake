import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { coupleDisplay } from '@/lib/coupleDisplay'
import ResetCredentialsButton from './ResetCredentialsButton'
import EditWeddingForm from './EditWeddingForm'
import DeleteWeddingButton from './DeleteWeddingButton'
import type { Wedding } from '@/types'
import { SECTIONS, sectionProgress, computeProgress, type CustomConfig } from '@/app/[slug]/manage/checklist/checklistData'
import RefreshButton from '@/components/admin/RefreshButton'
import { PhotoGrid } from '@/components/admin/PhotoGrid'

type Props = { params: Promise<{ id: string }> }

export default async function AdminWeddingPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: wedding },
    { data: checklistRow },
    { data: expenseItems },
    { data: guestRows },
    { data: cameras },
    { data: seatingPlan },
    { data: photoRows },
  ] = await Promise.all([
    supabase.from('weddings').select('*').eq('id', id).single<Wedding>(),
    supabase.from('checklist_states').select('state, custom_config, updated_at').eq('wedding_id', id).maybeSingle(),
    supabase.from('expense_items').select('amount').eq('wedding_id', id),
    supabase.from('guest_list').select('rsvp_confirmed').eq('wedding_id', id),
    supabase.from('guest_cameras').select('shots_used').eq('wedding_id', id),
    supabase.from('seating_plans').select('id').eq('wedding_id', id).maybeSingle(),
    supabase.from('guest_photos').select('id, storage_path, device_id, uploaded_at').eq('wedding_id', id).order('uploaded_at', { ascending: false }),
  ])

  if (!wedding) notFound()

  // Seating tables (needs the plan ID)
  let seatingStats = { tables: 0, totalSeats: 0, assigned: 0 }
  if (seatingPlan) {
    const { data: tables } = await supabase
      .from('seating_tables')
      .select('seat_count, seats')
      .eq('plan_id', seatingPlan.id)
    if (tables) {
      seatingStats = tables.reduce(
        (acc, t) => ({
          tables: acc.tables + 1,
          totalSeats: acc.totalSeats + (t.seat_count ?? 0),
          assigned: acc.assigned + ((t.seats as { name: string }[] ?? []).filter(s => s.name).length),
        }),
        seatingStats,
      )
    }
  }

  // Photo signed URLs
  const photos: { id: string; url: string; deviceId: string; uploadedAt: string }[] = []
  if (photoRows && photoRows.length > 0) {
    const paths = photoRows.map(p => p.storage_path as string)
    const { data: signedData } = await supabase.storage.from('guest-photos').createSignedUrls(paths, 3600)
    if (signedData) {
      for (let i = 0; i < photoRows.length; i++) {
        const row = photoRows[i]
        const signed = signedData[i]
        if (signed?.signedUrl) {
          photos.push({
            id: row.id as string,
            url: signed.signedUrl,
            deviceId: row.device_id as string,
            uploadedAt: row.uploaded_at as string,
          })
        }
      }
    }
  }

  // Compute progress
  const state = (checklistRow?.state ?? {}) as Record<string, Record<string, boolean>>
  const customConfig = (checklistRow?.custom_config ?? {}) as CustomConfig
  const overall = computeProgress(state, customConfig)

  // Section stats
  const checklistSections = SECTIONS
    .map((sec, si) => ({ sec, si, sp: sectionProgress(si, state, customConfig) }))
    .filter(({ sec }) => !sec.customRoute && !sec.hidden)

  // Derived stats
  const guestTotal = guestRows?.length ?? 0
  const guestConfirmed = (guestRows ?? []).filter(g => g.rsvp_confirmed).length
  const expenseTotal = (expenseItems ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const budgetCeiling = wedding.budget_ceiling ? Number(wedding.budget_ceiling) : 0
  const totalPhotos = (cameras ?? []).reduce((s, c) => s + (c.shots_used ?? 0), 0)
  const uniqueDevices = cameras?.length ?? 0
  const venuesFilledCount = (wedding.venue_data?.slots ?? []).filter(s => s.name?.trim()).length
  const attireFilled = !!(wedding.attire_data?.partner1?.trim() || wedding.attire_data?.partner2?.trim())
  const rehearsalFilled = !!(wedding.rehearsal_data?.venueName?.trim() || wedding.rehearsal_data?.date)

  const formattedDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date not yet set'

  const lastUpdated = checklistRow?.updated_at
    ? new Date(checklistRow.updated_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="px-4 py-6 sm:p-8 max-w-2xl">
      {/* Back */}
      <Link href="/admin/weddings" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
        ← All weddings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-serif text-stone-800">
            {coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
          </h1>
          <p className="text-stone-400 text-sm mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <EditWeddingForm wedding={wedding} />
          <a
            href={`/${wedding.slug}/manage`}
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

      {/* ── Progress section ── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide">Couple Progress</h2>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-stone-400">Last active {lastUpdated}</span>
            )}
            <RefreshButton />
          </div>
        </div>

        {/* Overall progress */}
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
              {overall.pct}<span className="text-lg text-stone-400 ml-0.5">%</span>
            </span>
            <span className="text-xs text-stone-400 pb-1">{overall.done} / {overall.total} checklist tasks</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${overall.pct}%`,
                background: overall.pct === 100 ? '#7a9e7e' : overall.pct > 0 ? '#c4956a' : '#d9cfc4',
              }}
            />
          </div>
        </div>

        {/* Sections at a glance */}
        <div className="space-y-1.5">
          {checklistSections.map(({ sec, si, sp }) => (
            <div key={si} className="flex items-center gap-3 text-sm">
              <span className="w-4 text-base leading-none">{sec.icon}</span>
              <span className="flex-1 text-stone-700">{sec.tabLabel}</span>
              <div className="w-24 h-1 bg-stone-100 rounded-full">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${sp.pct}%`,
                    background: sp.pct === 100 ? '#7a9e7e' : sp.pct > 0 ? '#c4956a' : '#d9cfc4',
                  }}
                />
              </div>
              <span className="text-xs text-stone-400 w-20 text-right tabular-nums">
                {sp.pct === 0 ? 'Not started' : sp.pct === 100 ? 'Done ✓' : `${sp.done}/${sp.total}`}
              </span>
            </div>
          ))}
        </div>

        {/* Key stats */}
        <div className="border-t border-stone-100 pt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          {/* Guests */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Guests</span>
            <span className="text-stone-800">
              {guestTotal === 0
                ? 'None yet'
                : `${guestTotal} added · ${guestConfirmed} confirmed`}
            </span>
          </div>

          {/* Budget */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Budget</span>
            <span className="text-stone-800">
              {expenseTotal === 0 && budgetCeiling === 0
                ? 'Not started'
                : budgetCeiling > 0
                ? `$${Math.round(expenseTotal).toLocaleString()} / $${Math.round(budgetCeiling).toLocaleString()}`
                : `$${Math.round(expenseTotal).toLocaleString()} tracked`}
            </span>
          </div>

          {/* Venues */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Venues</span>
            <span className="text-stone-800">
              {venuesFilledCount === 0 ? 'Not started' : `${venuesFilledCount} of 3 compared`}
            </span>
          </div>

          {/* Attire */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Attire</span>
            <span className="text-stone-800">{attireFilled ? 'Details added ✓' : 'Not started'}</span>
          </div>

          {/* Rehearsal */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Rehearsal</span>
            <span className="text-stone-800">{rehearsalFilled ? 'Details filled ✓' : 'Not started'}</span>
          </div>

          {/* Camera */}
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Guest Camera</span>
            <span className="text-stone-800">
              {totalPhotos === 0
                ? 'No photos yet'
                : `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} · ${uniqueDevices} device${uniqueDevices !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Seating */}
          <div className="flex justify-between text-sm col-span-2">
            <span className="text-stone-500">Seating</span>
            <span className="text-stone-800">
              {seatingStats.tables === 0
                ? 'Not started'
                : `${seatingStats.tables} table${seatingStats.tables !== 1 ? 's' : ''} · ${seatingStats.assigned}/${seatingStats.totalSeats} seats assigned`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Guest Photos ── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Guest Photos</h2>
        <PhotoGrid photos={photos} />
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
