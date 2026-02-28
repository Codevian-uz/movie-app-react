import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'
import { AuthBootstrapError, useAdminLogin, useUserLogin } from '../api/auth.queries'

interface LoginFormValues {
  username: string
  password: string
}

interface LoginFormProps {
  isAdmin?: boolean
}

export function LoginForm({ isAdmin = false }: LoginFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const adminLoginMutation = useAdminLogin()
  const userLoginMutation = useUserLogin()

  const loginMutation = isAdmin ? adminLoginMutation : userLoginMutation

  const traceIdRef = useRef('')
  const loginSchema = z.object({
    username: z.string().min(1, t('auth.login.validation.usernameRequired')),
    password: z.string().min(1, t('auth.login.validation.passwordRequired')),
  })

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    traceIdRef.current = ''
    try {
      await loginMutation.mutateAsync(values)
      if (isAdmin) {
        await navigate({ to: '/admin' })
      } else {
        await navigate({ to: '/' })
      }
    } catch (error) {
      if (error instanceof AuthBootstrapError) {
        form.setError('root', { message: t('auth.login.bootstrapError') })
        return
      }
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          form.setError('root', { message: t('common.errors.networkError') })
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'username' || field === 'password') {
              form.setError(field, { type: 'server' })
            }
          }
        }
        traceIdRef.current = error.traceId
        form.setError('root', { message: error.message })
      } else {
        form.setError('root', { message: t('common.errors.networkError') })
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-4"
      >
        {form.formState.errors.root?.message !== undefined &&
          form.formState.errors.root.message !== '' && (
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.login.username')}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.login.password')}</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {t('auth.login.submit')}
        </Button>
      </form>
    </Form>
  )
}
