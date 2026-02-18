'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function VoteButton({
  issueId,
  currentVotes,
}: {
  issueId: string
  currentVotes: number
}) {
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [votes, setVotes] = useState(currentVotes)
  const router = useRouter()
  const user = useAuth();

  useEffect(() => {
    const checkVote = async () => {
      try {
        const response = await fetch(`/api/issues/${issueId}/vote`)
        const data = await response.json()
        setHasVoted(data.voted)
      } catch (error) {
        console.error('Error checking vote status:', error)
      }
    }

    checkVote()
  }, [issueId])

  const handleVote = async () => {

    if (!user) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to update vote')
      }

      const data = await response.json()
      setHasVoted(data.voted)
      setVotes((prev) => (data.voted ? prev + 1 : Math.max(0, prev - 1)))
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleVote}
      disabled={isLoading}
      className={`w-full py-2 font-semibold ${
        hasVoted
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
      }`}
    >
      {isLoading ? 'Loading...' : hasVoted ? '✓ Upvoted' : '👍 Upvote This Issue'}
    </Button>
  )
}
