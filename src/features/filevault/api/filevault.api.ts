import { useEffect, useState } from 'react'
import { env } from '@/config/env'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth.store'

export interface UploadResponse {
  id: string
  original_name: string
  content_type: string
  size: number
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadResponse>('v1/filevault/upload', formData, {
    onUploadProgress: (progressEvent) => {
      const progress =
        progressEvent.total !== undefined && progressEvent.total !== 0
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0
      onProgress?.(progress)
    },
    // Set a very high timeout for file uploads (10 minutes)
    timeout: 600000,
  })
  return response.data
}

function getBaseApiUrl(): string {
  if (env.apiBaseUrl.startsWith('http')) {
    return env.apiBaseUrl
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const prefix = env.apiBaseUrl.startsWith('/') ? '' : '/'
  return `${origin}${prefix}${env.apiBaseUrl}`
}

export function getFileUrl(id: string): string {
  return `${getBaseApiUrl()}/v1/filevault/download?id=${id}`
}

export function getStreamUrl(id: string): string {
  return `${getBaseApiUrl()}/v1/filevault/stream?id=${id}`
}

export function useAuthenticatedFile(protectedUrl: string | null | undefined) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (protectedUrl === undefined || protectedUrl === null || protectedUrl === '') {
      setObjectUrl(null)
      return
    }

    if (protectedUrl.startsWith('blob:') || protectedUrl.startsWith('data:')) {
      setObjectUrl(protectedUrl)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const fetchFile = async () => {
      try {
        const response = await apiClient.get<Blob>(protectedUrl, {
          responseType: 'blob',
        })
        if (isMounted) {
          const url = URL.createObjectURL(response.data)
          setObjectUrl(url)
        }
      } catch {
        if (isMounted) {
          setObjectUrl(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchFile()

    return () => {
      isMounted = false
    }
  }, [protectedUrl, accessToken])

  return { objectUrl, isLoading }
}
