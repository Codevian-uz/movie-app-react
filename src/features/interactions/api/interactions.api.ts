import { apiClient } from '@/lib/api-client'
import type {
  AddCommentRequest,
  Comment,
  GetCommentsParams,
  GetCommentsResponse,
  GetStatsParams,
  GetStatsResponse,
  GetStatusParams,
  GetStatusResponse,
  ListContinueWatchingResponse,
  ListMyListResponse,
  RateRequest,
  RateResponse,
  ToggleFavoriteRequest,
  ToggleFavoriteResponse,
  ToggleLikeRequest,
  ToggleLikeResponse,
  UpdateProgressRequest,
} from '../types/interactions.types'

// Progress
export async function updateProgress(data: UpdateProgressRequest): Promise<void> {
  await apiClient.post('v1/interactions/progress', data)
}

export async function listContinueWatching(): Promise<ListContinueWatchingResponse> {
  const response = await apiClient.get<ListContinueWatchingResponse>(
    'v1/interactions/progress/continue-watching',
  )
  return response.data
}

// Favorites
export async function toggleFavorite(data: ToggleFavoriteRequest): Promise<ToggleFavoriteResponse> {
  const response = await apiClient.post<ToggleFavoriteResponse>(
    'v1/interactions/favorites/toggle',
    data,
  )
  return response.data
}

export async function listMyList(params?: {
  target_type?: string
  page_number?: number
  page_size?: number
}): Promise<ListMyListResponse> {
  const response = await apiClient.get<ListMyListResponse>('v1/interactions/favorites/my-list', {
    params,
  })
  return response.data
}

// Comments
export async function getComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
  const response = await apiClient.get<GetCommentsResponse>('v1/interactions/comments', { params })
  return response.data
}

export async function addComment(data: AddCommentRequest): Promise<Comment> {
  const response = await apiClient.post<Comment>('v1/interactions/comments', data)
  return response.data
}

// Likes
export async function toggleLike(data: ToggleLikeRequest): Promise<ToggleLikeResponse> {
  const response = await apiClient.post<ToggleLikeResponse>('v1/interactions/likes/toggle', data)
  return response.data
}

// Stats & Status
export async function getStats(params: GetStatsParams): Promise<GetStatsResponse> {
  const response = await apiClient.get<GetStatsResponse>('v1/interactions/stats', { params })
  return response.data
}

export async function getStatus(params: GetStatusParams): Promise<GetStatusResponse> {
  const response = await apiClient.get<GetStatusResponse>('v1/interactions/status', { params })
  return response.data
}

// Rating
export async function rate(data: RateRequest): Promise<RateResponse> {
  const response = await apiClient.post<RateResponse>('v1/interactions/rate', data)
  return response.data
}
