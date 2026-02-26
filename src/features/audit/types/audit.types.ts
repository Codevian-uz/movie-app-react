export interface ActionLog {
  id: number
  user_id: string | null
  module: string
  operation_id: string
  request_payload: unknown
  ip_address: string
  user_agent: string
  tags: string[]
  group_key: string | null
  trace_id: string
  created_at: string
}

export interface StatusChangeLog {
  id: number
  action_log_id: number
  entity_type: string
  entity_id: string
  status: string
  trace_id: string
  created_at: string
}

export interface GetActionLogsParams {
  from: string
  to: string
  module?: string | undefined
  operation_id?: string | undefined
  user_id?: string | undefined
  tags?: string[] | undefined
  group_key?: string | undefined
  cursor?: number | undefined
  limit?: number | undefined
}

export interface GetStatusChangeLogsParams {
  from: string
  to: string
  entity_type?: string | undefined
  entity_id?: string | undefined
  action_log_id?: number | undefined
  cursor?: number | undefined
  limit?: number | undefined
}
