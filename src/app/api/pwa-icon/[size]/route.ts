import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params
  const size = sizeParam === '512' ? 512 : 192
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.38)
  const subSize = Math.round(size * 0.1)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9f1239 0%, #1c1917 100%)',
          borderRadius: `${radius}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Math.round(size * 0.01),
          }}
        >
          <span
            style={{
              color: '#fde8ef',
              fontSize,
              fontWeight: 700,
              letterSpacing: `${-size * 0.01}px`,
              fontFamily: 'serif',
              lineHeight: 1,
            }}
          >
            LK
          </span>
          <span
            style={{
              color: '#fda4af',
              fontSize: subSize,
              fontFamily: 'serif',
              letterSpacing: `${size * 0.02}px`,
            }}
          >
            WEDDINGS
          </span>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
