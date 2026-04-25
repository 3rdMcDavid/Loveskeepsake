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
        <Link href="/admin">
          <Image src="/logo.png" alt="LovesKeepsake" width={120} height={60} className="h-10 w-auto" priority />
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
