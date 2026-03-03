import { useState, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, Lock, User, ArrowRight, Github } from 'lucide-react'
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
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from '@/types/api.types'
import { useUserLogin, useRegister } from '../api/auth.queries'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

interface AuthPageProps {
  initialMode?: 'login' | 'register'
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const traceIdRef = useRef('')

  const loginMutation = useUserLogin()
  const registerMutation = useRegister()

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  })

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    loginForm.reset()
    registerForm.reset()
    traceIdRef.current = ''
  }

  const shake = () => {
    setIsShaking(true)
    setTimeout(() => {
      setIsShaking(false)
    }, 500)
  }

  const handleLogin = async (values: LoginValues) => {
    traceIdRef.current = ''
    try {
      await loginMutation.mutateAsync(values)
      await navigate({ to: '/' })
    } catch (error) {
      shake()
      if (error instanceof ApiException) {
        traceIdRef.current = error.traceId
        loginForm.setError('root', { message: error.message })
      } else {
        loginForm.setError('root', { message: t('common.errors.networkError') })
      }
    }
  }

  const handleRegister = async (values: RegisterValues) => {
    traceIdRef.current = ''
    try {
      const data = await registerMutation.mutateAsync({
        username: values.username,
        password: values.password,
      })

      // register returns LoginResponse, so we update the store and redirect to home
      if (data) {
        useAuthStore.getState().setAuth(data)
        useAuthStore.getState().setUser(values.username, values.username)
        await navigate({ to: '/' })
      }
    } catch (error) {
      shake()
      if (error instanceof ApiException) {
        traceIdRef.current = error.traceId
        registerForm.setError('root', { message: error.message })
      } else {
        registerForm.setError('root', { message: t('common.errors.networkError') })
      }
    }
  }

  const variants = {
    initial: { opacity: 0, x: mode === 'login' ? -20 : 20, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: mode === 'login' ? 20 : -20, filter: 'blur(10px)' },
  }

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0b] px-4 py-12">
      {/* Anime Flair: Subtle Moving Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-[100px]"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1974&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isShaking ? 'shake' : { opacity: 1, y: 0 }}
        variants={shakeVariants}
        className="z-10 w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Accent Glow */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px]" />
          <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-purple-500/20 blur-[80px]" />

          <div className="relative space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20"
              >
                <Link to="/" className="text-2xl font-black text-white">
                  A
                </Link>
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Welcome Back' : 'Join the Squad'}
              </h1>
              <p className="text-sm text-slate-400">
                {mode === 'login'
                  ? 'The portal to your favorite stories awaits.'
                  : 'Start your journey with us today.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {mode === 'login' ? (
                  <Form {...loginForm}>
                    <form
                      onSubmit={(e) => {
                        void loginForm.handleSubmit(handleLogin)(e)
                      }}
                      className="space-y-4"
                    >
                      {loginForm.formState.errors.root && (
                        <Alert
                          variant="destructive"
                          className="border-red-500/50 bg-red-500/10 text-red-200"
                        >
                          <AlertDescription>
                            {loginForm.formState.errors.root.message}
                            {traceIdRef.current && (
                              <span className="mt-1 block font-mono text-[10px] opacity-70">
                                Trace: {traceIdRef.current}
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Username
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                                <Input
                                  {...field}
                                  placeholder="Enter your username"
                                  className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Password
                              </FormLabel>
                              <button
                                type="button"
                                className="text-xs text-cyan-400 hover:underline"
                              >
                                Forgot?
                              </button>
                            </div>
                            <FormControl>
                              <div className="group relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                                <Input
                                  {...field}
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  className="h-11 border-slate-700 bg-slate-800/50 pl-10 pr-10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowPassword(!showPassword)
                                  }}
                                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="group relative w-full overflow-hidden bg-cyan-600 py-6 font-bold text-white transition-all hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]"
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="flex items-center">
                            Continue{' '}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...registerForm}>
                    <form
                      onSubmit={(e) => {
                        void registerForm.handleSubmit(handleRegister)(e)
                      }}
                      className="space-y-4"
                    >
                      {registerForm.formState.errors.root && (
                        <Alert
                          variant="destructive"
                          className="border-red-500/50 bg-red-500/10 text-red-200"
                        >
                          <AlertDescription>
                            {registerForm.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Username
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                                <Input
                                  {...field}
                                  placeholder="Choose a username"
                                  className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Minimum 8 characters"
                                  className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Repeat your password"
                                  className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="group relative w-full overflow-hidden bg-purple-600 py-6 font-bold text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]"
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="flex items-center">
                            Create Account{' '}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1e293b] px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700"
              >
                <Github className="mr-2 h-4 w-4" /> Github
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-400">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button
                onClick={toggleMode}
                className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
              >
                {mode === 'login' ? 'Sign up now' : 'Log in here'}
              </button>
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-8 flex justify-center space-x-4 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-300">
            Terms of Service
          </a>
          <a href="#" className="hover:text-slate-300">
            Support
          </a>
        </div>
      </motion.div>
    </div>
  )
}
