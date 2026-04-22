'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDeviceId } from '@/lib/deviceId'

const SHOT_LIMIT = 20
const CF = "var(--font-cormorant), 'Georgia', serif"

type ToastKind = 'uploading' | 'success' | 'error'
interface Toast { id: number; kind: ToastKind; msg: string }

interface Props {
  weddingId: string
  slug: string
  coupleName: string
}

export function ShootCamera({ weddingId, slug, coupleName }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [shotsUsed, setShotsUsed] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [allDone, setAllDone] = useState(false)

  const remaining = shotsUsed !== null ? SHOT_LIMIT - shotsUsed : null
  const loading = shotsUsed === null

  useEffect(() => {
    async function init() {
      const id = await getDeviceId()
      setDeviceId(id)

      const supabase = createClient()

      // Get or create guest_cameras record
      let { data } = await supabase
        .from('guest_cameras')
        .select('shots_used')
        .eq('wedding_id', weddingId)
        .eq('device_id', id)
        .maybeSingle()

      if (!data) {
        const { data: created } = await supabase
          .from('guest_cameras')
          .insert({ wedding_id: weddingId, device_id: id, shots_used: 0 })
          .select('shots_used')
          .maybeSingle()
        data = created
      }

      const used = data?.shots_used ?? 0
      if (used >= SHOT_LIMIT) {
        router.replace(`/${slug}/cam/done`)
        return
      }
      setShotsUsed(used)
    }
    init()
  }, [weddingId, slug, router])

  function pushToast(kind: ToastKind, msg: string): number {
    const id = Date.now()
    setToasts(prev => [...prev, { id, kind, msg }])
    if (kind !== 'uploading') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    return id
  }

  function popToast(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleFile = useCallback(async (file: File) => {
    if (!deviceId || shotsUsed === null || shotsUsed >= SHOT_LIMIT || isUploading) return

    setIsUploading(true)
    const loadingId = pushToast('uploading', 'Uploading…')

    try {
      const { default: compress } = await import('browser-image-compression')
      const blob = await compress(file, {
        maxWidthOrHeight: 1200,
        initialQuality: 0.82,
        useWebWorker: true,
        fileType: 'image/jpeg',
      })

      const supabase = createClient()
      const path = `${weddingId}/${deviceId}/${Date.now()}.jpg`

      const { error: upErr } = await supabase.storage
        .from('guest-photos')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

      if (upErr) throw upErr

      await supabase.from('guest_photos').insert({
        wedding_id: weddingId,
        device_id: deviceId,
        storage_path: path,
      })

      const newUsed = shotsUsed + 1
      await supabase
        .from('guest_cameras')
        .update({ shots_used: newUsed, last_shot_at: new Date().toISOString() })
        .eq('wedding_id', weddingId)
        .eq('device_id', deviceId)

      popToast(loadingId)
      setShotsUsed(newUsed)
      pushToast('success', 'Photo saved!')

      if (newUsed >= SHOT_LIMIT) {
        setAllDone(true)
        setTimeout(() => router.push(`/${slug}/cam/done`), 1500)
      }
    } catch {
      popToast(loadingId)
      pushToast('error', 'Upload failed — try again')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [deviceId, shotsUsed, isUploading, weddingId, slug, router])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const lowShots = remaining !== null && remaining > 0 && remaining <= 5
  const shutterDisabled = loading || allDone || isUploading || remaining === 0

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#0a0806' }}>
      {/* Hidden camera input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFileChange}
      />

      {/* Top bar */}
      <div className="flex items-start justify-between px-5 pt-8 pb-4">
        <button
          onClick={() => router.push(`/${slug}/cam`)}
          className="text-xs tracking-widest uppercase pt-1"
          style={{ color: '#8a7568' }}
        >
          ← Back
        </button>

        {/* Shot counter */}
        <div className="text-right">
          {loading ? (
            <div
              className="h-10 w-12 rounded animate-pulse"
              style={{ background: '#1a1410' }}
            />
          ) : (
            <>
              <p
                className="text-5xl font-light leading-none"
                style={{ fontFamily: CF, color: allDone ? '#7a9e7e' : '#faf8f5' }}
              >
                {remaining}
              </p>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: '#8a7568' }}>
                {remaining === 1 ? 'shot left' : 'shots left'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Low shots warning banner */}
      {lowShots && !allDone && (
        <div
          className="mx-5 px-4 py-2 rounded-lg text-center text-sm tracking-wide"
          style={{
            background: 'rgba(196,149,106,0.12)',
            color: '#c4956a',
            border: '1px solid rgba(196,149,106,0.25)',
          }}
        >
          Only {remaining} shot{remaining !== 1 ? 's' : ''} remaining
        </div>
      )}

      {/* All done banner */}
      {allDone && (
        <div
          className="mx-5 px-4 py-2 rounded-lg text-center text-sm"
          style={{
            background: 'rgba(122,158,126,0.12)',
            color: '#7a9e7e',
            border: '1px solid rgba(122,158,126,0.25)',
          }}
        >
          All 20 photos captured — redirecting…
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none w-full px-5">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm shadow-lg w-fit"
            style={{
              background:
                t.kind === 'error' ? '#2a0a0a' :
                t.kind === 'success' ? '#0a1f0d' : '#1a1410',
              color:
                t.kind === 'error' ? '#f87171' :
                t.kind === 'success' ? '#7a9e7e' : '#c4956a',
              border: `1px solid ${
                t.kind === 'error' ? 'rgba(248,113,113,0.3)' :
                t.kind === 'success' ? 'rgba(122,158,126,0.3)' : 'rgba(196,149,106,0.3)'
              }`,
            }}
          >
            {t.kind === 'uploading' && (
              <span
                className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                style={{ background: '#c4956a' }}
              />
            )}
            {t.kind === 'success' && <span className="flex-shrink-0">✓</span>}
            {t.kind === 'error' && <span className="flex-shrink-0">⚠</span>}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-5 pb-14 px-6">
        {/* Status hint */}
        <p className="text-xs tracking-widest uppercase text-center" style={{ color: '#3d2e28' }}>
          {loading
            ? 'loading…'
            : allDone
            ? 'camera locked'
            : isUploading
            ? 'saving…'
            : 'tap to take a photo'}
        </p>

        {/* Shutter button */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={shutterDisabled}
          aria-label="Take photo"
          className="relative flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            width: 88,
            height: 88,
            border: '3px solid rgba(250,248,245,0.8)',
            background: 'transparent',
            flexShrink: 0,
          }}
        >
          <div
            className="rounded-full transition-colors duration-200"
            style={{
              width: 72,
              height: 72,
              background: isUploading ? '#c4956a' : '#faf8f5',
            }}
          />
        </button>

        {/* Couple name */}
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: '#3d2e28', fontFamily: CF }}
        >
          {coupleName}
        </p>
      </div>
    </div>
  )
}
