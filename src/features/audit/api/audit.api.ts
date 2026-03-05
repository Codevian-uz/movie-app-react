import { apiClient } from '@/lib/api-client'
import type { ListResponse } from '@/types/api.types'
import type {
  ActionLog,
  GetActionLogsParams,
  GetStatusChangeLogsParams,
  StatusChangeLog,
} from '../types/audit.types'

export async function getActionLogs(params: GetActionLogsParams): Promise<ActionLog[]> {
  const response = await apiClient.get<ListResponse<ActionLog>>('v1/audit/get-action-logs', {
    params,
  })
  return response.data.content
}

export async function getStatusChangeLogs(
  params: GetStatusChangeLogsParams,
): Promise<StatusChangeLog[]> {
  const response = await apiClient.get<ListResponse<StatusChangeLog>>(
    'v1/audit/get-status-change-logs',
    {
      params,
    },
  )
  return response.data.content
}
