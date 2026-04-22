'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SECTIONS } from './checklist/checklistData'

export function ManageNav({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')

  const isDashboard = section === null

  return (
    <nav className="max-w-4xl mx-auto mt-3 flex gap-1 overflow-x-auto pb-0.5">
      <Link
        href={`/${slug}/manage`}
        className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
          isDashboard
            ? 'bg-stone-800 text-white'
            : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
        }`}
      >
        <span className="text-xs">📊</span>
        Dashboard
      </Link>

      <span className="flex-shrink-0 w-px bg-stone-200 mx-1 self-stretch" />

      {SECTIONS.map((sec, i) => {
        const isActive = section === String(i)
        return (
          <Link
            key={i}
            href={`/${slug}/manage?section=${i}`}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'bg-stone-800 text-white'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <span className="text-xs">{sec.icon}</span>
            {sec.tabLabel}
          </Link>
        )
      })}

      <span className="flex-shrink-0 w-px bg-stone-200 mx-1 self-stretch" />

      <Link
        href={`/${slug}/seating`}
        className="px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100"
      >
        <span className="text-xs">🪑</span>
        Seating
      </Link>
    </nav>
  )
}
