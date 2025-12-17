import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6 relative">
      {/* Background image with 20% opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src="/placeholder.webp"
          alt=""
          className="w-full h-full object-cover opacity-20 pointer-events-none select-none"
          draggable="false"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
