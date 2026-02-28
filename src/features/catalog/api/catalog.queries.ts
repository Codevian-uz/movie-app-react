import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListGenresParams, ListMoviesParams, ListPeopleParams } from '../types/catalog.types'
import {
  createGenre,
  createMovie,
  createPerson,
  deleteGenre,
  deleteMovie,
  deletePerson,
  getMovie,
  getPerson,
  listGenres,
  listMovies,
  listPeople,
  updateGenre,
  updateMovie,
  updatePerson,
} from './catalog.api'

export const catalogKeys = {
  all: ['catalog'] as const,
  movies: (params?: ListMoviesParams) => [...catalogKeys.all, 'movies', params] as const,
  movie: (id: string) => [...catalogKeys.all, 'movie', id] as const,
  genres: (params?: ListGenresParams) => [...catalogKeys.all, 'genres', params] as const,
  genre: (id: string) => [...catalogKeys.all, 'genre', id] as const,
  people: (params?: ListPeopleParams) => [...catalogKeys.all, 'people', params] as const,
  person: (id: string) => [...catalogKeys.all, 'person', id] as const,
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
