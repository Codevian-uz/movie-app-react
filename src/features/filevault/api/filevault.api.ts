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

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadResponse>('v1/filevault/upload', formData, {
    headers: {
      'Content-Type': undefined,
    },
  })
  return response.data
}

export function getFileUrl(id: string): string {
  // Return relative path without /api prefix, as apiClient will add it
  return `v1/filevault/download?id=${id}`
}

export function getStreamUrl(id: string): string {
  // Return relative path without /api prefix, as apiClient will add it
  return `v1/filevault/stream?id=${id}`
}

/**
 * Hook to fetch a protected file URL using the stored access token
 * and return a local object URL that can be used in <img> or <video> tags.
 */
export function useAuthenticatedFile(protectedUrl: string | null | undefined) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (protectedUrl === undefined || protectedUrl === null || protectedUrl === '') {
      setObjectUrl(null)
      return
    }

    // If it's already a blob or data URL, use it directly
    if (protectedUrl.startsWith('blob:') || protectedUrl.startsWith('data:')) {
      setObjectUrl(protectedUrl)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const fetchFile = async () => {
      try {
        const response = await apiClient.get(protectedUrl, {
          responseType: 'blob',
        })
        if (isMounted) {
          const url = URL.createObjectURL(response.data)
          setObjectUrl(url)
        }
      } catch (error) {
        console.error('Failed to fetch authenticated file:', error)
        if (isMounted) setObjectUrl(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void fetchFile()

    return () => {
      isMounted = false
      if (objectUrl !== null && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [protectedUrl, accessToken])

  return { objectUrl, isLoading }
}
