'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    full_name?: string
  } | null
}

export function CommentSection({
  issueId,
  comments: initialComments,
}: {
  issueId: string
  comments: Comment[]
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const user = useAuth();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newCommentData = await response.json()

      if (newCommentData) {
        setComments([newCommentData, ...comments])
        setNewComment('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
            Share Your Thoughts
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment or suggestion..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        {error && <div className="text-sm text-destructive mb-4">{error}</div>}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="bg-primary text-primary-foreground font-semibold"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {comment.profiles?.full_name || 'Anonymous'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
