import LoginForm from '@/components/admin/LoginForm'

const CF = "var(--font-cormorant), 'Georgia', serif"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f0eb' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">Welcome</p>
          <h1 className="text-3xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            LoveKeepsake
          </h1>
          <p className="text-sm italic mt-2" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Your memories, beautifully kept
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
