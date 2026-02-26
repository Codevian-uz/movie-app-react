export interface Movie {
  id: string
  title: string
  slug: string
  description: string | null
  poster_url: string | null
  backdrop_url: string | null
  trailer_url: string | null
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
}

export interface Person {
  id: string
  full_name: string
  bio: string | null
  photo_url: string | null
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

export interface ListMoviesParams {
  search?: string
  genre_id?: string
  person_id?: string
  role?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: string
}

export interface ListMoviesResponse {
  items: Movie[]
  total: number
}
