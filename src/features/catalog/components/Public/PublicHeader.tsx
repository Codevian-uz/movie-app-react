import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, Bell, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

export function PublicHeader() {
  const { isAuthenticated } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 transition-all duration-300 md:px-12',
        isScrolled
          ? 'bg-zinc-950/95 shadow-xl backdrop-blur-md'
          : 'bg-linear-to-b from-zinc-950/80 to-transparent',
      )}
    >
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <Link
            to="/"
            className="flex items-center gap-1 text-2xl font-black tracking-tighter text-white italic md:text-3xl"
          >
            ANIME<span className="text-orange-500">WATCH</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            to="/"
            className="text-sm font-bold text-zinc-300 transition-colors hover:text-orange-500"
          >
            Home
          </Link>
          <Link
            to="/"
            className="text-sm font-bold text-zinc-300 transition-colors hover:text-orange-500"
          >
            Movies
          </Link>
          <Link
            to="/"
            className="text-sm font-bold text-zinc-300 transition-colors hover:text-orange-500"
          >
            Series
          </Link>
          <Link
            to="/"
            className="text-sm font-bold text-zinc-300 transition-colors hover:text-orange-500"
          >
            Trending
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4 text-white md:gap-6">
        <div className="relative hidden items-center md:flex">
          <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search anime..."
            className="h-10 rounded-full bg-zinc-900 px-10 text-xs font-medium text-white transition-all focus:w-64 focus:ring-1 focus:ring-orange-500 focus:outline-hidden lg:w-48"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-orange-500">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            </span>
          </Button>

          <Link to={isAuthenticated ? '/admin' : '/login'}>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 transition-all hover:border-orange-500/50 hover:bg-zinc-800">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
