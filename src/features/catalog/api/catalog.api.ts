import { apiClient } from '@/lib/api-client'
import type {
  Collection,
  CollectionWithMovies,
  CreateCollectionRequest,
  CreateGenreRequest,
  CreateMovieRequest,
  CreatePersonRequest,
  Episode,
  Genre,
  GetRelatedAnimesParams,
  ListCollectionsParams,
  ListCollectionsResponse,
  ListContinueWatchingResponse,
  ListEpisodesParams,
  ListEpisodesResponse,
  ListGenresParams,
  ListGenresResponse,
  ListMoviesParams,
  ListMoviesResponse,
  ListMyListResponse,
  ListPeopleParams,
  ListPeopleResponse,
  Movie,
  MovieWithDetails,
  Person,
  ToggleFavoriteRequest,
  UpdateCollectionRequest,
  UpdateGenreRequest,
  UpdateMovieRequest,
  UpdatePersonRequest,
  UpdateProgressRequest,
  UpsertEpisodeRequest,
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

export async function getRelatedAnimes(params: GetRelatedAnimesParams): Promise<Movie[]> {
  const response = await apiClient.get<{ content: Movie[] }>('v1/catalog/get-related-animes', {
    params,
  })
  return response.data.content
}

// Collections
export async function listCollections(
  params?: ListCollectionsParams,
): Promise<ListCollectionsResponse> {
  const response = await apiClient.get<ListCollectionsResponse>('v1/catalog/collections', {
    params,
  })
  return response.data
}

export async function getCollection(id: string): Promise<CollectionWithMovies> {
  const response = await apiClient.get<CollectionWithMovies>('v1/catalog/collections/get', {
    params: { id },
  })
  return response.data
}

export async function createCollection(data: CreateCollectionRequest): Promise<Collection> {
  const response = await apiClient.post<Collection>('v1/catalog/collections', data)
  return response.data
}

export async function updateCollection(data: UpdateCollectionRequest): Promise<Collection> {
  const response = await apiClient.post<Collection>('v1/catalog/collections/update', data)
  return response.data
}

export async function deleteCollection(id: string): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('v1/catalog/collections/delete', { id })
  return response.data
}

// User Progress
export async function updateProgress(data: UpdateProgressRequest): Promise<void> {
  await apiClient.post('v1/catalog/update-progress', data)
}

export async function listContinueWatching(): Promise<ListContinueWatchingResponse> {
  const response = await apiClient.get<ListContinueWatchingResponse>(
    'v1/catalog/list-continue-watching',
  )
  return response.data
}

// Favorites
export async function toggleFavorite(data: ToggleFavoriteRequest): Promise<void> {
  await apiClient.post('v1/catalog/toggle-favorite', data)
}

export async function listMyList(): Promise<ListMyListResponse> {
  const response = await apiClient.get<ListMyListResponse>('v1/catalog/list-my-list')
  return response.data
}

// Episodes
export async function listEpisodes(params: ListEpisodesParams): Promise<Episode[]> {
  const response = await apiClient.get<ListEpisodesResponse>('v1/catalog/list-episodes', {
    params,
  })
  return response.data.content
}

export async function upsertEpisode(data: UpsertEpisodeRequest): Promise<Episode> {
  const response = await apiClient.post<Episode>('v1/catalog/upsert-episode', data)
  return response.data
}

export async function deleteEpisode(id: string): Promise<void> {
  await apiClient.post('v1/catalog/delete-episode', { id })
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
