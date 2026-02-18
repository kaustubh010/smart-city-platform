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

    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const newComment = await prisma.comments.create({
      data: {
        issueId: id,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.createdAt,
      user_id: newComment.userId,
      profiles: {
        full_name: newComment.user.name,
      },
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [comments, count] = await prisma.$transaction([
      prisma.comments.findMany({
        where: { issueId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.comments.count({ where: { issueId: id } }),
    ])

    const formattedData = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.createdAt,
      user_id: comment.userId,
      profiles: {
        full_name: comment.user.name,
      },
    }))

    return NextResponse.json({
      data: formattedData,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
