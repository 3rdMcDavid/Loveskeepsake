import CoupleSignIn from './CoupleSignIn'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ hint?: string }>
}

const CF = "var(--font-cormorant), 'Georgia', serif"

export default async function CoupleSignInPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { hint } = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f0eb' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">LoveKeepsake</p>
          <h1 className="text-3xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Welcome Back
          </h1>
          <p className="text-sm italic mt-2" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Sign in to your wedding dashboard
          </p>
        </div>
        <CoupleSignIn slug={slug} hint={hint} />
      </div>
    </div>
  )
}
