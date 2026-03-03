import type { TitleDetailsResponse } from '@/features/catalog/types/catalog.types'

interface Props {
  credits: TitleDetailsResponse['credits']
}

export function MovieCast({ credits }: Props) {
  if (credits.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Cast & Crew</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {credits.map((credit) => (
          <div key={credit.id} className="group cursor-pointer space-y-3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors group-hover:border-white/20">
              {credit.person_photo_url !== null ? (
                <img
                  src={credit.person_photo_url}
                  alt={credit.person_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center border-t border-white/5 bg-gray-900 text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <div>
              <p className="line-clamp-1 text-sm font-semibold text-gray-100 transition-colors group-hover:text-white">
                {credit.person_name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-400">
                {credit.character_name ?? credit.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
