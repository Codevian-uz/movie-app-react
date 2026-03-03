import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { useRegister } from '../api/auth.queries'

interface RegisterFormValues {
  username: string
  password: string
}

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const traceIdRef = useRef('')
  const registerSchema = z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    traceIdRef.current = ''
    try {
      await registerMutation.mutateAsync(values)
      toast.success(t('auth.register.success'))
      await navigate({ to: '/login' })
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          form.setError('root', { message: t('common.errors.networkError') })
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'username' || field === 'password') {
              form.setError(field as keyof RegisterFormValues, { type: 'server' })
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
              <FormLabel className="text-white">{t('auth.register.username')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="username"
                  className="border-gray-700 bg-gray-800 text-white"
                />
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
              <FormLabel className="text-white">{t('auth.register.password')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={registerMutation.isPending}
        >
          {t('auth.register.submit')}
        </Button>
      </form>
    </Form>
  )
}
