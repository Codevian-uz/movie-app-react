import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mySessionsQueryOptions, useDeleteMySession } from '@/features/auth'
import { apiClient } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n'
import { formatRelativeTime, parseUserAgent } from '@/lib/utils'
import { ApiException } from '@/types/api.types'

export const Route = createFileRoute('/admin/_authenticated/profile')({
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('auth.profile.title')}
      </h1>

      <div className="grid gap-6">
        <ChangePasswordCard />
        <MySessionsCard />
      </div>
    </div>
  )
}

// --- Change Password Card ---

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

function ChangePasswordCard() {
  const { t } = useTranslation()
  const traceIdRef = useRef('')

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    traceIdRef.current = ''
    try {
      await apiClient.post('v1/auth/change-my-password', {
        current_password: values.current_password,
        new_password: values.new_password,
      })
      toast.success(t('auth.profile.passwordChanged'))
      form.reset()
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          toast.error(t('common.errors.networkError'))
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'current_password' || field === 'new_password') {
              form.setError(field, { type: 'server' })
            }
          }
        }
        traceIdRef.current = error.traceId
        form.setError('root', { message: error.message })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.profile.changePassword')}</CardTitle>
        <CardDescription>{t('auth.profile.changePasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e)
            }}
            className="max-w-md space-y-4"
          >
            {form.formState.errors.root?.message !== undefined && (
              <Alert variant="destructive">
                <AlertDescription>
                  {form.formState.errors.root.message}
                  {traceIdRef.current !== '' && (
                    <span className="mt-1 block font-mono text-xs opacity-60">
                      Trace: {traceIdRef.current}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.profile.currentPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.profile.newPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.profile.confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t('auth.profile.changePassword')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// --- My Sessions Card ---

function MySessionsCard() {
  const { t } = useTranslation()
  const { data: sessions } = useSuspenseQuery(mySessionsQueryOptions())
  const deleteSession = useDeleteMySession()
  const [revokeId, setRevokeId] = useState<number | null>(null)

  function onRevoke() {
    if (revokeId === null) {
      return
    }
    deleteSession.mutate(revokeId, {
      onSuccess: () => {
        toast.success(t('auth.sessions.revoked'))
        setRevokeId(null)
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.sessions.mySessions')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('auth.sessions.noSessions')}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auth.sessions.ipAddress')}</TableHead>
                  <TableHead>{t('auth.sessions.browser')}</TableHead>
                  <TableHead>{t('auth.sessions.lastUsed')}</TableHead>
                  <TableHead>{t('common.labels.createdAt')}</TableHead>
                  <TableHead>{t('auth.sessions.expires')}</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">{session.ip_address}</TableCell>
                    <TableCell>{parseUserAgent(session.user_agent)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(session.last_used_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(session.refresh_token_expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRevokeId(session.id)
                        }}
                      >
                        {t('auth.sessions.revoke')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog
          open={revokeId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setRevokeId(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('auth.sessions.revokeConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={onRevoke} disabled={deleteSession.isPending}>
                {t('auth.sessions.revoke')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
