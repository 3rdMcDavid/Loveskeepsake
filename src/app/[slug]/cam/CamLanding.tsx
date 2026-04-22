'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDeviceId } from '@/lib/deviceId'

const SHOT_LIMIT = 20
const CF = "var(--font-cormorant), 'Georgia', serif"

interface Props {
  weddingId: string
  slug: string
  coupleName: string
  weddingDate: string | null
  venueName: string | null
}

export function CamLanding({ weddingId, slug, coupleName, weddingDate, venueName }: Props) {
  const router = useRouter()
  const [shotsRemaining, setShotsRemaining] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const deviceId = await getDeviceId()
      const supabase = createClient()

      const { data } = await supabase
        .from('guest_cameras')
        .select('shots_used')
        .eq('wedding_id', weddingId)
        .eq('device_id', deviceId)
        .maybeSingle()

      const used = data?.shots_used ?? 0
      if (used >= SHOT_LIMIT) {
        router.replace(`/${slug}/cam/done`)
        return
      }
      setShotsRemaining(SHOT_LIMIT - used)
    }
    load()
  }, [weddingId, slug, router])

  const formattedDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-16 text-center">
      {/* Icon */}
      <div className="mb-8 text-5xl select-none">📷</div>

      {/* Couple name */}
      <h1
        className="text-4xl sm:text-5xl font-light tracking-wide mb-4"
        style={{ fontFamily: CF, color: '#faf8f5' }}
      >
        {coupleName}
      </h1>

      {/* Wedding details */}
      <div className="space-y-1 mb-10">
        {formattedDate && (
          <p className="text-sm tracking-widest uppercase" style={{ color: '#b8a99a' }}>
            {formattedDate}
          </p>
        )}
        {venueName && (
          <p className="text-sm tracking-wide" style={{ color: '#8a7568' }}>
            {venueName}
          </p>
        )}
      </div>

      {/* Shot counter */}
      <div className="mb-10">
        {shotsRemaining === null ? (
          <div
            className="h-5 w-36 rounded-full animate-pulse mx-auto"
            style={{ background: '#1a1410' }}
          />
        ) : (
          <p className="text-sm tracking-widest uppercase" style={{ color: '#c4956a' }}>
            {shotsRemaining} shot{shotsRemaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push(`/${slug}/cam/shoot`)}
        disabled={shotsRemaining === null || shotsRemaining === 0}
        className="px-12 py-4 rounded-full text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: '#c4956a',
          color: '#faf8f5',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Open Camera
      </button>

      <p className="mt-12 text-xs" style={{ color: '#3d2e28' }}>
        Your photos will be part of their keepsake
      </p>
    </div>
  )
}
