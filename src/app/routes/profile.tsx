import { createFileRoute, Link } from '@tanstack/react-router'
import { User, Shield, Key, Mail, LogOut } from 'lucide-react'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/features/catalog'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { username, clearAuth, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <div className="flex h-svh w-full flex-col items-center justify-center bg-zinc-950 text-white">
        <PublicHeader />
        <h1 className="mb-4 text-3xl font-bold">You are not logged in</h1>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link to="/login">Login Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <main className="container mx-auto px-6 pt-32 pb-20 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-orange-500 bg-zinc-900 shadow-2xl">
              <User className="h-16 w-16 text-orange-500" />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {username}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-500 md:justify-start">
                <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-orange-400">
                  <Shield className="h-3 w-3" />
                  User
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                clearAuth()
              }}
              className="border-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Account Details */}
            <section className="rounded-3xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-xl font-bold text-white">Account Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-zinc-800 p-3">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      Username
                    </label>
                    <p className="text-lg font-medium text-white">{username}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-zinc-800 p-3">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      Email
                    </label>
                    <p className="text-lg font-medium text-white">{username}@example.com</p>
                    <span className="mt-1 inline-block rounded bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500 uppercase">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="rounded-3xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-xl font-bold text-white">Security</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-zinc-800 p-3">
                    <Key className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      Password
                    </label>
                    <p className="text-lg font-medium text-white">••••••••••••</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-orange-500 hover:text-orange-400"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-zinc-800 p-3">
                    <Shield className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      Two-Factor Authentication
                    </label>
                    <p className="text-zinc-500">Not enabled</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-orange-500 hover:text-orange-400"
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
