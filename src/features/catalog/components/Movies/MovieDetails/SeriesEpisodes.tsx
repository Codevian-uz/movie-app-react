import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, Clock } from 'lucide-react'
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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Episodes</h2>
        {seasons.length > 1 && (
          <Select value={activeSeason} onValueChange={setActiveSeason}>
            <SelectTrigger className="w-40 cursor-pointer border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem
                  key={season.season_number}
                  value={season.season_number.toString()}
                  className="cursor-pointer"
                >
                  Season {season.season_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentSeasonData?.episodes.map((episode) => (
          <Link
            key={episode.id}
            to="/watch/$movieId"
            params={{ movieId }}
            search={{ episodeId: episode.id }}
            className="group relative flex cursor-pointer gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-black/50">
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-8 w-8 fill-current text-white" />
              </div>
              <div className="absolute right-1 bottom-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
                E{episode.episode_number}
              </div>
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-100 transition-colors group-hover:text-white">
                {episode.title}
              </h3>
              {episode.duration_minutes !== null && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{episode.duration_minutes}m</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
