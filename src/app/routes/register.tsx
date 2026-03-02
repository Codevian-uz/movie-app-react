import { createFileRoute, Link } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/register')({
  component: UserRegisterPage,
})

function UserRegisterPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#141414] p-6 text-white">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-black/75 p-10 shadow-2xl">
        <div className="space-y-2 text-center">
          <Link to="/" className="text-3xl font-bold tracking-tighter text-red-600">
            ANIME
          </Link>
          <h1 className="text-2xl font-bold">{t('auth.register.title')}</h1>
          <p className="text-sm text-gray-400">{t('auth.register.description')}</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline">
            Log in now.
          </Link>
        </div>
      </div>
    </div>
  )
}
