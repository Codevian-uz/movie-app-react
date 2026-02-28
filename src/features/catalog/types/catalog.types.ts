export interface Movie {
  id: string
  title: string
  slug: string
  description: string | null
  poster_url: string | null
  backdrop_url: string | null
  trailer_url: string | null
  video_url: string | null // Added this
  release_date: string | null
  duration_minutes: number | null
  rating_average: number
  vote_count: number
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
}

export interface CreateMovieRequest {
  title: string
  description?: string | undefined
  poster_url?: string | undefined
  backdrop_url?: string | undefined
  trailer_url?: string | undefined
  video_url?: string | undefined // Added this
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

export interface ListMoviesResponse {
  items: Movie[]
  total: number
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
