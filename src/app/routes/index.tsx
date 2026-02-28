import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { moviesQueryOptions } from '@/features/catalog'
import { MovieHero } from '@/features/catalog/components/Public/MovieHero'
import { MovieRow } from '@/features/catalog/components/Public/MovieRow'
import { PublicHeader } from '@/features/catalog/components/Public/PublicHeader'
import type { Movie } from '@/features/catalog/types/catalog.types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// Mock anime data for featured/empty states
const MOCK_ANIMES: Movie[] = [
  {
    id: '1',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    slug: 'demon-slayer',
    description: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Though devastated by this grim reality, Tanjiro resolves to become a “demon slayer” so that he can turn his sister back into a human, and kill the demon that massacred his family.',
    backdrop_url: 'https://images.alphacoders.com/102/thumb-1920-1025557.jpg',
    poster_url: 'https://image.tmdb.org/t/p/original/h8Rb9gBr48ODIwYv9Z8P2vEU6JF.jpg',
    trailer_url: '',
    video_url: '',
    release_date: '2019-04-06',
    duration_minutes: 24,
    rating_average: 8.7,
    vote_count: 1000,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    title: 'Your Name',
    slug: 'your-name',
    description: 'High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places. Mitsuha wakes up in Taki’s body, and he in hers. This bizarre occurrence continues to happen randomly, and the two must adjust their lives around each other.',
    backdrop_url: 'https://images.alphacoders.com/740/thumb-1920-740708.png',
    poster_url: 'https://image.tmdb.org/t/p/original/q719jsmZcyq07O36mY3OLuHGmsn.jpg',
    trailer_url: '',
    video_url: '',
    release_date: '2016-08-26',
    duration_minutes: 106,
    rating_average: 8.9,
    vote_count: 2000,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    title: 'Jujutsu Kaisen',
    slug: 'jujutsu-kaisen',
    description: 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful of sorcerers, Satoru Gojo, Itadori is admitted to Tokyo Jujutsu High School, an organization that fights the curses... and thus begins the heroic tale of a boy who became a curse to exorcise a curse, a life from which he could never turn back.',
    backdrop_url: 'https://images.alphacoders.com/112/thumb-1920-1128362.jpg',
    poster_url: 'https://image.tmdb.org/t/p/original/gS99fXpAti0A7i7699Wj5vU699m.jpg',
    trailer_url: '',
    video_url: '',
    release_date: '2020-10-03',
    duration_minutes: 24,
    rating_average: 8.8,
    vote_count: 1500,
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    title: 'Attack on Titan',
    slug: 'attack-on-titan',
    description: 'Several hundred years ago, humans were nearly exterminated by titans. Titans are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source. A small percentage of humanity survived by walling themselves in a city protected by extremely high walls, even taller than the biggest of titans.',
    backdrop_url: 'https://images.alphacoders.com/832/thumb-1920-832101.jpg',
    poster_url: 'https://image.tmdb.org/t/p/original/ai40goD6B9vXVkSG9Xp16Oo4S7S.jpg',
    trailer_url: '',
    video_url: '',
    release_date: '2013-04-07',
    duration_minutes: 24,
    rating_average: 9.1,
    vote_count: 3000,
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    title: 'Naruto Shippuden',
    slug: 'naruto-shippuden',
    description: 'Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage, who is acknowledged as the leader and strongest of all ninja in the village.',
    backdrop_url: 'https://images.alphacoders.com/131/thumb-1920-1311543.png',
    poster_url: 'https://image.tmdb.org/t/p/original/kV8YlY4nK3MAsO31SgG2O8E6QoM.jpg',
    trailer_url: '',
    video_url: '',
    release_date: '2007-02-15',
    duration_minutes: 24,
    rating_average: 8.6,
    vote_count: 2500,
    created_at: '',
    updated_at: '',
  }
]

function HomePage() {
  const { data: moviesResponse } = useSuspenseQuery(moviesQueryOptions({ limit: 20 }))
  
  const movies = moviesResponse.items.length > 0 ? moviesResponse.items : MOCK_ANIMES
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const featuredMovie = movies[featuredIndex]

  // Auto-cycle featured anime every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
    }, 10000)
    return () => clearInterval(interval)
  }, [movies.length])
  
  // Group movies by category for demonstration
  const trending = movies.slice(0, 5)
  const popular = movies.slice(2, 7)
  const action = movies.filter(m => m.title.toLowerCase().includes('slayer') || m.title.toLowerCase().includes('titan') || m.title.toLowerCase().includes('jujutsu'))
  const romance = movies.filter(m => m.title.toLowerCase().includes('your name'))

  return (
    <div className="relative min-h-svh bg-[#141414] text-white overflow-x-hidden">
      <PublicHeader />
      
      <main className="relative pb-24">
        {featuredMovie && <MovieHero movie={featuredMovie} />}
        
        <div className="relative z-20 -mt-32 space-y-8 md:space-y-16">
          <MovieRow title="Trending Now" movies={trending} />
          <MovieRow title="Popular on AnimeApp" movies={popular} />
          {action.length > 0 && <MovieRow title="Action Anime" movies={action} />}
          {romance.length > 0 && <MovieRow title="Romance & Drama" movies={romance} />}
          <MovieRow title="Watch Again" movies={movies.reverse()} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-10 px-6 py-10 text-gray-500 lg:px-12 border-t border-white/10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:max-w-4xl">
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer hover:underline">Audio Description</span>
            <span className="cursor-pointer hover:underline">Help Center</span>
            <span className="cursor-pointer hover:underline">Gift Cards</span>
            <span className="cursor-pointer hover:underline">Media Center</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer hover:underline">Investor Relations</span>
            <span className="cursor-pointer hover:underline">Jobs</span>
            <span className="cursor-pointer hover:underline">Terms of Use</span>
            <span className="cursor-pointer hover:underline">Privacy</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer hover:underline">Legal Notices</span>
            <span className="cursor-pointer hover:underline">Cookie Preferences</span>
            <span className="cursor-pointer hover:underline">Corporate Information</span>
            <span className="cursor-pointer hover:underline">Contact Us</span>
          </div>
        </div>
        <div className="mt-8 text-xs">
          © 1997-2026 AnimeApp, Inc.
        </div>
      </footer>
    </div>
  )
}
