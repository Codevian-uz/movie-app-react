// --- TaskMill ---

export interface QueueStats {
  queue_name: string
  total: number
  available: number
  in_flight: number
  scheduled: number
  in_dlq: number
  oldest_task?: string
  avg_attempts: number
  p95_attempts: number
}

export interface DLQTask {
  id: number
  queue_name: string
  operation_id: string
  payload: unknown
  error: string
  dlq_reason: unknown
  attempts: number
  dlq_at: string
}

export interface TaskResult {
  id: number
  queue_name: string
  task_group_id: string
  operation_id: string
  payload: unknown
  priority: number
  attempts: number
  max_attempts: number
  idempotency_key: string
  scheduled_at: string
  created_at: string
  completed_at: string
}

export interface ScheduleInfo {
  operation_id: string
  queue_name: string
  cron_pattern: string
  next_run_at: string
  last_run_at: string | null
  last_run_status: string | null
  last_error: string | null
  run_count: number
}

// --- Alert ---

export interface AlertError {
  id: string
  code: string
  message: string
  details: Record<string, string>
  service: string
  operation: string
  created_at: string
  alerted: boolean
}

export interface ErrorStats {
  total_count: number
  by_service: { service: string; count: number }[] | null
  by_operation: { operation: string; count: number }[] | null
  by_code: { code: string; count: number }[] | null
}

// --- Params ---

export interface ListDlqTasksParams {
  queue_name?: string | undefined
  operation_id?: string | undefined
  dlq_after?: string | undefined
  dlq_before?: string | undefined
  limit?: number | undefined
  offset?: number | undefined
}

export interface ListTaskResultsParams {
  queue_name?: string | undefined
  task_group_id?: string | undefined
  completed_after?: string | undefined
  completed_before?: string | undefined
  limit?: number | undefined
  offset?: number | undefined
}

export interface ListErrorsParams {
  code?: string | undefined
  service?: string | undefined
  operation?: string | undefined
  alerted?: boolean | undefined
  created_from?: string | undefined
  created_to?: string | undefined
  search?: string | undefined
  sort?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
}

export interface CleanupResultsResponse {
  deleted_count: number
}

export interface CleanupErrorsResponse {
  deleted_count: number
}
