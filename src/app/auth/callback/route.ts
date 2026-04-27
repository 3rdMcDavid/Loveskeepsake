import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const slugMatch = next.match(/^\/([^/]+)\/welcome/)
  const failUrl = slugMatch
    ? `${origin}/${slugMatch[1]}/sign-in?hint=new-link`
    : `${origin}/login?error=auth`

  if (code || (token_hash && type)) {
    const successResponse = NextResponse.redirect(`${origin}${next}`)

    // Build a client that writes cookies directly onto the redirect response
    // (not via next/headers, which doesn't propagate to NextResponse.redirect on iOS Safari)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              successResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return successResponse
    } else if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash })
      if (!error) return successResponse
    }
  }

  return NextResponse.redirect(failUrl)
}
