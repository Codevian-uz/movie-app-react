import { apiClient } from '@/lib/api-client'
import type {
  Collection,
  CollectionWithMovies,
  CreateCollectionRequest,
  CreateGenreRequest,
  CreateMovieRequest,
  CreatePersonRequest,
  CreateStudioRequest,
  Episode,
  Genre,
  GetRelatedAnimesParams,
  HomeData,
  ListCollectionsParams,
  ListCollectionsResponse,
  ListEpisodesParams,
  ListEpisodesResponse,
  ListGenresParams,
  ListGenresResponse,
  ListMoviesParams,
  ListMoviesResponse,
  ListPeopleParams,
  ListPeopleResponse,
  ListSeasonsParams,
  ListSeasonsResponse,
  ListStudiosParams,
  ListStudiosResponse,
  Movie,
  MovieWithDetails,
  Person,
  Season,
  Studio,
  TitleDetailsResponse,
  UpdateCollectionRequest,
  UpdateGenreRequest,
  UpdateMovieRequest,
  UpdatePersonRequest,
  UpdateStudioRequest,
  UpsertEpisodeRequest,
  UpsertSeasonRequest,
  StreamManifest,
} from '../types/catalog.types'

// Home
export async function getHomeData(): Promise<HomeData> {
  const response = await apiClient.get<HomeData>('v1/catalog/get-home-data')
  return response.data
}

// Movies
export async function listMovies(params?: ListMoviesParams): Promise<ListMoviesResponse> {
  const response = await apiClient.get<ListMoviesResponse>('v1/catalog/movies', { params })
  return response.data
}

export async function getMovie(id: string): Promise<MovieWithDetails> {
  const response = await apiClient.get<MovieWithDetails>('v1/catalog/movies/get', {
    params: { id },
  })
  return response.data
}

export async function getTitleDetails(
  id: string,
  episodeId?: string,
): Promise<TitleDetailsResponse> {
  const params: Record<string, string> = { id }
  if (episodeId !== undefined) {
    params.episode_id = episodeId
  }
  const response = await apiClient.get<TitleDetailsResponse>('v1/catalog/get-title-details', {
    params,
  })
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

// Seasons
export async function listSeasons(params: ListSeasonsParams): Promise<Season[]> {
  const response = await apiClient.get<ListSeasonsResponse>('v1/catalog/list-seasons', {
    params,
  })
  return response.data.content
}

export async function upsertSeason(data: UpsertSeasonRequest): Promise<Season> {
  const response = await apiClient.post<Season>('v1/catalog/upsert-season', data)
  return response.data
}

export async function deleteSeason(id: string): Promise<void> {
  await apiClient.post('v1/catalog/delete-season', { id })
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

export async function getStreamManifest(params: {
  movie_id?: string | undefined
  episode_id?: string | undefined
}): Promise<StreamManifest> {
  const response = await apiClient.get<StreamManifest>('v1/catalog/get-stream-manifest', {
    params,
  })
  return response.data
}

// Studios
export async function listStudios(params?: ListStudiosParams): Promise<ListStudiosResponse> {
  const response = await apiClient.get<ListStudiosResponse>('v1/catalog/studios', { params })
  return response.data
}

export async function getStudio(id: string): Promise<Studio> {
  const response = await apiClient.get<Studio>('v1/catalog/studios/get', { params: { id } })
  return response.data
}

export async function createStudio(data: CreateStudioRequest): Promise<Studio> {
  const response = await apiClient.post<Studio>('v1/catalog/studios', data)
  return response.data
}

export async function updateStudio(data: UpdateStudioRequest): Promise<Studio> {
  const response = await apiClient.post<Studio>('v1/catalog/studios/update', data)
  return response.data
}

export async function deleteStudio(id: string): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('v1/catalog/studios/delete', { id })
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
