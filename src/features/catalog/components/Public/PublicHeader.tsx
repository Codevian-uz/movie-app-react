import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

export function PublicHeader() {
  const { isAuthenticated } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all duration-500 md:px-12',
        isScrolled && 'bg-black/90 shadow-md',
      )}
    >
      <div className="flex items-center space-x-2 md:space-x-10">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-red-600 md:text-3xl">
          ANIME
        </Link>
        <nav className="hidden space-x-4 md:flex">
          <Link
            to="/"
            className="text-sm font-light text-white transition-colors hover:text-gray-300"
          >
            Home
          </Link>
          <Link
            to="/"
            className="text-sm font-light text-white transition-colors hover:text-gray-300"
          >
            Movies
          </Link>
          <Link
            to="/"
            className="text-sm font-light text-white transition-colors hover:text-gray-300"
          >
            New & Popular
          </Link>
          <Link
            to="/"
            className="text-sm font-light text-white transition-colors hover:text-gray-300"
          >
            My List
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4 text-sm font-light text-white">
        <Search className="hidden h-6 w-6 cursor-pointer sm:inline" />
        <p className="hidden cursor-pointer lg:inline">Kids</p>
        <Bell className="h-6 w-6 cursor-pointer" />
        <Link to={isAuthenticated ? '/admin' : '/login'}>
          <User className="h-6 w-6 cursor-pointer" />
        </Link>
      </div>
    </header>
  )
}
