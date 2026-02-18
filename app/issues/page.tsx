"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('/api/issues')
        if (!response.ok) throw new Error('Failed to fetch issues')
        const data = await response.json()
        setIssues(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssues()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Community Issues</h1>
              <p className="text-muted-foreground mt-1">
                {issues?.length || 0} issues reported • Vote to prioritize
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/issues/map">🗺️ View Map</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/report">Report Issue</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : issues && issues.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="group flex flex-col rounded-lg border border-border bg-card hover:border-primary/50 overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                  {categoryEmojis[issue.category] || '📍'}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground text-pretty group-hover:text-primary transition-colors line-clamp-2">
                        {issue.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {issue.location || 'Location not specified'}
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {issue.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium capitalize ${
                          issue.status === 'open'
                            ? 'bg-accent/20 text-accent'
                            : issue.status === 'in_progress'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      👍 {issue.upvotes || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No Issues Yet</h3>
            <p className="text-muted-foreground mb-8">
              Be the first to report an issue in your community!
            </p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/report">Report the First Issue</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
