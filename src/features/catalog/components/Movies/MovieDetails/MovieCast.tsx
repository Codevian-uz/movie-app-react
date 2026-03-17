import { User } from 'lucide-react'
import type { TitleDetailsResponse } from '@/features/catalog/types/catalog.types'

interface Props {
  credits: TitleDetailsResponse['credits']
}

export function MovieCast({ credits }: Props) {
  if (credits.length === 0) {
    return null
  }

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Cast & Crew</h2>
        <p className="text-sm text-zinc-400">The talented people behind the scenes and on screen</p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {credits.map((credit) => (
          <div key={credit.id} className="group cursor-pointer space-y-4">
            <div className="relative aspect-2/3 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 shadow-lg transition-all duration-300 group-hover:border-orange-500/30 group-hover:shadow-2xl group-hover:shadow-orange-500/5">
              {credit.person_photo_url !== null ? (
                <img
                  src={credit.person_photo_url}
                  alt={credit.person_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-600">
                  <div className="text-center">
                    <User className="mx-auto mb-2 h-8 w-8 opacity-20" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      No Image
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase">
                  {credit.role}
                </p>
              </div>
            </div>
            <div className="space-y-1 px-1">
              <p className="line-clamp-1 text-sm font-bold text-zinc-100 transition-colors group-hover:text-orange-500">
                {credit.person_name}
              </p>
              <p className="line-clamp-1 text-xs font-medium text-zinc-500">
                {credit.character_name ?? credit.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
