'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-stone-200 px-8 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin">
            <Image src="/logo.png" alt="LovesKeepsake" width={120} height={60} className="h-10 w-auto" priority />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className={`text-sm transition-colors ${pathname === '/admin' ? 'text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-700'}`}
            >
              Weddings
            </Link>
            <Link
              href="/admin/analytics"
              className={`text-sm transition-colors ${pathname === '/admin/analytics' ? 'text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-700'}`}
            >
              Analytics
            </Link>
            <Link
              href="/admin/notebook"
              className={`text-sm transition-colors ${pathname === '/admin/notebook' ? 'text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-700'}`}
            >
              Notebook
            </Link>
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
