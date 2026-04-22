import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9f1239 0%, #1c1917 100%)',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <span
            style={{
              color: '#fde8ef',
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '-2px',
              fontFamily: 'serif',
              lineHeight: 1,
            }}
          >
            LK
          </span>
          <span
            style={{
              color: '#fda4af',
              fontSize: 18,
              fontFamily: 'serif',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            weddings
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
