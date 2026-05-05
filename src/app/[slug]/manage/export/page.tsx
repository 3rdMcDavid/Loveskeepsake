import { createClient } from '@/lib/supabase/server'
import { getWeddingBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { SECTIONS, getEffectiveGroups, type CustomConfig } from '../checklist/checklistData'
import { PrintButton } from './PrintButton'

type Props = { params: Promise<{ slug: string }> }

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function ExportPage({ params }: Props) {
  const { slug } = await params
  const [wedding, supabase] = await Promise.all([
    getWeddingBySlug(slug),
    createClient(),
  ])
  if (!wedding) notFound()

  const [
    { data: checklistRow },
    { data: guests },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('checklist_states').select('state, custom_config').eq('wedding_id', wedding.id).maybeSingle(),
    supabase.from('guest_list').select('full_name, rsvp_confirmed, mailing_address').eq('wedding_id', wedding.id).order('full_name'),
    supabase.from('expense_items').select('description, amount').eq('wedding_id', wedding.id).order('created_at'),
  ])

  const state = (checklistRow?.state ?? {}) as Record<string, Record<string, boolean>>
  const customConfig = (checklistRow?.custom_config ?? {}) as CustomConfig
  const planConfig = (wedding.plan_config as { mode?: 'preset' | 'scratch'; hiddenSections?: number[] } | null) ?? {}
  const mode = planConfig.mode ?? 'preset'
  const hiddenSections = planConfig.hiddenSections ?? []

  const checklistSections = SECTIONS
    .map((sec, si) => ({ sec, si }))
    .filter(({ sec, si }) => !sec.customRoute && !sec.hidden && !hiddenSections.includes(si))

  const guestList = guests ?? []
  const confirmed = guestList.filter(g => g.rsvp_confirmed)
  const unconfirmed = guestList.filter(g => !g.rsvp_confirmed)

  const expenseList = expenses ?? []
  const expenseTotal = expenseList.reduce((s, e) => s + Number(e.amount), 0)
  const budgetCeiling = wedding.budget_ceiling ? Number(wedding.budget_ceiling) : 0

  const formattedDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      })
    : null

  const coupleName = coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)

  return (
    <>
      {/* Hide nav chrome when printing */}
      <style>{`@media print { nav, .print-hide { display: none !important; } }`}</style>

      <div className="max-w-3xl">
        {/* Action bar — hidden on print */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-xl font-light text-stone-800" style={{ fontFamily: CF }}>
              Export Planning Data
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">Print or save as PDF — everything in one page</p>
          </div>
          <PrintButton />
        </div>

        {/* ── Print content starts here ── */}
        <div className="space-y-10">

          {/* Wedding header */}
          <div className="border-b border-stone-200 pb-6">
            <h1 className="text-3xl font-light text-stone-800" style={{ fontFamily: CF }}>{coupleName}</h1>
            {formattedDate && <p className="text-stone-500 mt-1">{formattedDate}</p>}
            {wedding.venue_name && (
              <p className="text-stone-500 mt-0.5">
                {wedding.venue_name}
                {wedding.venue_address ? ` · ${wedding.venue_address}` : ''}
              </p>
            )}
            {wedding.dress_code && (
              <p className="text-stone-400 text-sm mt-1">Dress code: {wedding.dress_code}</p>
            )}
          </div>

          {/* ── Checklist ── */}
          <div>
            <h2 className="text-xs font-medium tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
              Planning Checklist
            </h2>
            <div className="space-y-6">
              {checklistSections.map(({ sec, si }) => {
                const groups = getEffectiveGroups(sec, si, customConfig, mode)
                const sectionState = state[`s${si}`] ?? {}
                const allItems = groups.flatMap(g => g.items)
                if (allItems.length === 0) return null
                const done = allItems.filter(item => sectionState[item.key]).length
                return (
                  <div key={si}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-stone-700 flex items-center gap-2">
                        <span>{sec.icon}</span>
                        {sec.tabLabel}
                      </h3>
                      <span className="text-xs text-stone-400 tabular-nums">{done}/{allItems.length}</span>
                    </div>
                    <div className="space-y-0">
                      {groups.map((group, gi) => (
                        <div key={gi}>
                          {groups.length > 1 && group.items.length > 0 && (
                            <p className="text-xs text-stone-400 uppercase tracking-wide mt-3 mb-1">{group.label}</p>
                          )}
                          {group.items.map(item => {
                            const checked = !!sectionState[item.key]
                            return (
                              <div key={item.key} className="flex items-start gap-2 py-1 border-b border-stone-50 last:border-0">
                                <span className={`mt-0.5 text-sm flex-shrink-0 ${checked ? 'text-emerald-500' : 'text-stone-200'}`}>
                                  {checked ? '✓' : '○'}
                                </span>
                                <span className={`text-sm ${checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                                  {item.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Guest list ── */}
          {guestList.length > 0 && (
            <div className="break-before-page">
              <h2 className="text-xs font-medium tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
                Guest List · {guestList.length} total · {confirmed.length} confirmed
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                {[...confirmed, ...unconfirmed].map((g, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 border-b border-stone-50">
                    <span className={`text-xs flex-shrink-0 ${g.rsvp_confirmed ? 'text-emerald-500' : 'text-stone-300'}`}>
                      {g.rsvp_confirmed ? '✓' : '○'}
                    </span>
                    <span className="text-sm text-stone-700 truncate">{g.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Expenses ── */}
          {expenseList.length > 0 && (
            <div>
              <h2 className="text-xs font-medium tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
                Budget & Expenses
                {budgetCeiling > 0 && ` · Budget $${Math.round(budgetCeiling).toLocaleString()}`}
              </h2>
              <div className="space-y-0.5">
                {expenseList.map((e, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-stone-50 text-sm">
                    <span className="text-stone-700">{e.description}</span>
                    <span className="text-stone-600 tabular-nums">${Number(e.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-sm font-medium">
                  <span className="text-stone-800">Total</span>
                  <span className="text-stone-800 tabular-nums">
                    ${expenseTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {budgetCeiling > 0 && (
                      <span className="font-normal text-stone-400 ml-1">
                        / ${Math.round(budgetCeiling).toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-stone-300 border-t border-stone-100 pt-4 hidden print:block">
            LoveKeepsake · {coupleName} · Printed {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </>
  )
}
