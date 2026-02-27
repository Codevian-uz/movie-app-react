import { apiClient } from '@/lib/api-client'
import type { ListResponse, PaginatedResponse } from '@/types/api.types'
import type {
  AlertError,
  CleanupErrorsResponse,
  CleanupResultsResponse,
  DLQTask,
  ErrorStats,
  ListDlqTasksParams,
  ListErrorsParams,
  ListTaskResultsParams,
  QueueStats,
  ScheduleInfo,
  TaskResult,
} from '../types/platform.types'

// --- TaskMill ---

export async function listQueues(): Promise<string[]> {
  const response = await apiClient.get<ListResponse<string>>('v1/platform/list-queues')
  return response.data.content
}

export async function getQueueStats(queueName: string): Promise<QueueStats> {
  const response = await apiClient.get<QueueStats>('v1/platform/get-queue-stats', {
    params: { queue_name: queueName },
  })
  return response.data
}

export async function listDlqTasks(params?: ListDlqTasksParams): Promise<DLQTask[]> {
  const response = await apiClient.get<ListResponse<DLQTask>>('v1/platform/list-dlq-tasks', {
    params,
  })
  return response.data.content
}

export async function listTaskResults(params?: ListTaskResultsParams): Promise<TaskResult[]> {
  const response = await apiClient.get<ListResponse<TaskResult>>('v1/platform/list-task-results', {
    params,
  })
  return response.data.content
}

export async function listSchedules(queueName?: string): Promise<ScheduleInfo[]> {
  const response = await apiClient.get<ListResponse<ScheduleInfo>>('v1/platform/list-schedules', {
    params: queueName !== undefined ? { queue_name: queueName } : undefined,
  })
  return response.data.content
}

export async function requeueFromDlq(taskId: number): Promise<void> {
  await apiClient.post('v1/platform/requeue-from-dlq', { task_id: taskId })
}

export async function purgeQueue(queueName: string): Promise<void> {
  await apiClient.post('v1/platform/purge-queue', { queue_name: queueName })
}

export async function purgeDlq(queueName: string): Promise<void> {
  await apiClient.post('v1/platform/purge-dlq', { queue_name: queueName })
}

export async function cleanupResults(
  completedBefore: string,
  queueName?: string,
): Promise<CleanupResultsResponse> {
  const response = await apiClient.post<CleanupResultsResponse>('v1/platform/cleanup-results', {
    completed_before: completedBefore,
    ...(queueName !== undefined ? { queue_name: queueName } : {}),
  })
  return response.data
}

export async function triggerSchedule(operationId: string): Promise<void> {
  await apiClient.post('v1/platform/trigger-schedule', { operation_id: operationId })
}

// --- Alert ---

export async function listErrors(
  params?: ListErrorsParams,
): Promise<PaginatedResponse<AlertError>> {
  const response = await apiClient.get<PaginatedResponse<AlertError>>('v1/platform/list-errors', {
    params,
  })
  return response.data
}

export async function getError(id: string): Promise<AlertError> {
  const response = await apiClient.get<AlertError>('v1/platform/get-error', {
    params: { id },
  })
  return response.data
}

export async function getErrorStats(createdFrom?: string, createdTo?: string): Promise<ErrorStats> {
  const response = await apiClient.get<ErrorStats>('v1/platform/get-error-stats', {
    params: {
      ...(createdFrom !== undefined ? { created_from: createdFrom } : {}),
      ...(createdTo !== undefined ? { created_to: createdTo } : {}),
    },
  })
  return response.data
}

export async function cleanupErrors(createdBefore: string): Promise<CleanupErrorsResponse> {
  const response = await apiClient.post<CleanupErrorsResponse>('v1/platform/cleanup-errors', {
    created_before: createdBefore,
  })
  return response.data
}
