import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Check, Copy } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { errorQueryOptions } from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'
import { parseErrorsListSearch } from './-search'

export const Route = createFileRoute('/admin/_authenticated/platform/errors/$errorId')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.ALERT_VIEW)
  },
  validateSearch: parseErrorsListSearch,
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin/platform/errors" />,
  component: ErrorDetailPage,
})

function ErrorDetailPage() {
  const { t } = useTranslation()
  const { errorId } = Route.useParams()
  const search = Route.useSearch()
  const { data: error } = useSuspenseQuery(errorQueryOptions(errorId))
  const [copied, setCopied] = useState(false)

  function copyTraceId() {
    void navigator.clipboard.writeText(errorId)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/platform/errors" search={search}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            {t('platform.errorDetail.backToList')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{error.code}</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              {t('platform.errors.service')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{error.service}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              {t('platform.errors.operation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm font-medium">{error.operation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              {t('platform.errors.createdAt')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{new Date(error.created_at).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              {t('platform.errors.alerted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error.alerted ? (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" />
                {t('common.labels.yes')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Check className="size-3" />
                {t('common.labels.no')}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">{t('platform.errorDetail.traceId')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={copyTraceId}>
            <Copy className="mr-2 size-4" />
            {copied ? t('common.actions.copied') : t('common.actions.copy')}
          </Button>
        </CardHeader>
        <CardContent>
          <code className="bg-muted rounded px-2 py-1 text-sm">{errorId}</code>
        </CardContent>
      </Card>

      {Object.keys(error.details).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('platform.errorDetail.details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('platform.errorDetail.key')}</TableHead>
                    <TableHead>{t('platform.errorDetail.value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(error.details).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-xs font-medium">{key}</TableCell>
                      <TableCell className="text-sm">{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
