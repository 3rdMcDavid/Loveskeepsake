'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { SECTIONS } from './checklist/checklistData'

interface Props {
  slug: string
  hiddenSections: number[]
}

export function ManageNav({ slug, hiddenSections }: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const section = searchParams.get('section')

  const isSettings  = pathname === `/${slug}/manage/settings`
  const isCustomize = pathname === `/${slug}/manage/customize`
  const isCamera    = pathname === `/${slug}/manage/camera`

  const customRouteActive = SECTIONS.find(
    s => s.customRoute && pathname === `/${slug}/manage/${s.customRoute}`,
  )?.customRoute ?? null

  const isDashboard =
    section === null && !isSettings && !isCustomize && !isCamera && customRouteActive === null

  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
      active
        ? 'bg-stone-800 text-white'
        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
    }`

  return (
    <nav className="max-w-4xl mx-auto mt-3 flex gap-1 overflow-x-auto pb-0.5">
      <Link href={`/${slug}/manage`} className={linkCls(isDashboard)}>
        <span className="text-xs">📊</span>
        Dashboard
      </Link>

      <span className="flex-shrink-0 w-px bg-stone-200 mx-1 self-stretch" />

      <Link href={`/${slug}/manage/settings`} className={linkCls(isSettings)}>
        <span className="text-xs">⚙️</span>
        Details
      </Link>

      <Link href={`/${slug}/manage/customize`} className={linkCls(isCustomize)}>
        <span className="text-xs">🎨</span>
        Customize
      </Link>

      {SECTIONS.map((sec, i) => {
        if (sec.hidden) return null
        if (hiddenSections.includes(i)) return null

        if (sec.customRoute) {
          const href = `/${slug}/manage/${sec.customRoute}`
          return (
            <Link key={i} href={href} className={linkCls(customRouteActive === sec.customRoute)}>
              <span className="text-xs">{sec.icon}</span>
              {sec.tabLabel}
            </Link>
          )
        }

        return (
          <Link
            key={i}
            href={`/${slug}/manage?section=${i}`}
            className={linkCls(section === String(i))}
          >
            <span className="text-xs">{sec.icon}</span>
            {sec.tabLabel}
          </Link>
        )
      })}

      <span className="flex-shrink-0 w-px bg-stone-200 mx-1 self-stretch" />

      <Link href={`/${slug}/manage/camera`} className={linkCls(isCamera)}>
        <span className="text-xs">📷</span>
        Camera
      </Link>

      <Link href={`/${slug}/seating`} className={linkCls(false)}>
        <span className="text-xs">🪑</span>
        Seating
      </Link>
    </nav>
  )
}
