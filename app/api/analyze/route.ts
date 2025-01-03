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
            text: "მოცემული ფოტოსთვის გამიწიე რეკომენდაცია ჩაცმულობის შესახებ. გააანალიზე რა აცვია და რა შეიძლება გამოასწოროს. დამატებით დამიწერე 3-4 საკვანძო სიტყვა, რომელიც აღწერს მის სტილს ან რა სტილის ტანსაცმელიც შეიძლება მოუხდეს.",
          }
        ]
      }]
    })

    // Extract key terms from the advice
    const advice = message.content[0].text
    // Extract tags from AI response - you might want to implement more sophisticated parsing
    const tags = ['formal', 'classic'] // Replace with actual extracted tags
    const recommendedProducts = findProductsByTags(tags)

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
