import { apiClient } from '@/lib/api-client'
import type {
  CreateGenreRequest,
  CreateMovieRequest,
  CreatePersonRequest,
  Genre,
  ListGenresParams,
  ListGenresResponse,
  ListMoviesParams,
  ListMoviesResponse,
  ListPeopleParams,
  ListPeopleResponse,
  Movie,
  MovieWithDetails,
  Person,
  UpdateGenreRequest,
  UpdateMovieRequest,
  UpdatePersonRequest,
} from '../types/catalog.types'

// Movies
export async function listMovies(params?: ListMoviesParams): Promise<ListMoviesResponse> {
  const response = await apiClient.get<ListMoviesResponse>('v1/catalog/movies', { params })
  return response.data
}

export async function getMovie(id: string): Promise<MovieWithDetails> {
  const response = await apiClient.get<MovieWithDetails>(`v1/catalog/movies/${id}`)
  return response.data
}

export async function createMovie(data: CreateMovieRequest): Promise<Movie> {
  const response = await apiClient.post<Movie>('v1/catalog/movies', data)
  return response.data
}

export async function updateMovie(data: UpdateMovieRequest): Promise<Movie> {
  const response = await apiClient.post<Movie>('v1/catalog/movies/update', data)
  return response.data
}

export async function deleteMovie(id: string): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('v1/catalog/movies/delete', { id })
  return response.data
}

// Genres
export async function listGenres(params?: ListGenresParams): Promise<ListGenresResponse> {
  const response = await apiClient.get<ListGenresResponse>('v1/catalog/genres', { params })
  return response.data
}

export async function createGenre(data: CreateGenreRequest): Promise<Genre> {
  const response = await apiClient.post<Genre>('v1/catalog/genres', data)
  return response.data
}

export async function updateGenre(data: UpdateGenreRequest): Promise<Genre> {
  const response = await apiClient.post<Genre>('v1/catalog/genres/update', data)
  return response.data
}

export async function deleteGenre(id: string): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('v1/catalog/genres/delete', { id })
  return response.data
}

// People
export async function listPeople(params?: ListPeopleParams): Promise<ListPeopleResponse> {
  const response = await apiClient.get<ListPeopleResponse>('v1/catalog/people', { params })
  return response.data
}

export async function getPerson(id: string): Promise<Person> {
  const response = await apiClient.get<Person>('v1/catalog/people/get', { params: { id } })
  return response.data
}

export async function createPerson(data: CreatePersonRequest): Promise<Person> {
  const response = await apiClient.post<Person>('v1/catalog/people', data)
  return response.data
}

export async function updatePerson(data: UpdatePersonRequest): Promise<Person> {
  const response = await apiClient.post<Person>('v1/catalog/people/update', data)
  return response.data
}

export async function deletePerson(id: string): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('v1/catalog/people/delete', { id })
  return response.data
}
