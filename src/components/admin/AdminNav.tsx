'use client'

import Link from 'next/link'
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
        <Link href="/admin" className="font-serif text-xl text-stone-800">
          LovesKeepsake
        </Link>
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
