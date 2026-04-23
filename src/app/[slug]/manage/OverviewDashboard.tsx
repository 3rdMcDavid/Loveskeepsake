import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SECTIONS, sectionProgress, computeProgress, type CustomConfig } from './checklist/checklistData'

interface VenueData { slots?: { name: string }[] }
interface AttireData { partner1?: string; partner2?: string }
interface RehearsalData { venueName?: string; date?: string }

interface Props {
  state: Record<string, Record<string, boolean>>
  customConfig: CustomConfig
  slug: string
  coupleNames: string
  weddingDate: string
  weddingId: string
  venueData: VenueData | null
  attireData: AttireData | null
  rehearsalData: RehearsalData | null
  budgetCeiling: number | string | null
}

const cf = "var(--font-cormorant), 'Georgia', serif"

export async function OverviewDashboard({
  state,
  customConfig,
  slug,
  coupleNames,
  weddingDate,
  weddingId,
  venueData,
  attireData,
  rehearsalData,
  budgetCeiling: budgetCeilingRaw,
}: Props) {
  const overall = computeProgress(state, customConfig)
  const supabase = await createClient()

  // Fetch remaining data in parallel (wedding fields already passed as props)
  const [
    { data: expenseItems },
    { data: guestRows },
    { data: cameras },
    { data: seatingPlan },
  ] = await Promise.all([
    supabase
      .from('expense_items')
      .select('amount')
      .eq('wedding_id', weddingId),
    supabase
      .from('guest_list')
      .select('rsvp_confirmed')
      .eq('wedding_id', weddingId),
    supabase
      .from('guest_cameras')
      .select('shots_used')
      .eq('wedding_id', weddingId),
    supabase
      .from('seating_plans')
      .select('id')
      .eq('wedding_id', weddingId)
      .maybeSingle(),
  ])

  // Venues
  const venuesFilledCount = (venueData?.slots ?? []).filter(s => s.name?.trim()).length

  // Attire
  const attireFilled = !!(attireData?.partner1?.trim() || attireData?.partner2?.trim())

  // Expenses
  const expenseTotal = (expenseItems ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const budgetCeiling = budgetCeilingRaw ? Number(budgetCeilingRaw) : 0

  // Rehearsal
  const rehearsalFilled = !!(rehearsalData?.venueName?.trim() || rehearsalData?.date)

  // Guest list
  const guestTotal = guestRows?.length ?? 0
  const guestConfirmed = (guestRows ?? []).filter(g => g.rsvp_confirmed).length

  // Camera
  const totalPhotos = (cameras ?? []).reduce((s, c) => s + (c.shots_used ?? 0), 0)
  const uniqueDevices = cameras?.length ?? 0

  // Seating
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

  function badgeStyle(notStarted: boolean, done?: boolean) {
    if (done) return { background: '#d4e6d5', color: '#4a7a50' }
    if (notStarted) return { background: '#f5f0eb', color: '#b8a99a' }
    return { background: '#e8d5c0', color: '#8a7568' }
  }

  return (
    <div>
      {/* ── Progress hero ── */}
      <div className="mb-8 rounded-xl overflow-hidden" style={{ background: '#3d2e28' }}>
        <div className="px-6 py-6 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-48">
            <p className="text-xs tracking-widest uppercase" style={{ color: '#b8a99a' }}>
              Wedding Planning Suite
            </p>
            <h2
              className="text-2xl sm:text-3xl font-light tracking-wide mt-1"
              style={{ fontFamily: cf, color: '#ede7df' }}
            >
              {coupleNames}
            </h2>
            <p className="text-xs mt-1 tracking-wide" style={{ color: '#b8a99a' }}>
              {weddingDate}
            </p>
          </div>
          <div className="flex-1 min-w-52">
            <p className="text-xs tracking-widests uppercase mb-2" style={{ color: '#b8a99a' }}>
              Checklist Completion
            </p>
            <div
              className="text-5xl font-light leading-none"
              style={{ fontFamily: cf, color: '#faf8f5' }}
            >
              {overall.pct}
              <span className="text-xl ml-1" style={{ color: '#b8a99a' }}>%</span>
            </div>
            <div className="mt-3 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div
                className="h-0.5 rounded-full transition-all duration-700"
                style={{ width: `${overall.pct}%`, background: '#c4956a' }}
              />
            </div>
            <p className="text-xs mt-2 tracking-wide" style={{ color: '#b8a99a' }}>
              {overall.done} of {overall.total} tasks complete
            </p>
          </div>
        </div>
      </div>

      {/* ── Custom section cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">

        {/* Venues */}
        <Link href={`/${slug}/manage/venues`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">🏛️</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(venuesFilledCount === 0, venuesFilledCount === 3)}>
              {venuesFilledCount === 0 ? 'Not started' : `${venuesFilledCount} of 3`}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Venues</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>compare your options</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{ width: `${Math.round((venuesFilledCount / 3) * 100)}%`, background: '#c4956a' }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{venuesFilledCount === 0 ? 'No venues added' : `${venuesFilledCount} venue${venuesFilledCount !== 1 ? 's' : ''} compared`}</p>
        </Link>

        {/* Attire */}
        <Link href={`/${slug}/manage/attire`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">💍</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(!attireFilled, attireFilled)}>
              {attireFilled ? 'Added ✓' : 'Not started'}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Attire</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>looks & colour palette</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{ width: attireFilled ? '100%' : '0%', background: '#7a9e7e' }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{attireFilled ? 'Details added' : 'Describe your look'}</p>
        </Link>

        {/* Expenses */}
        <Link href={`/${slug}/manage/expenses`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📊</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(expenseTotal === 0)}>
              {expenseTotal === 0 ? 'Not started' : `$${Math.round(expenseTotal).toLocaleString()}`}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Expenses</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>track your spending</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{
              width: budgetCeiling > 0 ? `${Math.min(100, Math.round((expenseTotal / budgetCeiling) * 100))}%` : '0%',
              background: budgetCeiling > 0 && expenseTotal > budgetCeiling ? '#ef4444' : '#c4956a',
            }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">
            {budgetCeiling > 0 ? `of $${Math.round(budgetCeiling).toLocaleString()} budget` : (expenseItems?.length ?? 0) > 0 ? `${expenseItems?.length} line item${expenseItems?.length !== 1 ? 's' : ''}` : 'No items yet'}
          </p>
        </Link>

        {/* Rehearsal */}
        <Link href={`/${slug}/manage/rehearsal`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">🥂</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(!rehearsalFilled, rehearsalFilled)}>
              {rehearsalFilled ? 'Added ✓' : 'Not started'}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Rehearsal</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>dinner & logistics</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{ width: rehearsalFilled ? '100%' : '0%', background: '#7a9e7e' }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{rehearsalFilled ? 'Details filled in' : 'Venue, date, menu…'}</p>
        </Link>

        {/* Guest List */}
        <Link href={`/${slug}/manage/guest-list`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📋</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(guestTotal === 0)}>
              {guestTotal === 0 ? 'Not started' : `${guestTotal} guest${guestTotal !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Guest List</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>names & RSVPs</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{
              width: guestTotal > 0 ? `${Math.round((guestConfirmed / guestTotal) * 100)}%` : '0%',
              background: '#7a9e7e',
            }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">
            {guestTotal === 0 ? 'No guests yet' : `${guestConfirmed} of ${guestTotal} confirmed`}
          </p>
        </Link>

        {/* Guest Camera */}
        <Link href={`/${slug}/manage/camera`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📷</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(totalPhotos === 0)}>
              {totalPhotos === 0 ? 'No photos yet' : `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Guest Camera</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>disposable camera</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full" style={{ width: uniqueDevices > 0 ? `${Math.min(100, uniqueDevices * 5)}%` : '0%', background: '#c4956a' }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{uniqueDevices === 0 ? 'No devices yet' : `${uniqueDevices} device${uniqueDevices !== 1 ? 's' : ''} scanned`}</p>
        </Link>

      </div>

      {/* ── Checklist section cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SECTIONS.map((sec, si) => {
          if (sec.customRoute || sec.hidden) return null
          const sp = sectionProgress(si, state, customConfig)
          const barColor =
            sp.pct === 0 ? '#d9cfc4' : sp.pct === 100 ? '#7a9e7e' : '#c4956a'
          const badge =
            sp.pct === 0
              ? { background: '#f5f0eb', color: '#b8a99a' }
              : sp.pct === 100
              ? { background: '#d4e6d5', color: '#4a7a50' }
              : { background: '#e8d5c0', color: '#8a7568' }

          return (
            <Link
              key={si}
              href={`/${slug}/manage?section=${si}`}
              className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{sec.icon}</span>
                <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badge}>
                  {sp.pct === 0 ? 'Not started' : sp.pct === 100 ? 'Done ✓' : `${sp.pct}%`}
                </span>
              </div>
              <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>
                {sec.title}
              </div>
              <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
                {sec.script}
              </div>
              <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
                <div className="h-0.5 rounded-full transition-all duration-500" style={{ width: `${sp.pct}%`, background: barColor }} />
              </div>
              <p className="text-xs text-stone-400 mt-1.5 tracking-wide">
                {sp.done} of {sp.total} complete
              </p>
            </Link>
          )
        })}

        {/* Seating Planner */}
        <Link href={`/${slug}/seating`} className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">🪑</span>
            <span className="text-xs px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle(seatingStats.tables === 0)}>
              {seatingStats.tables === 0 ? 'Not started' : `${seatingStats.tables} tables`}
            </span>
          </div>
          <div className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900" style={{ fontFamily: cf }}>Seating Planner</div>
          <div className="text-xs italic mt-0.5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>arrange your reception</div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div className="h-0.5 rounded-full transition-all duration-500" style={{
              width: seatingStats.totalSeats > 0 ? `${Math.round((seatingStats.assigned / seatingStats.totalSeats) * 100)}%` : '0%',
              background: '#c4956a',
            }} />
          </div>
          <p className="text-xs text-stone-400 mt-1.5 tracking-wide">
            {seatingStats.totalSeats === 0 ? 'No tables yet' : `${seatingStats.assigned} of ${seatingStats.totalSeats} seats assigned`}
          </p>
        </Link>
      </div>
    </div>
  )
}
