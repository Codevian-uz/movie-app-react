import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TitleDetailsResponse } from '@/features/catalog/types/catalog.types'

interface Props {
  seasons: TitleDetailsResponse['seasons']
  movieId: string
}

export function SeriesEpisodes({ seasons, movieId }: Props) {
  const [activeSeason, setActiveSeason] = useState(seasons?.[0]?.season_number.toString() ?? '1')

  if (!seasons || seasons.length === 0) {
    return null
  }

  const currentSeasonData = seasons.find((s) => s.season_number.toString() === activeSeason)

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Episodes</h2>
          <p className="text-sm text-zinc-400">
            {currentSeasonData?.episodes.length} Episodes available in Season {activeSeason}
          </p>
        </div>

        {seasons.length > 1 && (
          <Select value={activeSeason} onValueChange={setActiveSeason}>
            <SelectTrigger className="w-full cursor-pointer border-white/10 bg-zinc-900/50 text-white backdrop-blur-md transition-all hover:bg-zinc-800 sm:w-48">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-zinc-900 text-white backdrop-blur-xl">
              {seasons.map((season) => (
                <SelectItem
                  key={season.season_number}
                  value={season.season_number.toString()}
                  className="cursor-pointer focus:bg-orange-500 focus:text-white"
                >
                  Season {season.season_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {currentSeasonData?.episodes.map((episode) => (
          <Link
            key={episode.id}
            to="/watch/$movieId"
            params={{ movieId }}
            search={{ episodeId: episode.id }}
            className="group relative flex cursor-pointer gap-5 rounded-2xl border border-white/5 bg-zinc-900/40 p-3 transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-orange-500/5"
          >
            <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-950 shadow-lg">
              <img
                src={`https://img.youtube.com/vi/${episode.video_url?.split('v=')[1] ?? ''}/mqdefault.jpg`}
                alt={episode.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="scale-75 transform rounded-full bg-orange-500 p-2 text-white shadow-xl shadow-orange-500/40 transition-transform duration-300 group-hover:scale-100">
                  <Play className="h-6 w-6 fill-current" />
                </div>
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-bold text-zinc-100 backdrop-blur-sm">
                EP {episode.episode_number}
              </div>
              {episode.duration_minutes !== null && (
                <div className="absolute right-2 bottom-2 rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-bold text-zinc-100 backdrop-blur-sm">
                  {episode.duration_minutes}m
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
              <h3 className="line-clamp-2 text-base font-bold text-zinc-100 transition-colors group-hover:text-orange-500">
                {episode.title}
              </h3>
              <p className="line-clamp-2 text-sm text-zinc-500">
                Season {activeSeason} &bull; Episode {episode.episode_number}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
