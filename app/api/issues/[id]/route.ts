import { prisma } from '@/lib/prisma'
import { lucia } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const issue = await prisma.issues.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Map to match the expected frontend shape
    return NextResponse.json({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      latitude: issue.latitude,
      longitude: issue.longitude,
      image_url: issue.imageUrl,
      status: issue.status,
      upvotes: issue.upvotes,
      created_at: issue.createdAt,
      updated_at: issue.updatedAt,
      user_id: issue.userId,
      profiles: {
        full_name: issue.user.name,
      },
    })
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { status } = body

    // Verify user owns the issue
    const issue = await prisma.issues.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!issue || issue.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedIssue = await prisma.issues.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      ...updatedIssue,
      image_url: updatedIssue.imageUrl,
      user_id: updatedIssue.userId,
      created_at: updatedIssue.createdAt,
    })
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
