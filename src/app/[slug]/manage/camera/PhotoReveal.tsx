'use client'

import { useState } from 'react'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface Photo {
  id: string
  url: string
  deviceId: string
  uploadedAt: string
}

interface Props {
  isUnlocked: boolean
  photos: Photo[]
  totalPhotos: number
  unlockDateLabel: string | null
}

export function PhotoReveal({ isUnlocked, photos, totalPhotos, unlockDateLabel }: Props) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload(photo: Photo) {
    setDownloading(true)
    try {
      const res = await fetch(photo.url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `photo-${photo.uploadedAt.slice(0, 10)}.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-light text-stone-800" style={{ fontFamily: CF }}>
          Photo Gallery
        </h2>
        {isUnlocked ? (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} ready
          </span>
        ) : (
          unlockDateLabel && (
            <span className="text-xs text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
              Unlocks {unlockDateLabel}
            </span>
          )
        )}
      </div>

      {isUnlocked ? (
        <>
          {photos.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">
              No guest photos were captured.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => setLightbox(photo)}
                  className="aspect-square overflow-hidden rounded-lg bg-stone-100 hover:opacity-90 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Locked — blurred placeholder grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg"
                style={{
                  background: i % 3 === 0 ? '#f5f0eb' : i % 3 === 1 ? '#ede7df' : '#d9cfc4',
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
              Your gallery unlocks the day after your wedding
            </p>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt=""
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-xs text-stone-300">
                {new Date(lightbox.uploadedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(lightbox)}
                  disabled={downloading}
                  className="text-sm text-stone-200 hover:text-white transition-colors disabled:opacity-50"
                >
                  {downloading ? 'Saving…' : 'Download'}
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="text-stone-400 hover:text-white text-sm transition-colors"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Prev / Next */}
            {photos.length > 1 && (() => {
              const idx = photos.findIndex(p => p.id === lightbox.id)
              const prev = photos[idx - 1]
              const next = photos[idx + 1]
              return (
                <>
                  {prev && (
                    <button
                      onClick={() => setLightbox(prev)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 text-white/60 hover:text-white text-2xl transition-colors"
                    >
                      ‹
                    </button>
                  )}
                  {next && (
                    <button
                      onClick={() => setLightbox(next)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 text-white/60 hover:text-white text-2xl transition-colors"
                    >
                      ›
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
