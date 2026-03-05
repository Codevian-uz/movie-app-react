import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  GetCommentsParams,
  GetStatsParams,
  GetStatusParams,
} from '../types/interactions.types'
import {
  addComment,
  getComments,
  getStats,
  getStatus,
  listContinueWatching,
  listMyList,
  rate,
  toggleFavorite,
  toggleLike,
  updateProgress,
} from './interactions.api'

export const interactionsKeys = {
  all: ['interactions'] as const,
  myList: () => [...interactionsKeys.all, 'my-list'] as const,
  continueWatching: () => [...interactionsKeys.all, 'continue-watching'] as const,
  comments: (params: GetCommentsParams) => [...interactionsKeys.all, 'comments', params] as const,
  stats: (params: GetStatsParams) => [...interactionsKeys.all, 'stats', params] as const,
  status: (params: GetStatusParams) => [...interactionsKeys.all, 'status', params] as const,
}

export function myListQueryOptions(params?: {
  target_type?: string
  page_number?: number
  page_size?: number
}) {
  return queryOptions({
    queryKey: [...interactionsKeys.myList(), params],
    queryFn: () => listMyList(params),
  })
}

export function continueWatchingQueryOptions() {
  return queryOptions({
    queryKey: interactionsKeys.continueWatching(),
    queryFn: listContinueWatching,
  })
}

export function commentsQueryOptions(params: GetCommentsParams) {
  return queryOptions({
    queryKey: interactionsKeys.comments(params),
    queryFn: () => getComments(params),
  })
}

export function statsQueryOptions(params: GetStatsParams) {
  return queryOptions({
    queryKey: interactionsKeys.stats(params),
    queryFn: () => getStats(params),
  })
}

export function statusQueryOptions(params: GetStatusParams) {
  return queryOptions({
    queryKey: interactionsKeys.status(params),
    queryFn: () => getStatus(params),
  })
}

export function useUpdateProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProgress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: interactionsKeys.continueWatching() })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: interactionsKeys.myList() })
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.status({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
    },
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleLike,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.stats({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.status({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addComment,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.comments({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.stats({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
    },
  })
}

export function useRate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rate,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: interactionsKeys.status({
          target_type: variables.target_type,
          target_id: variables.target_id,
        }),
      })
      // If we had average rating in stats, we'd invalidate that too, but stats only has counts.
    },
  })
}
