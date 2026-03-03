export type MovieKind = 'movie' | 'series'

export interface Movie {
  id: string
  collection_id: string | null
  collection_order: number | null
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
  created_at: string
  updated_at: string
  deleted_at: string | null
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

export interface MovieWithDetails extends Movie {
  genres: Genre[]
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
  limit?: number | undefined
  offset?: number | undefined
  sort_by?: string | undefined
  sort_order?: string | undefined
}

export interface Episode {
  id: string
  movie_id: string
  season_number: number
  episode_number: number
  title: string
  video_url: string | null
  duration_minutes: number | null
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

export interface UpdateProgressRequest {
  movie_id: string
  episode_id?: string | undefined
  progress_seconds: number
  is_finished?: boolean | undefined
}

export interface UserProgress {
  movie: Movie
  episode_id?: string | undefined
  progress_seconds: number
}

export interface ListContinueWatchingResponse {
  content: UserProgress[]
}

export interface ToggleFavoriteRequest {
  movie_id: string
}

export interface GetRelatedAnimesParams {
  movie_id: string
}

export interface ListRelatedAnimesResponse {
  content: Movie[]
}

export interface ListMyListResponse {
  page_number: number
  page_size: number
  count: number
  content: Movie[]
}

export interface ListMoviesResponse {
  items: Movie[]
  total?: number
}

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
  limit?: number | undefined
  offset?: number | undefined
  sort?: string | undefined
}

export interface HomeData {
  continue_watching: {
    movie: {
      id: string
      title: string
      slug: string
      poster_url: string | null
      duration_minutes: number | null
    }
    progress_seconds: number
  }[]
  trending: Movie[]
  popular: Movie[]
  new_releases: Movie[]
  my_list: Movie[]
  genres: Genre[]
}

export interface ListCollectionsResponse {
  items: Collection[]
  total: number
}
