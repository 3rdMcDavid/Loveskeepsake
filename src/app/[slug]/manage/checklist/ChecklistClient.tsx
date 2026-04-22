'use client'

import { useState } from 'react'
import {
  SECTIONS,
  getEffectiveGroups,
  sectionProgress,
  computeProgress,
  type CustomConfig,
} from './checklistData'

interface Props {
  coupleNames: string
  weddingDate: string
  state: Record<string, Record<string, boolean>>
  customConfig: CustomConfig
  slug: string
}

const CF = "var(--font-cormorant), 'Georgia', serif"

export function ChecklistClient({ coupleNames, weddingDate, state, customConfig, slug }: Props) {
  const [openCards, setOpenCards] = useState<Set<number>>(new Set(SECTIONS.map((_, i) => i)))
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const overall = computeProgress(state, customConfig)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${slug}/checklist`
      : `/${slug}/checklist`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function toggleCard(si: number) {
    setOpenCards(prev => {
      const next = new Set(prev)
      next.has(si) ? next.delete(si) : next.add(si)
      return next
    })
  }

  return (
    <div>
      {/* Progress hero */}
      <div className="mb-6 rounded-xl overflow-hidden" style={{ background: '#3d2e28' }}>
        <div className="px-6 py-5 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-48">
            <p className="text-xs tracking-widest uppercase" style={{ color: '#b8a99a' }}>
              Wedding Planning Suite
            </p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide mt-1"
              style={{ fontFamily: CF, color: '#ede7df' }}>
              {coupleNames}
            </h2>
            <p className="text-xs mt-1 tracking-wide" style={{ color: '#b8a99a' }}>{weddingDate}</p>
          </div>
          <div className="flex-1 min-w-52">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#b8a99a' }}>
              Overall Completion
            </p>
            <div className="text-5xl font-light leading-none" style={{ fontFamily: CF, color: '#faf8f5' }}>
              {overall.pct}<span className="text-xl ml-1" style={{ color: '#b8a99a' }}>%</span>
            </div>
            <div className="mt-3 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="h-0.5 rounded-full transition-all duration-700"
                style={{ width: `${overall.pct}%`, background: '#c4956a' }} />
            </div>
            <p className="text-xs mt-2 tracking-wide" style={{ color: '#b8a99a' }}>
              {overall.done} of {overall.total} tasks ticked off
            </p>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="space-y-0.5">
        {SECTIONS.map((sec, si) => {
          const sp = sectionProgress(si, state, customConfig)
          const groups = getEffectiveGroups(sec, si, customConfig)
          const isOpen = openCards.has(si)
          const barCls = sp.pct === 0 ? 'bg-stone-300' : sp.pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
          const statusCls = sp.pct === 0
            ? 'bg-stone-100 text-stone-400'
            : sp.pct === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
          const iconBg = sp.pct === 0 ? 'bg-stone-100' : sp.pct === 100 ? 'bg-emerald-50' : 'bg-amber-50'

          return (
            <div key={si} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <div
                className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-stone-50 select-none"
                onClick={() => toggleCard(si)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 ${iconBg}`}>
                  {sec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
                    {sec.title}
                  </div>
                  <div className="text-xs italic text-amber-600" style={{ fontFamily: "'Georgia', serif" }}>
                    {sec.script}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{sp.done} of {sp.total} complete</div>
                </div>
                <div className="hidden sm:flex items-center gap-3 w-36 flex-shrink-0">
                  <div className="flex-1 h-0.5 bg-stone-100 rounded-full">
                    <div className={`h-0.5 rounded-full transition-all duration-500 ${barCls}`} style={{ width: `${sp.pct}%` }} />
                  </div>
                  <span className="text-xs text-stone-400 w-8 text-right">{sp.pct}%</span>
                </div>
                <span className={`hidden sm:block text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${statusCls}`}>
                  {sp.pct === 0 ? 'Not started' : sp.pct === 100 ? 'Complete ✓' : 'In progress'}
                </span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {isOpen && (
                <div className="border-t border-stone-100 px-6 pb-5">
                  {groups.map((group, gi) => (
                    <div key={gi} className="mt-5">
                      <p className="text-xs tracking-widest uppercase text-stone-400 pb-2 border-b border-stone-100 mb-2">
                        {group.label}
                      </p>
                      {group.items.map(item => (
                        <div key={item.key} className="flex items-start gap-3.5 py-2.5 border-b border-stone-50 last:border-0">
                          <div
                            className={`flex-shrink-0 mt-0.5 border rounded-sm flex items-center justify-center ${
                              state[`s${si}`]?.[item.key]
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-stone-300'
                            }`}
                            style={{ width: 18, height: 18 }}
                          >
                            {state[`s${si}`]?.[item.key] && (
                              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                                <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm leading-snug ${state[`s${si}`]?.[item.key] ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                              {item.label}
                            </p>
                            {item.sub && <p className="text-xs text-stone-400 mt-0.5">{item.sub}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-stone-400 tracking-widest mt-8 py-6">
        Crafted with care by{' '}
        <span className="italic" style={{ fontFamily: "'Georgia', serif", color: '#c4956a' }}>LoveKeepsake</span>
        {' '}· Your memories, beautifully kept
      </p>

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(61,46,40,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShareOpen(false) }}
        >
          <div className="bg-white w-full max-w-md p-10">
            <h3 className="text-xl font-light tracking-wide text-stone-800 mb-1" style={{ fontFamily: CF }}>
              Share Your Progress
            </h3>
            <p className="text-sm italic mb-5" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
              with guests & family
            </p>
            <div className="flex border border-stone-200 mb-4">
              <input type="text" readOnly value={shareUrl}
                className="flex-1 px-3 py-2.5 text-xs text-stone-500 bg-stone-50 outline-none tracking-wide" />
              <button onClick={copyLink}
                className="px-4 py-2.5 text-xs tracking-widest uppercase text-white transition-colors"
                style={{ background: copied ? '#7a9e7e' : '#c4956a' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed pt-3 border-t border-stone-100">
              Read-only access only · No account required to view
            </p>
            <button onClick={() => setShareOpen(false)}
              className="mt-4 w-full border border-stone-200 py-2.5 text-xs tracking-widest uppercase text-stone-400 hover:border-stone-800 hover:text-stone-800 transition-all">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
