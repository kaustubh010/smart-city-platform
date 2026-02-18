import { NextRequest, NextResponse } from 'next/server'

// Dummy AI classification function - in production this would call Claude or GPT
async function classifyIssue(description: string, title: string): Promise<string> {
  // Simple keyword-based classification for demo purposes
  const text = `${title} ${description}`.toLowerCase()

  const categories: { [key: string]: string[] } = {
    pothole: ['pothole', 'hole', 'road damage', 'pavement', 'asphalt'],
    lighting: ['light', 'dark', 'street light', 'lamp', 'visibility'],
    drainage: ['drain', 'water', 'puddle', 'flooding', 'wet', 'sewage'],
    sidewalk: ['sidewalk', 'pavement', 'concrete', 'curb', 'walkway'],
    traffic_sign: ['sign', 'traffic', 'signal', 'road sign', 'marker'],
    graffiti: ['graffiti', 'spray', 'vandal', 'paint', 'tag'],
    tree: ['tree', 'branch', 'limb', 'vegetation', 'foliage'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }

  return 'other'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, imageBase64 } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const category = await classifyIssue(description, title)

    // Determine urgency based on keywords
    const text = `${title} ${description}`.toLowerCase()
    let urgency = 'medium'

    if (
      text.includes('dangerous') ||
      text.includes('hazard') ||
      text.includes('emergency') ||
      text.includes('risk')
    ) {
      urgency = 'high'
    } else if (text.includes('minor') || text.includes('small')) {
      urgency = 'low'
    }

    return NextResponse.json({
      category,
      urgency,
      confidence: 0.8,
    })
  } catch (error) {
    console.error('Error classifying issue:', error)
    return NextResponse.json(
      { error: 'Failed to classify issue' },
      { status: 500 }
    )
  }
}
