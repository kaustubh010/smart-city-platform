"use client"

import { useEffect, useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { VoteButton } from '@/components/vote-button'
import { CommentSection } from '@/components/comment-section'
import { IssueLocationMap } from '@/components/issue-location-map'

const categoryEmojis: Record<string, string> = {
  pothole: '🕳️',
  lighting: '💡',
  drainage: '💧',
  sidewalk: '🚶',
  traffic_sign: '🛑',
  graffiti: '🎨',
  tree: '🌳',
  other: '📋',
}

const statusColors: Record<string, string> = {
  open: 'bg-accent/20 text-accent',
  in_progress: 'bg-secondary/20 text-secondary',
  resolved: 'bg-primary/20 text-primary',
}

export default function IssuePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const id = params.id
  const [issue, setIssue] = useState<any | null>(null)
  const [comments, setComments] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Issue Details
        const issueRes = await fetch(`/api/issues/${id}`)
        if (!issueRes.ok) {
          if (issueRes.status === 404) return setIssue('not_found')
          throw new Error('Failed to fetch issue details')
        }
        const issueData = await issueRes.json()
        setIssue(issueData)

        // Fetch Comments
        const commentsRes = await fetch(`/api/issues/${id}/comments`)
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (issue === 'not_found') {
    notFound()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <p className="text-red-500">Error: {error || 'Something went wrong'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/issues" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Issues
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{issue.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            {issue.image_url ? (
              <div className="aspect-video rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl border border-border">
                {categoryEmojis[issue.category] || '📍'}
              </div>
            )}

            {/* Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[issue.status] || 'bg-muted text-muted-foreground'}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                    {issue.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pb-6 border-b border-border">
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">Location</div>
                  <div className="font-semibold text-foreground text-sm">{issue.location || 'Not specified'}</div>
                  {issue.latitude && issue.longitude && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Number(issue.latitude).toFixed(4)}, {Number(issue.longitude).toFixed(4)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">Reported By</div>
                  <div className="font-semibold text-foreground text-sm">
                    {issue.profiles?.full_name || 'Anonymous'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">Date Reported</div>
                  <div className="font-semibold text-foreground text-sm">
                    {new Date(issue.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {issue.description && (
                <div className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
                </div>
              )}
            </div>

            {/* Location Map */}
            {issue.latitude && issue.longitude && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">📍 Issue Location</h3>
                <IssueLocationMap
                  latitude={Number(issue.latitude)}
                  longitude={Number(issue.longitude)}
                  title={issue.title}
                  category={issue.category}
                />
              </div>
            )}

            {/* Comments Section */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Community Feedback</h3>
              <CommentSection issueId={id} comments={comments || []} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vote Card */}
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Help Prioritize</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-2">{issue.upvotes || 0}</div>
                <p className="text-sm text-muted-foreground">people upvoted this issue</p>
              </div>
              <VoteButton issueId={id} currentVotes={issue.upvotes || 0} />
            </div>

            {/* Share Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Share This Issue</h3>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
              >
                📋 Copy Link
              </Button>
            </div>

            {/* Info Card */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">How to Help</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Upvote if you've seen it</li>
                <li>✓ Comment with details</li>
                <li>✓ Share in community</li>
                <li>✓ Track progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
