'use client'

import { useState } from 'react'

interface Photo {
  id: string
  url: string
  deviceId: string
  uploadedAt: string
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)

  if (photos.length === 0) {
    return (
      <p className="text-sm text-stone-400 py-2">No guest photos yet.</p>
    )
  }

  const devices = Array.from(new Set(photos.map(p => p.deviceId)))

  return (
    <>
      <p className="text-xs text-stone-400 mb-3">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} from {devices.length} device{devices.length !== 1 ? 's' : ''}
      </p>

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

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-stone-300">
                Device {lightbox.deviceId.slice(0, 8)}… ·{' '}
                {new Date(lightbox.uploadedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
              <button
                onClick={() => setLightbox(null)}
                className="text-stone-300 hover:text-white text-sm transition-colors"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
