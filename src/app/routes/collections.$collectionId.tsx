import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { collectionQueryOptions } from '@/features/catalog'
import { MovieCard } from '@/features/catalog/components/Public/MovieCard'
import { PublicHeader } from '@/features/catalog/components/Public/PublicHeader'
import type { Movie } from '@/features/catalog/types/catalog.types'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionDetailPage,
})

function CollectionDetailPage() {
  const { collectionId } = Route.useParams()
  const { data: collection } = useSuspenseQuery(collectionQueryOptions(collectionId))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">{collection.title}</h1>
          {collection.description !== null && (
            <p className="text-muted-foreground max-w-3xl text-lg">{collection.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {collection.movies.map((movie) => (
            <div key={movie.id} className="space-y-2">
              <MovieCard
                movie={
                  {
                    ...movie,
                    // Map short movie info to full Movie type for Card compatibility
                    // Card only needs these fields
                    id: movie.id,
                    title: movie.title,
                    slug: movie.slug,
                    poster_url: movie.poster_url,
                    kind: movie.kind,
                    rating_average: 0, // Not provided in short info
                    release_date: null,
                  } as unknown as Movie
                }
              />
              <div className="px-1">
                <span className="text-xs font-medium tracking-wider text-red-600 uppercase">
                  Part {movie.collection_order.toString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
