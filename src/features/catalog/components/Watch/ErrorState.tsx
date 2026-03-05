import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface ErrorStateProps {
  message?: string | undefined
  onRetry?: (() => void) | undefined
  onReport?: (() => void) | undefined
}

export function ErrorState({ message, onRetry, onReport }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-400px flex w-full flex-col items-center justify-center gap-6 rounded-xl bg-black/40 p-8 text-center backdrop-blur-md">
      <div className="bg-destructive/20 rounded-full p-4 text-red-500">
        <AlertCircle size={64} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">{t('catalog.watch.error')}</h2>
        <p className="text-muted-foreground max-w-md">
          {message ?? t('common.errors.unexpectedDescription')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="text-white hover:bg-white/10">
            {t('common.actions.tryAgain')}
          </Button>
        )}
        <Button onClick={onReport} variant="destructive">
          {t('catalog.watch.reportIssue')}
        </Button>
      </div>
    </div>
  )
}
