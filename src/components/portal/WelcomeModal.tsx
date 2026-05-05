'use client'

import { useState, useTransition } from 'react'
import { completeOnboarding } from '@/app/[slug]/manage/planActions'

interface Props {
  weddingId: string
  slug: string
  coupleNames: string
}

const CF = "var(--font-cormorant), 'Georgia', serif"

const FEATURES = [
  { icon: '📊', title: 'Dashboard',    desc: 'Track your overall planning progress at a glance' },
  { icon: '📅', title: 'Checklists',   desc: 'Step-by-step tasks from 12 months out to the big day' },
  { icon: '📋', title: 'Guest List',   desc: 'Manage names, addresses and RSVPs in one place' },
  { icon: '💰', title: 'Expenses',     desc: 'Track spending against your budget in real time' },
  { icon: '🏛️', title: 'Venues',       desc: 'Compare up to 3 venues side by side' },
  { icon: '📷', title: 'Guest Camera', desc: 'Share a QR code so guests can snap candid photos' },
]

export default function WelcomeModal({ weddingId, slug, coupleNames }: Props) {
  const [show, setShow]   = useState(true)
  const [step, setStep]   = useState<1 | 2>(1)
  const [mode, setMode]   = useState<'preset' | 'scratch'>('preset')
  const [isPending, start] = useTransition()

  if (!show) return null

  function handleGotIt() {
    start(async () => {
      await completeOnboarding(weddingId, slug, mode)
      setShow(false)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,14,12,0.72)', backdropFilter: 'blur(2px)' }}
    >
      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">

        {step === 1 ? (
          <>
            {/* Dark hero */}
            <div className="px-8 pt-8 pb-6" style={{ background: '#3d2e28' }}>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#b8a99a' }}>
                Welcome
              </p>
              <h1 className="text-3xl font-light text-white mb-1" style={{ fontFamily: CF }}>
                {coupleNames}
              </h1>
              <p className="text-sm" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
                Your wedding planning suite is ready.
              </p>
            </div>

            {/* Feature grid */}
            <div className="p-8" style={{ background: '#faf8f5' }}>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">
                What's inside
              </p>
              <div className="grid grid-cols-2 gap-3 mb-7">
                {FEATURES.map(f => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-stone-100"
                  >
                    <span className="text-xl mt-0.5 flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-800">{f.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 text-sm tracking-widest uppercase text-white rounded-lg"
                  style={{ background: '#3d2e28' }}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8" style={{ background: '#faf8f5' }}>
            <p className="text-xs tracking-widests uppercase text-stone-400 mb-2">Step 2 of 2</p>
            <h2 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: CF }}>
              How would you like to start?
            </h2>
            <p className="text-sm text-stone-400 mb-6">
              Choose how your checklists are set up. You can change this any time in Settings.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setMode('preset')}
                className={`p-5 text-left rounded-xl border-2 transition-all ${
                  mode === 'preset'
                    ? 'border-stone-800 bg-stone-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span className="text-2xl block mb-3">📋</span>
                <p className="text-sm font-medium text-stone-800 mb-1.5">Use our suggestions</p>
                <p className="text-xs text-stone-400 leading-snug">
                  Checklists come pre-filled with wedding planning milestones. Remove or add anything you like.
                </p>
                {mode === 'preset' && (
                  <p className="text-xs font-medium text-stone-700 mt-2.5">Selected ✓</p>
                )}
              </button>

              <button
                onClick={() => setMode('scratch')}
                className={`p-5 text-left rounded-xl border-2 transition-all ${
                  mode === 'scratch'
                    ? 'border-stone-800 bg-stone-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span className="text-2xl block mb-3">✏️</span>
                <p className="text-sm font-medium text-stone-800 mb-1.5">Start from scratch</p>
                <p className="text-xs text-stone-400 leading-snug">
                  Begin with blank checklists and build your own — add only what matters to you.
                </p>
                {mode === 'scratch' && (
                  <p className="text-xs font-medium text-stone-700 mt-2.5">Selected ✓</p>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleGotIt}
                disabled={isPending}
                className="px-6 py-2.5 text-sm tracking-widest uppercase text-white rounded-lg transition-opacity disabled:opacity-50"
                style={{ background: '#3d2e28' }}
              >
                {isPending ? 'Saving…' : "Got it, let's go →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
