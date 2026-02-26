import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface RouteErrorBoundaryProps extends ErrorComponentProps {
  backTo: string
}

export function RouteErrorBoundary({ error, reset, backTo }: RouteErrorBoundaryProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-lg border p-6 text-center">
        <AlertTriangle className="text-destructive size-10" />
        <h1 className="text-xl font-semibold tracking-tight">
          {t('common.errors.unexpectedTitle')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('common.errors.unexpectedDescription')}</p>
        <p className="text-muted-foreground w-full font-mono text-xs break-words">
          {error instanceof Error ? error.message : t('common.errors.unknown')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              reset()
            }}
          >
            {t('common.actions.tryAgain')}
          </Button>
          <Button
            onClick={() => {
              window.location.href = backTo
            }}
          >
            {t('common.actions.back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
