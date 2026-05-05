import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { QRDownload } from './QRDownload'
import { PhotoReveal } from './PhotoReveal'
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

  const todayStr = new Date().toISOString().slice(0, 10)
  const isUnlocked = !!(wedding.wedding_date && wedding.wedding_date < todayStr)

  const [{ data: cameras }, { data: recentPhotos }, { data: photoRows }] = await Promise.all([
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
    isUnlocked
      ? supabase
          .from('guest_photos')
          .select('id, storage_path, device_id, uploaded_at')
          .eq('wedding_id', wedding.id)
          .order('uploaded_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const totalPhotos = cameras?.reduce((s, c) => s + (c.shots_used ?? 0), 0) ?? 0
  const uniqueDevices = cameras?.length ?? 0
  const avgPhotos = uniqueDevices > 0 ? Math.round(totalPhotos / uniqueDevices) : 0
  const lastUpload = recentPhotos?.[0]?.uploaded_at ?? null

  // Generate signed URLs for revealed photos
  const photos: { id: string; url: string; deviceId: string; uploadedAt: string }[] = []
  if (isUnlocked && photoRows && photoRows.length > 0) {
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

  const coupleName = coupleDisplay(
    wedding.partner1_name,
    wedding.partner2_name,
    wedding.family_name,
  )

  // The day after the wedding date
  const unlockDateLabel = wedding.wedding_date
    ? (() => {
        const d = new Date(wedding.wedding_date + 'T00:00:00Z')
        d.setUTCDate(d.getUTCDate() + 1)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
      })()
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

      {/* Photo gallery reveal */}
      <PhotoReveal
        isUnlocked={isUnlocked}
        photos={photos}
        totalPhotos={totalPhotos}
        unlockDateLabel={unlockDateLabel}
      />
    </div>
  )
}
