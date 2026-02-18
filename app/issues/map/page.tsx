"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IssuesMap } from '@/components/issues-map'

export default function MapPage() {
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

  const issuesWithCoords = issues?.filter(
    (i) => i.latitude != null && i.longitude != null
  ) || []

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Issue Map</h1>
              <p className="text-muted-foreground mt-1">
                {issuesWithCoords.length} of {issues?.length || 0} issues have location data
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/issues">📋 List View</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/report">Report Issue</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {Object.entries(categoryEmojis).map(([key, emoji]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1"
            >
              <span>{emoji}</span>
              <span className="capitalize">{key.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Interactive Map */}
        <IssuesMap issues={issues || []} />

        {/* Issues List Below Map */}
        {issuesWithCoords.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Issues with Location Data ({issuesWithCoords.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issuesWithCoords.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{categoryEmojis[issue.category] || '📍'}</div>
                    <span className="text-xs font-semibold text-primary">👍 {issue.upvotes || 0}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-sm line-clamp-2">
                    {issue.title}
                  </h3>
                  {issue.location && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{issue.location}</p>
                  )}
                  <div className="text-xs font-mono text-muted-foreground bg-muted/50 p-1.5 rounded">
                    📍 {Number(issue.latitude)?.toFixed(4)}, {Number(issue.longitude)?.toFixed(4)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {issuesWithCoords.length === 0 && (
          <div className="mt-8 text-center py-12 bg-card border border-border rounded-lg">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-muted-foreground mb-6">No issues with location data yet.</p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/report">Report an Issue with Location</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
