'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2 text-sm tracking-widest uppercase text-white transition-colors print:hidden"
      style={{ background: '#3d2e28' }}
    >
      Print / Save as PDF
    </button>
  )
}
