import { prisma } from '@/lib/prisma'
import { lucia } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(lucia.sessionCookieName)

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session, user } = await lucia.validateSession(sessionCookie.value)

    if (!session || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: issueId } = await params

    // Check if user already voted
    const existingVote = await prisma.votes.findFirst({
      where: {
        issueId,
        userId: user.id,
      },
    })

    if (existingVote) {
      // Remove vote
      await prisma.$transaction([
        prisma.votes.delete({
          where: { id: existingVote.id },
        }),
        prisma.issues.update({
          where: { id: issueId },
          data: { upvotes: { decrement: 1 } },
        }),
      ])

      return NextResponse.json({ voted: false })
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.votes.create({
          data: {
            issueId,
            userId: user.id,
            voteType: 'upvote',
          },
        }),
        prisma.issues.update({
          where: { id: issueId },
          data: { upvotes: { increment: 1 } },
        }),
      ])

      return NextResponse.json({ voted: true })
    }
  } catch (error) {
    console.error('Error toggling vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(lucia.sessionCookieName)

    if (!sessionCookie) {
      return NextResponse.json({ voted: false })
    }

    const { user } = await lucia.validateSession(sessionCookie.value)

    if (!user) {
      return NextResponse.json({ voted: false })
    }

    const { id: issueId } = await params

    const vote = await prisma.votes.findFirst({
      where: {
        issueId,
        userId: user.id,
      },
    })

    return NextResponse.json({ voted: !!vote })
  } catch (error) {
    console.error('Error checking vote status:', error)
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    )
  }
}
