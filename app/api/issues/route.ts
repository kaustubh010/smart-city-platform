import { prisma } from '@/lib/prisma'
import { lucia } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, STORAGE_FOLDERS } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, category, location, latitude, longitude, image } = body

    let imageUrl = ''
    let publicId = ''

    if (image) {
      const uploadResult = await uploadImage(image, STORAGE_FOLDERS.ISSUES)
      imageUrl = uploadResult.secure_url
      publicId = uploadResult.public_id
    }

    const newIssue = await prisma.issues.create({
      data: {
        title,
        description,
        category,
        location,
        latitude,
        longitude,
        imageUrl,
        publicId,
        userId: user.id,
        status: 'open',
      },
    })

    // Map back to snake_case for frontend
    return NextResponse.json({
      ...newIssue,
      image_url: newIssue.imageUrl,
      user_id: newIssue.userId,
      created_at: newIssue.createdAt,
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status

    const [issues, count] = await prisma.$transaction([
      prisma.issues.findMany({
        where,
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
      prisma.issues.count({ where }),
    ])

    // Map to match the expected frontend shape
    const formattedData = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      latitude: issue.latitude,
      longitude: issue.longitude,
      image_url: issue.imageUrl,
      status: issue.status,
      created_at: issue.createdAt,
      user_id: issue.userId,
      profiles: {
        full_name: issue.user.name,
      },
    }))

    return NextResponse.json({
      data: formattedData,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}
