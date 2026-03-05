export interface ToggleLikeRequest {
  target_type: string // "movie", "comment"
  target_id: string
}

export interface ToggleLikeResponse {
  liked: boolean
}

export interface AddCommentRequest {
  target_type: string // "movie", "comment"
  target_id: string
  content: string
}

export interface Comment {
  id: string
  user_id: string
  target_type: string
  target_id: string
  content: string
  status: string
  created_at: string
  updated_at?: string
}

export interface GetCommentsParams {
  target_type: string
  target_id: string
  page_number?: number
  page_size?: number
  sort?: string
}

export interface GetCommentsResponse {
  page_number: number
  page_size: number
  count: number
  content: Comment[]
}

export interface GetStatsParams {
  target_type: string
  target_id: string
}

export interface GetStatsResponse {
  likes_count: number
  comments_count: number
  views_count: number
}

export interface GetStatusParams {
  target_type: string
  target_id: string
}

export interface GetStatusResponse {
  is_liked: boolean
  is_favorited: boolean
  rating: number | null
  progress: {
    progress_seconds: number
    is_finished: boolean
    updated_at: string
  } | null
}

export interface RateRequest {
  target_type: string
  target_id: string
  value: number
}

export interface RateResponse {
  user_id: string
  target_type: string
  target_id: string
  value: number
  updated_at: string
}

export interface ToggleFavoriteRequest {
  target_type: string
  target_id: string
}

export interface ToggleFavoriteResponse {
  favorited: boolean
}

export interface UpdateProgressRequest {
  movie_id: string
  episode_id?: string | undefined
  progress_seconds: number
  is_finished?: boolean | undefined
}

export interface WatchProgress {
  movie_id: string
  episode_id: string | null
  progress_seconds: number
  updated_at: string
}

export interface ListContinueWatchingResponse {
  content: WatchProgress[]
}

export interface MyListItem {
  target_type: string
  target_id: string
  created_at: string
}

export interface ListMyListResponse {
  page_number: number
  page_size: number
  count: number
  content: MyListItem[]
}
