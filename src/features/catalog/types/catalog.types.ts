import type { PaginatedResponse } from '@/types/api.types'

export type MovieKind = 'movie' | 'series'
export type ProcessingStatus = 'ready' | 'processing' | 'failed'

export interface VideoStream {
  status: ProcessingStatus
  url?: string
  progress?: number
  message?: string
}

export interface VideoSourceItem {
  id: string
  resolution: string
  url: string
  type: string
  language: string
  processing_status: ProcessingStatus
}

export interface StreamManifest {
  primary_source_id: string | null
  sources: VideoSourceItem[] | null
}

export interface Movie {
  id: string
  collection_id?: string | null
  collection_order?: number | null
  studio_id?: string | null
  title: string
  slug: string
  kind: string
  description?: string | null
  poster_url?: string | null
  backdrop_url?: string | null
  trailer_url?: string | null
  video_url?: string | null
  release_date?: string | null
  duration_minutes?: number | null
  rating_average?: number
  vote_count?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AlternativeTitle {
  movie_id: string
  title: string
  type: 'romaji' | 'kanji' | 'english' | 'synonym'
}

export interface Studio {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Genre {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  full_name: string
  bio: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface Credit {
  id: string
  person_id: string
  person_name: string
  role: string
  character_name: string | null
  display_order: number
  photo_url: string | null
}

export interface TitleDetailsResponse {
  movie: {
    id: string
    title: string
    slug: string
    kind: MovieKind
    description: string | null
    poster_url: string | null
    backdrop_url: string | null
    trailer_url: string | null
    video_url: string | null
    release_date: string | null
    duration_minutes: number | null
    rating_average: number
    vote_count: number
    studio: string | null
    status: string | null
  }
  genres: Genre[]
  credits: {
    id: string
    person_id: string
    person_name: string
    person_photo_url: string | null
    role: string
    character_name: string | null
  }[]
  seasons:
    | {
        season_number: number
        episodes: {
          id: string
          episode_number: number
          title: string
          video_url: string | null
          duration_minutes: number | null
        }[]
      }[]
    | null
  recommendations: {
    id: string
    title: string
    slug: string
    poster_url: string | null
    rating_average: number
  }[]
}

export interface MovieWithDetails extends Movie {
  genres: Genre[]
  studios: Studio[]
  credits: Credit[]
  collection: {
    id: string
    title: string
    slug: string
  } | null
  related_movies: {
    id: string
    title: string
    slug: string
    kind: MovieKind
    collection_order: number
    poster_url: string | null
  }[]
}

export interface CreateMovieRequest {
  title: string
  kind: MovieKind
  collection_id?: string | undefined
  collection_order?: number | undefined
  studio_id?: string | undefined
  description?: string | undefined
  poster_url?: string | undefined
  backdrop_url?: string | undefined
  trailer_url?: string | undefined
  video_url?: string | undefined
  release_date?: string | undefined
  duration_minutes?: number | undefined
  genre_ids?: string[] | undefined
  credits?:
    | {
        person_id: string
        role: string
        character_name?: string | undefined
        display_order?: number | undefined
      }[]
    | undefined
}

export interface UpdateMovieRequest extends Partial<CreateMovieRequest> {
  id: string
}

export interface ListMoviesParams {
  search?: string | undefined
  genre_id?: string | undefined
  person_id?: string | undefined
  role?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface Episode {
  id: string
  season_id: string
  episode_number: number
  title: string
  description?: string | null
  video_url: string | null
  duration_minutes: number | null
}

export interface Season {
  id: string
  movie_id: string
  season_number: number
  title: string | null
  description: string | null
  poster_url: string | null
  air_date: string | null
  created_at: string
  updated_at: string
}

export interface ListSeasonsParams {
  movie_id: string
}

export interface ListSeasonsResponse {
  content: Season[]
}

export interface UpsertSeasonRequest {
  id?: string | undefined
  movie_id: string
  season_number: number
  title?: string | undefined
  description?: string | undefined
  poster_url?: string | undefined
  air_date?: string | undefined
}

export interface DeleteSeasonRequest {
  id: string
}

export interface ListEpisodesParams {
  movie_id: string
  season_number?: number | undefined
}

export interface ListEpisodesResponse {
  content: Episode[]
}

export interface UpsertEpisodeRequest {
  id?: string | undefined
  movie_id: string
  season_number: number
  episode_number: number
  title: string
  video_url?: string | undefined
  duration_minutes?: number | undefined
}

export interface DeleteEpisodeRequest {
  id: string
}

export interface GetRelatedAnimesParams {
  movie_id: string
}

export interface ListRelatedAnimesResponse {
  content: Movie[]
}

export type ListMoviesResponse = PaginatedResponse<Movie>

export interface CreateStudioRequest {
  name: string
  description?: string | undefined
  logo_url?: string | undefined
}

export interface UpdateStudioRequest extends Partial<CreateStudioRequest> {
  id: string
}

export interface ListStudiosParams {
  search?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export type ListStudiosResponse = PaginatedResponse<Studio>

export interface CreateGenreRequest {
  name: string
}

export interface UpdateGenreRequest {
  id: string
  name?: string | undefined
}

export interface ListGenresParams {
  search?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface ListGenresResponse {
  page_number: number
  page_size: number
  count: number
  content: Genre[]
}

export interface CreatePersonRequest {
  full_name: string
  bio?: string | undefined
  photo_url?: string | undefined
}

export interface UpdatePersonRequest {
  id: string
  full_name?: string | undefined
  bio?: string | undefined
  photo_url?: string | undefined
}

export interface ListPeopleParams {
  search?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface ListPeopleResponse {
  page_number: number
  page_size: number
  count: number
  content: Person[]
}

// Collections
export interface Collection {
  id: string
  title: string
  slug: string
  description: string | null
  poster_url: string | null
  backdrop_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CollectionWithMovies extends Collection {
  movies: {
    id: string
    title: string
    slug: string
    kind: MovieKind
    collection_order: number
    poster_url: string | null
  }[]
}

export interface CreateCollectionRequest {
  title: string
  description?: string | undefined
  poster_url?: string | undefined
  backdrop_url?: string | undefined
}

export interface UpdateCollectionRequest {
  id: string
  title?: string | undefined
  description?: string | undefined
  poster_url?: string | undefined
  backdrop_url?: string | undefined
}

export interface ListCollectionsParams {
  search?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface HomeData {
  continue_watching:
    | {
        movie: {
          id: string
          title: string
          slug: string
          kind: string
          description: string | null
          poster_url: string | null
          backdrop_url: string | null
          duration_minutes: number | null
        }
        progress_seconds: number
      }[]
    | null
  trending:
    | {
        id: string
        title: string
        slug: string
        kind: string
        poster_url: string | null
        description: string | null
        backdrop_url: string | null
        duration_minutes: number | null
        rating_average: number
      }[]
    | null
  popular:
    | {
        id: string
        title: string
        slug: string
        kind: string
        description: string | null
        poster_url: string | null
        backdrop_url: string | null
        duration_minutes: number | null
        vote_count: number
      }[]
    | null
  new_releases:
    | {
        id: string
        title: string
        slug: string
        kind: string
        description: string | null
        poster_url: string | null
        backdrop_url: string | null
        duration_minutes: number | null
        release_date: string | null
      }[]
    | null
  my_list:
    | {
        id: string
        title: string
        slug: string
        kind: string
        description: string | null
        poster_url: string | null
        backdrop_url: string | null
        duration_minutes: number | null
      }[]
    | null
  genres: Genre[] | null
}

export type ListCollectionsResponse = PaginatedResponse<Collection>
