import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/login')({
  component: UserLoginPage,
})

function UserLoginPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#141414] p-6 text-white">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-black/75 p-10 shadow-2xl">
        <div className="space-y-2 text-center">
          <Link to="/" className="text-3xl font-bold tracking-tighter text-red-600">
            ANIME
          </Link>
          <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
          <p className="text-sm text-gray-400">Welcome back! Please enter your details.</p>
        </div>
        <LoginForm isAdmin={false} />
        <div className="text-center text-sm text-gray-400">
          New to AnimeApp?{' '}
          <Link to="/" className="text-white hover:underline">
            Sign up now.
          </Link>
        </div>
      </div>
    </div>
  )
}
