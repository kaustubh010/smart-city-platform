"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (isAuthLoading || (isLoading && !error)) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!user || !dashboardData) return null

  const { fullName, totalIssues, impactLevel, memberSince, userIssues } = dashboardData
  const role = 'citizen'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{fullName}</h1>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/login?logout=true">Sign Out</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Reports</div>
            <div className="text-3xl font-bold text-primary">{totalIssues || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Issues you've reported</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Impact Level</div>
            <div className="text-3xl font-bold text-secondary">
              {impactLevel}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Community contribution</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Member Since</div>
            <div className="text-lg font-bold text-foreground">
              {new Date(memberSince).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active contributor</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Recent Reports</h2>
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/report">Report New Issue</Link>
              </Button>
            </div>

            {userIssues && userIssues.length > 0 ? (
              <div className="space-y-4">
                {userIssues.map((issue: any) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="block p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{issue.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          issue.status === 'open'
                            ? 'bg-accent/20 text-accent'
                            : issue.status === 'in_progress'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {issue.status.replace('_', ' ').charAt(0).toUpperCase() +
                          issue.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {issue.description || issue.location || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-3">
                        <span>👍 {issue.upvotes || 0}</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-muted-foreground mb-4">You haven't reported any issues yet.</p>
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/report">Report Your First Issue</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button asChild className="w-full bg-primary text-primary-foreground">
                  <Link href="/report">📍 Report Issue</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/issues">🔍 Browse Issues</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/issues/map">🗺️ View Map</Link>
                </Button>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">How to Help</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Report issues with photos</li>
                <li>✓ Vote on urgent problems</li>
                <li>✓ Comment with suggestions</li>
                <li>✓ Track resolution progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
