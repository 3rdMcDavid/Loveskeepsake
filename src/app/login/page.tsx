import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-stone-800">LovesKeepsake</h1>
          <p className="text-stone-500 mt-1 text-sm">Photographer Admin</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
