import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
      {/* Background image with 30% opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url(/placeholder.webp)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  )
}
