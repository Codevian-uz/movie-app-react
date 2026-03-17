import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ListCollectionsParams,
  ListEpisodesParams,
  ListGenresParams,
  ListMoviesParams,
  ListPeopleParams,
  ListSeasonsParams,
  ListStudiosParams,
  StreamManifest,
} from '../types/catalog.types'
import {
  createCollection,
  createGenre,
  createMovie,
  createPerson,
  createStudio,
  deleteCollection,
  deleteEpisode,
  deleteGenre,
  deleteMovie,
  deletePerson,
  deleteSeason,
  deleteStudio,
  getCollection,
  getHomeData,
  getMovie,
  getStreamManifest,
  getStudio,
  getPerson,
  getRelatedAnimes,
  getTitleDetails,
  listCollections,
  listEpisodes,
  listGenres,
  listMovies,
  listPeople,
  listSeasons,
  listStudios,
  updateCollection,
  updateGenre,
  updateMovie,
  updatePerson,
  updateStudio,
  upsertEpisode,
  upsertSeason,
} from './catalog.api'

export const catalogKeys = {
  all: ['catalog'] as const,
  movies: (params?: ListMoviesParams) => [...catalogKeys.all, 'movies', params] as const,
  movie: (id: string) => [...catalogKeys.all, 'movie', id] as const,
  titleDetails: (id: string, episodeId?: string) =>
    [...catalogKeys.all, 'title-details', id, episodeId] as const,
  genres: (params?: ListGenresParams) => [...catalogKeys.all, 'genres', params] as const,
  genre: (id: string) => [...catalogKeys.all, 'genre', id] as const,
  people: (params?: ListPeopleParams) => [...catalogKeys.all, 'people', params] as const,
  person: (id: string) => [...catalogKeys.all, 'person', id] as const,
  studios: (params?: ListStudiosParams) => [...catalogKeys.all, 'studios', params] as const,
  studio: (id: string) => [...catalogKeys.all, 'studio', id] as const,
  seasons: (params: ListSeasonsParams) => [...catalogKeys.all, 'seasons', params] as const,
  collections: (params?: ListCollectionsParams) =>
    [...catalogKeys.all, 'collections', params] as const,
  collection: (id: string) => [...catalogKeys.all, 'collection', id] as const,
  episodes: (params: ListEpisodesParams) => [...catalogKeys.all, 'episodes', params] as const,
  streamManifest: (params: {
    movie_id?: string | undefined
    episode_id?: string | undefined
    is_trailer?: boolean | undefined
  }) => [...catalogKeys.all, 'stream-manifest', params] as const,
  relatedAnimes: (movieId: string) => [...catalogKeys.all, 'related', movieId] as const,
  homeData: () => [...catalogKeys.all, 'home-data'] as const,
}

// Home
export function homeDataQueryOptions() {
  return queryOptions({
    queryKey: catalogKeys.homeData(),
    queryFn: getHomeData,
  })
}

// Movies
export function moviesQueryOptions(params?: ListMoviesParams) {
  return queryOptions({
    queryKey: catalogKeys.movies(params),
    queryFn: () => listMovies(params),
  })
}

export function movieQueryOptions(id: string) {
  return queryOptions({
    queryKey: catalogKeys.movie(id),
    queryFn: () => getMovie(id),
  })
}

export function titleDetailsQueryOptions(id: string, episodeId?: string) {
  return queryOptions({
    queryKey: catalogKeys.titleDetails(id, episodeId),
    queryFn: () => getTitleDetails(id, episodeId),
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMovie,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.movies() })
    },
  })
}

export function useUpdateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMovie,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.movies() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.movie(variables.id) })
    },
  })
}

export function useDeleteMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMovie,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.movies() })
    },
  })
}

export function relatedAnimesQueryOptions(movieId: string) {
  return queryOptions({
    queryKey: catalogKeys.relatedAnimes(movieId),
    queryFn: () => getRelatedAnimes({ movie_id: movieId }),
  })
}

// Collections
export function collectionsQueryOptions(params?: ListCollectionsParams) {
  return queryOptions({
    queryKey: catalogKeys.collections(params),
    queryFn: () => listCollections(params),
  })
}

export function collectionQueryOptions(id: string) {
  return queryOptions({
    queryKey: catalogKeys.collection(id),
    queryFn: () => getCollection(id),
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.collections() })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCollection,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.collections() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.collection(variables.id) })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.collections() })
    },
  })
}

// Seasons
export function seasonsQueryOptions(params: ListSeasonsParams) {
  return queryOptions({
    queryKey: catalogKeys.seasons(params),
    queryFn: () => listSeasons(params),
  })
}

export function useUpsertSeason() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertSeason,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.seasons({ movie_id: variables.movie_id }),
      })
    },
  })
}

export function useDeleteSeason(movieId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSeason,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.seasons({ movie_id: movieId }),
      })
    },
  })
}

// Episodes
export function episodesQueryOptions(params: ListEpisodesParams) {
  return queryOptions({
    queryKey: catalogKeys.episodes(params),
    queryFn: () => listEpisodes(params),
  })
}

export function streamManifestQueryOptions(params: {
  movie_id?: string | undefined
  episode_id?: string | undefined
  is_trailer?: boolean | undefined
}) {
  return queryOptions<StreamManifest | null>({
    queryKey: catalogKeys.streamManifest(params),
    queryFn: () => getStreamManifest(params),
  })
}

export function useUpsertEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertEpisode,
    onSuccess: async (_, variables) => {
      // Since upsert-episode in backend resolves season and might create it,
      // it's safer to invalidate seasons too if we use season_number
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.episodes({ movie_id: variables.movie_id }),
      })
      if (variables.movie_id) {
        await queryClient.invalidateQueries({
          queryKey: catalogKeys.seasons({ movie_id: variables.movie_id }),
        })
      }
    },
  })
}

export function useDeleteEpisode(movieId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEpisode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.episodes({ movie_id: movieId }),
      })
    },
  })
}

// Genres
export function genresQueryOptions(params?: ListGenresParams) {
  return queryOptions({
    queryKey: catalogKeys.genres(params),
    queryFn: () => listGenres(params),
  })
}

export function useCreateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGenre,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.genres() })
    },
  })
}

export function useUpdateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateGenre,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.genres() })
    },
  })
}

export function useDeleteGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.genres() })
    },
  })
}

// People
export function peopleQueryOptions(params?: ListPeopleParams) {
  return queryOptions({
    queryKey: catalogKeys.people(params),
    queryFn: () => listPeople(params),
  })
}

export function personQueryOptions(id: string) {
  return queryOptions({
    queryKey: catalogKeys.person(id),
    queryFn: () => getPerson(id),
  })
}

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.people() })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePerson,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.people() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.person(variables.id) })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.people() })
    },
  })
}

// Studios
export function studiosQueryOptions(params?: ListStudiosParams) {
  return queryOptions({
    queryKey: catalogKeys.studios(params),
    queryFn: () => listStudios(params),
  })
}

export function studioQueryOptions(id: string) {
  return queryOptions({
    queryKey: catalogKeys.studio(id),
    queryFn: () => getStudio(id),
  })
}

export function useCreateStudio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStudio,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.studios() })
    },
  })
}

export function useUpdateStudio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateStudio,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.studios() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.studio(variables.id) })
    },
  })
}

export function useDeleteStudio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStudio,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.studios() })
    },
  })
}
