'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/admin', label: 'Weddings', exact: true },
  { href: '/admin/analytics', label: 'Analytics', exact: false },
  { href: '/admin/notebook', label: 'Notebook', exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-stone-200">
      {/* Main row: logo + desktop nav + sign out */}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/admin">
            <Image src="/logo.png" alt="LovesKeepsake" width={120} height={60} className="h-8 sm:h-10 w-auto" priority />
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${isActive(href, exact) ? 'text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-700'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Mobile nav row */}
      <nav className="sm:hidden flex items-center gap-5 px-4 pb-3 border-t border-stone-100">
        {NAV_LINKS.map(({ href, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm transition-colors ${isActive(href, exact) ? 'text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-700'}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
