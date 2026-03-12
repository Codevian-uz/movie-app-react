import { Link } from '@tanstack/react-router'

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-zinc-900 bg-zinc-900/30 px-6 py-16 text-zinc-500 lg:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">Platform</h4>
            <Link to="/movies" className="text-sm transition-colors hover:text-orange-500">
              Browse
            </Link>
            <Link to="/movies" className="text-sm transition-colors hover:text-orange-500">
              Genres
            </Link>
            <Link
              to="/movies"
              search={{ sort: '-rating_average' }}
              className="text-sm transition-colors hover:text-orange-500"
            >
              Top Rated
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">Support</h4>
            <Link to="/support" className="text-sm transition-colors hover:text-orange-500">
              Help Center
            </Link>
            <Link to="/support" className="text-sm transition-colors hover:text-orange-500">
              Terms of Use
            </Link>
            <Link to="/support" className="text-sm transition-colors hover:text-orange-500">
              Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">Account</h4>
            <Link to="/login" className="text-sm transition-colors hover:text-orange-500">
              Login
            </Link>
            <Link to="/register" className="text-sm transition-colors hover:text-orange-500">
              Register
            </Link>
            <Link to="/profile" className="text-sm transition-colors hover:text-orange-500">
              My Profile
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-xl font-black tracking-tighter text-white italic">
                ANIME<span className="text-orange-500">WATCH</span>
              </div>
              <p className="max-w-200px text-xs leading-relaxed text-zinc-600">
                The ultimate destination for anime enthusiasts. Watch thousands of episodes for
                free.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-900 pt-8 md:flex-row">
          <div className="text-xs">
            © {new Date().getFullYear()} AnimeWatch. All rights reserved.
          </div>
          <div className="flex gap-6">{/* Social icons placeholder */}</div>
        </div>
      </div>
    </footer>
  )
}
