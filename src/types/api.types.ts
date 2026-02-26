export interface ApiError {
  code: string
  message: string
  cause?: string
  fields?: Record<string, string>
  trace?: string
  details?: unknown
}

export interface ApiErrorResponse {
  trace_id: string
  error: ApiError
}

export class ApiException extends Error {
  readonly code: string
  readonly statusCode: number
  readonly traceId: string
  readonly cause: string | undefined
  readonly fields: Record<string, string> | undefined
  readonly details: unknown

  constructor(params: {
    message: string
    code: string
    statusCode: number
    traceId: string
    cause?: string | undefined
    fields?: Record<string, string> | undefined
    details?: unknown
  }) {
    super(params.message)
    this.name = 'ApiException'
    this.code = params.code
    this.statusCode = params.statusCode
    this.traceId = params.traceId
    this.cause = params.cause
    this.fields = params.fields
    this.details = params.details
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR'
  }
}

export interface PaginatedResponse<T> {
  page_number: number
  page_size: number
  count: number
  content: T[]
}

export interface ListResponse<T> {
  content: T[]
}
