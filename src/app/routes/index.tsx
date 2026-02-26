import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})

function WelcomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('common.labels.appName')}</h1>
        <p className="text-muted-foreground text-sm">{t('welcome.description')}</p>
        <Button asChild>
          <Link to="/admin">
            {t('welcome.goToAdmin')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-muted-foreground text-xs">{t('welcome.placeholder')}</p>
      </div>
    </div>
  )
}
