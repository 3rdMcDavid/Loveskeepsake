import CoupleSignIn from './CoupleSignIn'

type Props = { params: Promise<{ slug: string }> }

export default async function CoupleSignInPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-stone-800">LovesKeepsake</h1>
          <p className="text-stone-500 mt-1 text-sm">Couple portal</p>
        </div>
        <CoupleSignIn slug={slug} />
      </div>
    </div>
  )
}
