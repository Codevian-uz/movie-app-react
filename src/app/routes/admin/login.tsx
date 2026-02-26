import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router requires throwing redirect()
      throw redirect({ to: '/admin' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="admin-ambient-bg flex min-h-svh items-center justify-center p-6" data-admin="">
      <Card className="glass-panel w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
