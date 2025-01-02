import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import Anthropic from '@anthropic-ai/sdk'
import { findProductsByTags } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const imageData = body.image.replace(/^data:image\/\w+;base64,/, '')
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageData
            }
          },
          {
            type: "text",
            text: "Analyze the outfit in this image and provide style advice. Please also include 3-4 key fashion terms or categories that would match better alternatives for this style.",
          }
        ]
      }]
    })

    // Extract key terms from the advice
    const advice = message.content[0].text
    const recommendedProducts = findProductsByTags(['formal', 'classic']) // Replace with actual tags from advice

    return NextResponse.json({ 
      advice,
      recommendations: recommendedProducts
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
