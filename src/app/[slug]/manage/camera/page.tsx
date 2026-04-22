import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { QRDownload } from './QRDownload'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Camera' }

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function CameraPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, family_name, partner1_name, partner2_name, wedding_date')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const [{ data: cameras }, { data: recentPhotos }] = await Promise.all([
    supabase
      .from('guest_cameras')
      .select('shots_used')
      .eq('wedding_id', wedding.id),
    supabase
      .from('guest_photos')
      .select('uploaded_at')
      .eq('wedding_id', wedding.id)
      .order('uploaded_at', { ascending: false })
      .limit(1),
  ])

  const totalPhotos = cameras?.reduce((s, c) => s + (c.shots_used ?? 0), 0) ?? 0
  const uniqueDevices = cameras?.length ?? 0
  const avgPhotos = uniqueDevices > 0 ? Math.round(totalPhotos / uniqueDevices) : 0
  const lastUpload = recentPhotos?.[0]?.uploaded_at ?? null

  const coupleName = coupleDisplay(
    wedding.partner1_name,
    wedding.partner2_name,
    wedding.family_name,
  )

  const unlockDate = wedding.wedding_date
    ? new Date(
        new Date(wedding.wedding_date).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const stats = [
    { label: 'Photos', value: totalPhotos.toString() },
    { label: 'Devices', value: uniqueDevices.toString() },
    { label: 'Avg / Device', value: avgPhotos.toString() },
    {
      label: 'Last Upload',
      value: lastUpload
        ? new Date(lastUpload).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '—',
    },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-light tracking-wide text-stone-800"
          style={{ fontFamily: CF }}
        >
          Guest Camera
        </h1>
        <p
          className="text-sm mt-1 italic"
          style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}
        >
          Share the QR code at your venue — each guest gets 20 shots
        </p>
      </div>

      {/* Camera active indicator */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-stone-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="text-sm text-stone-600">Camera Active</span>
        <span className="ml-auto text-xs text-stone-400 tracking-wide hidden sm:block">
          loveskeepsake.com/{slug}/cam
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-stone-200 p-4 text-center"
          >
            <p
              className="text-3xl font-light text-stone-800"
              style={{ fontFamily: CF }}
            >
              {value}
            </p>
            <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* QR code panel */}
      <QRDownload slug={slug} coupleName={coupleName} />

      {/* Gallery teaser */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-light text-stone-800"
            style={{ fontFamily: CF }}
          >
            Photo Gallery
          </h2>
          {unlockDate && (
            <span className="text-xs text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
              Unlocks {unlockDate}
            </span>
          )}
        </div>

        {/* Blurred placeholder grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg"
              style={{
                background:
                  i % 3 === 0 ? '#f5f0eb' : i % 3 === 1 ? '#ede7df' : '#d9cfc4',
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-stone-500">
            {totalPhotos > 0
              ? `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} captured so far`
              : 'No photos yet — share the QR code to get started'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Photos will be viewable 7 days after your wedding
          </p>
        </div>
      </div>
    </div>
  )
}
