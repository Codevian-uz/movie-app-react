import { env } from '@/config/env'
import { apiClient } from '@/lib/api-client'

export interface UploadResponse {
  id: string
  original_name: string
  content_type: string
  size: number
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadResponse>('/v1/filevault/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export function getFileUrl(id: string): string {
  return `${env.apiBaseUrl}/v1/filevault/download?id=${id}`
}

export function getStreamUrl(id: string): string {
  return `${env.apiBaseUrl}/v1/filevault/stream?id=${id}`
}
