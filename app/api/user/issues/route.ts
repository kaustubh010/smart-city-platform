import { prisma } from '@/lib/prisma'
import { lucia } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [issues, count] = await prisma.$transaction([
      prisma.issues.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      }),
      prisma.issues.count({ where: { userId: user.id } }),
    ])

    const formattedData = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      status: issue.status,
      created_at: issue.createdAt,
      vote_count: issue._count.votes,
      comment_count: issue._count.comments,
    }))

    return NextResponse.json({
      data: formattedData,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching user issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user issues' },
      { status: 500 }
    )
  }
}
