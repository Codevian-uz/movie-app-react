import { apiClient } from '@/lib/api-client'
import type {
  CreateMovieRequest,
  Genre,
  ListMoviesParams,
  ListMoviesResponse,
  Movie,
  MovieWithDetails,
} from '../types/catalog.types'

export async function listMovies(params?: ListMoviesParams): Promise<ListMoviesResponse> {
  const response = await apiClient.get<ListMoviesResponse>('v1/catalog/movies', { params })
  return response.data
}

export async function getMovie(id: string): Promise<MovieWithDetails> {
  const response = await apiClient.get<MovieWithDetails>(`v1/catalog/movies/${id}`)
  return response.data
}

export async function listGenres(): Promise<Genre[]> {
  const response = await apiClient.get<{ content: Genre[] }>('v1/catalog/genres')
  return response.data.content
}

export async function createMovie(data: CreateMovieRequest): Promise<Movie> {
  const response = await apiClient.post<Movie>('v1/catalog/movies', data)
  return response.data
}
