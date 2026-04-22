'use client'

import { useEffect, useState } from 'react'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface Props {
  slug: string
  coupleName: string
}

export function QRDownload({ slug, coupleName }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const url = `https://loveskeepsake.com/${slug}/cam`

  useEffect(() => {
    async function generate() {
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(url, {
        color: { dark: '#3d2e28', light: '#ffffff' },
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
      })
      setQrDataUrl(dataUrl)
    }
    generate()
  }, [url])

  function downloadPNG() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${slug}-guest-camera.png`
    a.click()
  }

  async function downloadPDF() {
    if (!qrDataUrl) return
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [105, 148] })

    // Background
    doc.setFillColor(250, 248, 245)
    doc.rect(0, 0, 105, 148, 'F')

    // QR code — centered, 72×72mm, top at 18mm
    doc.addImage(qrDataUrl, 'PNG', 16.5, 18, 72, 72)

    // Couple name
    doc.setFontSize(20)
    doc.setFont('times', 'normal')
    doc.setTextColor(61, 46, 40)
    doc.text(coupleName, 52.5, 104, { align: 'center' })

    // Tagline
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(138, 117, 104)
    doc.text('Snap a memory — 20 shots each', 52.5, 113, { align: 'center' })

    // URL
    doc.setFontSize(8)
    doc.setTextColor(184, 169, 154)
    doc.text(url, 52.5, 122, { align: 'center' })

    // Branding
    doc.setFontSize(7)
    doc.setTextColor(217, 207, 196)
    doc.text('LoveKeepsake', 52.5, 142, { align: 'center' })

    doc.save(`${slug}-guest-camera.pdf`)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h2 className="text-lg font-light text-stone-800 mb-1" style={{ fontFamily: CF }}>
        Guest QR Code
      </h2>
      <p className="text-xs text-stone-400 mb-6">
        Print or display this at your venue — guests scan to open the camera
      </p>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* QR preview */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 160,
            height: 160,
            background: '#faf8f5',
            border: '1px solid #ede7df',
          }}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Guest camera QR code" width={140} height={140} />
          ) : (
            <div className="w-32 h-32 rounded-lg animate-pulse" style={{ background: '#ede7df' }} />
          )}
        </div>

        {/* Info + actions */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-700">{coupleName}</p>
            <p className="text-xs text-stone-400 mt-0.5 break-all">{url}</p>
          </div>

          <ul className="text-xs text-stone-500 space-y-1">
            <li>✓ 20 shots per device</li>
            <li>✓ Photos upload instantly</li>
            <li>✓ No app download required</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadPNG}
              disabled={!qrDataUrl}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors disabled:opacity-40"
            >
              Download PNG
            </button>
            <button
              onClick={downloadPDF}
              disabled={!qrDataUrl}
              className="px-4 py-2 rounded-lg text-sm text-white transition-colors disabled:opacity-40 hover:opacity-90"
              style={{ background: '#c4956a' }}
            >
              Download PDF (A6 Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
