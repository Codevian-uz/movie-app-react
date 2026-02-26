import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateMovieRequest, ListMoviesParams } from '../types/catalog.types'
import { createMovie, getMovie, listGenres, listMovies } from './catalog.api'

export const catalogKeys = {
  all: ['catalog'] as const,
  movies: (params?: ListMoviesParams) => [...catalogKeys.all, 'movies', params] as const,
  movie: (id: string) => [...catalogKeys.all, 'movie', id] as const,
  genres: () => [...catalogKeys.all, 'genres'] as const,
}

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

export function genresQueryOptions() {
  return queryOptions({
    queryKey: catalogKeys.genres(),
    queryFn: listGenres,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMovieRequest) => createMovie(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}
