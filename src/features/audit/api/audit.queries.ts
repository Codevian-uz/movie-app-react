import { queryOptions } from '@tanstack/react-query'
import type { GetActionLogsParams, GetStatusChangeLogsParams } from '../types/audit.types'
import { getActionLogs, getStatusChangeLogs } from './audit.api'

export const auditKeys = {
  actionLogs: (params: GetActionLogsParams) => ['audit', 'action-logs', params] as const,
  statusChangeLogs: (params: GetStatusChangeLogsParams) =>
    ['audit', 'status-change-logs', params] as const,
}

export function actionLogsQueryOptions(params: GetActionLogsParams) {
  return queryOptions({
    queryKey: auditKeys.actionLogs(params),
    queryFn: () => getActionLogs(params),
  })
}

export function statusChangeLogsQueryOptions(params: GetStatusChangeLogsParams) {
  return queryOptions({
    queryKey: auditKeys.statusChangeLogs(params),
    queryFn: () => getStatusChangeLogs(params),
  })
}
