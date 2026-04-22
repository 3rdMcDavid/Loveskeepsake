import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SECTIONS, sectionProgress, computeProgress, type CustomConfig } from './checklist/checklistData'

interface Props {
  state: Record<string, Record<string, boolean>>
  customConfig: CustomConfig
  slug: string
  coupleNames: string
  weddingDate: string
  weddingId: string
}

export async function OverviewDashboard({
  state,
  customConfig,
  slug,
  coupleNames,
  weddingDate,
  weddingId,
}: Props) {
  const overall = computeProgress(state, customConfig)
  const cf = "var(--font-cormorant), 'Georgia', serif"

  const supabase = await createClient()

  // Fetch camera stats
  const { data: cameras } = await supabase
    .from('guest_cameras')
    .select('shots_used')
    .eq('wedding_id', weddingId)
  const totalPhotos = cameras?.reduce((s, c) => s + (c.shots_used ?? 0), 0) ?? 0
  const uniqueDevices = cameras?.length ?? 0

  // Fetch seating stats
  const { data: plan } = await supabase
    .from('seating_plans')
    .select('id')
    .eq('wedding_id', weddingId)
    .single()

  let seatingStats = { tables: 0, totalSeats: 0, assigned: 0 }
  if (plan) {
    const { data: tables } = await supabase
      .from('seating_tables')
      .select('seat_count, seats')
      .eq('plan_id', plan.id)
    if (tables) {
      seatingStats = tables.reduce(
        (acc, t) => ({
          tables: acc.tables + 1,
          totalSeats: acc.totalSeats + (t.seat_count ?? 0),
          assigned: acc.assigned + ((t.seats as { name: string }[] ?? []).filter(s => s.name).length),
        }),
        seatingStats
      )
    }
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
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#b8a99a' }}>
              Overall Completion
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

      {/* ── Section grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SECTIONS.map((sec, si) => {
          const sp = sectionProgress(si, state, customConfig)
          const barColor =
            sp.pct === 0 ? '#d9cfc4' : sp.pct === 100 ? '#7a9e7e' : '#c4956a'
          const badgeStyle =
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
                <span
                  className="text-xs px-2 py-0.5 rounded-full tracking-wide"
                  style={badgeStyle}
                >
                  {sp.pct === 0 ? 'Not started' : sp.pct === 100 ? 'Done ✓' : `${sp.pct}%`}
                </span>
              </div>

              <div
                className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900"
                style={{ fontFamily: cf }}
              >
                {sec.title}
              </div>
              <div
                className="text-xs italic mt-0.5"
                style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}
              >
                {sec.script}
              </div>

              <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
                <div
                  className="h-0.5 rounded-full transition-all duration-500"
                  style={{ width: `${sp.pct}%`, background: barColor }}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1.5 tracking-wide">
                {sp.done} of {sp.total} complete
              </p>
            </Link>
          )
        })}

        {/* Guest Camera card */}
        <Link
          href={`/${slug}/manage/camera`}
          className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📷</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full tracking-wide"
              style={
                totalPhotos === 0
                  ? { background: '#f5f0eb', color: '#b8a99a' }
                  : { background: '#e8d5c0', color: '#8a7568' }
              }
            >
              {totalPhotos === 0 ? 'No photos yet' : `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div
            className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900"
            style={{ fontFamily: cf }}
          >
            Guest Camera
          </div>
          <div
            className="text-xs italic mt-0.5"
            style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}
          >
            disposable camera experience
          </div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div
              className="h-0.5 rounded-full transition-all duration-500"
              style={{
                width: uniqueDevices > 0 ? `${Math.min(100, uniqueDevices * 5)}%` : '0%',
                background: '#c4956a',
              }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1.5 tracking-wide">
            {uniqueDevices === 0 ? 'No devices yet' : `${uniqueDevices} device${uniqueDevices !== 1 ? 's' : ''} scanned`}
          </p>
        </Link>

        {/* Seating Planner card */}
        <Link
          href={`/${slug}/seating`}
          className="group block bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">🪑</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full tracking-wide"
              style={
                seatingStats.tables === 0
                  ? { background: '#f5f0eb', color: '#b8a99a' }
                  : { background: '#e8d5c0', color: '#8a7568' }
              }
            >
              {seatingStats.tables === 0 ? 'Not started' : `${seatingStats.tables} tables`}
            </span>
          </div>
          <div
            className="text-sm font-light leading-tight text-stone-800 group-hover:text-stone-900"
            style={{ fontFamily: cf }}
          >
            Seating Planner
          </div>
          <div
            className="text-xs italic mt-0.5"
            style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}
          >
            arrange your reception
          </div>
          <div className="mt-3 h-0.5 bg-stone-100 rounded-full">
            <div
              className="h-0.5 rounded-full transition-all duration-500"
              style={{
                width: seatingStats.totalSeats > 0
                  ? `${Math.round((seatingStats.assigned / seatingStats.totalSeats) * 100)}%`
                  : '0%',
                background: '#c4956a',
              }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1.5 tracking-wide">
            {seatingStats.totalSeats === 0
              ? 'No tables yet'
              : `${seatingStats.assigned} of ${seatingStats.totalSeats} seats assigned`}
          </p>
        </Link>
      </div>
    </div>
  )
}
