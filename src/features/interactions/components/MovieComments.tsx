import { type SyntheticEvent, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { MessageSquare, Send, User } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { commentsQueryOptions, useAddComment } from '@/features/interactions'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

interface MovieCommentsProps {
  movieId: string
}

export function MovieComments({ movieId }: MovieCommentsProps) {
  const { isAuthenticated } = useAuthStore()
  const [content, setContent] = useState('')
  const addComment = useAddComment()

  const { data: commentsData, isLoading } = useQuery({
    ...commentsQueryOptions({ target_type: 'movie', target_id: movieId }),
  })

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to comment')
      return
    }
    if (content.trim() === '') {
      return
    }

    try {
      await addComment.mutateAsync({
        target_type: 'movie',
        target_id: movieId,
        content,
      })
      toast.success('Comment added')
      setContent('')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const comments = commentsData?.content ?? []

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
        {commentsData?.count !== undefined && commentsData.count > 0 && (
          <span className="text-muted-foreground ml-2 text-sm">({commentsData.count})</span>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {isAuthenticated ? (
          <form
            onSubmit={(e) => {
              void handleSubmit(e)
            }}
            className="space-y-4"
          >
            <Textarea
              placeholder="What do you think about this title?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
              }}
              className="min-h-[100px] border-white/10 bg-white/5 text-white focus:border-orange-500/50 focus:ring-orange-500/50"
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={addComment.isPending || content.trim() === ''}
                className="cursor-pointer gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <p className="text-gray-400">Log in to join the discussion and share your thoughts.</p>
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
              <Link to="/login">Login to Comment</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 space-y-6 border-t border-white/10 pt-8">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-orange-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-gray-500 italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarFallback className="bg-white/10 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">User</p>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
