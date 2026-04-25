import Image from 'next/image'
import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f0eb' }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="LovesKeepsake" width={220} height={110} className="w-48 h-auto mb-3" priority />
          <p className="text-sm italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Your memories, beautifully kept
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
