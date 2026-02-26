import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ListDlqTasksParams,
  ListErrorsParams,
  ListTaskResultsParams,
} from '../types/platform.types'
import {
  cleanupErrors,
  cleanupResults,
  getError,
  getErrorStats,
  getQueueStats,
  listDlqTasks,
  listErrors,
  listQueues,
  listSchedules,
  listTaskResults,
  purgeQueue,
  purgeDlq,
  requeueFromDlq,
  triggerSchedule,
} from './platform.api'

export const platformKeys = {
  queues: () => ['platform', 'queues'] as const,
  queueStats: (queueName: string) => ['platform', 'queue-stats', queueName] as const,
  dlqTasks: (params?: ListDlqTasksParams) => ['platform', 'dlq-tasks', params] as const,
  taskResults: (params?: ListTaskResultsParams) => ['platform', 'task-results', params] as const,
  schedules: (queueName?: string) => ['platform', 'schedules', queueName] as const,
  errors: (params?: ListErrorsParams) => ['platform', 'errors', params] as const,
  error: (id: string) => ['platform', 'error', id] as const,
  errorStats: (from?: string, to?: string) => ['platform', 'error-stats', from, to] as const,
}

export function queuesQueryOptions() {
  return queryOptions({
    queryKey: platformKeys.queues(),
    queryFn: listQueues,
  })
}

export function queueStatsQueryOptions(queueName: string) {
  return queryOptions({
    queryKey: platformKeys.queueStats(queueName),
    queryFn: () => getQueueStats(queueName),
    refetchInterval: 30_000,
  })
}

export function dlqTasksQueryOptions(params?: ListDlqTasksParams) {
  return queryOptions({
    queryKey: platformKeys.dlqTasks(params),
    queryFn: () => listDlqTasks(params),
  })
}

export function taskResultsQueryOptions(params?: ListTaskResultsParams) {
  return queryOptions({
    queryKey: platformKeys.taskResults(params),
    queryFn: () => listTaskResults(params),
  })
}

export function schedulesQueryOptions(queueName?: string) {
  return queryOptions({
    queryKey: platformKeys.schedules(queueName),
    queryFn: () => listSchedules(queueName),
  })
}

export function errorsQueryOptions(params?: ListErrorsParams) {
  return queryOptions({
    queryKey: platformKeys.errors(params),
    queryFn: () => listErrors(params),
  })
}

export function errorQueryOptions(id: string) {
  return queryOptions({
    queryKey: platformKeys.error(id),
    queryFn: () => getError(id),
  })
}

export function errorStatsQueryOptions(from?: string, to?: string) {
  return queryOptions({
    queryKey: platformKeys.errorStats(from, to),
    queryFn: () => getErrorStats(from, to),
  })
}

// --- Mutations ---

export function useRequeueFromDlq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requeueFromDlq,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform', 'dlq-tasks'] })
    },
  })
}

export function usePurgeQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purgeQueue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform'] })
    },
  })
}

export function usePurgeDlq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purgeDlq,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform'] })
    },
  })
}

export function useCleanupResults() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      completedBefore,
      queueName,
    }: {
      completedBefore: string
      queueName?: string | undefined
    }) => cleanupResults(completedBefore, queueName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform', 'task-results'] })
    },
  })
}

export function useTriggerSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerSchedule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform', 'schedules'] })
    },
  })
}

export function useCleanupErrors() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cleanupErrors,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform', 'errors'] })
      await queryClient.invalidateQueries({ queryKey: ['platform', 'error-stats'] })
    },
  })
}
