import { apiClient } from '@/lib/api-client'
import type {
  ActionLog,
  GetActionLogsParams,
  GetStatusChangeLogsParams,
  StatusChangeLog,
} from '../types/audit.types'

export async function getActionLogs(params: GetActionLogsParams): Promise<ActionLog[]> {
  const response = await apiClient.get<ActionLog[]>('/v1/audit/get-action-logs', { params })
  return response.data
}

export async function getStatusChangeLogs(
  params: GetStatusChangeLogsParams,
): Promise<StatusChangeLog[]> {
  const response = await apiClient.get<StatusChangeLog[]>('/v1/audit/get-status-change-logs', {
    params,
  })
  return response.data
}
