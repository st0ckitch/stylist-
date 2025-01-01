import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  const { userId } = auth()
  
  // Check if user is authenticated
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

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
            text: "მოცემული ფოტოსთვის გამიწიე რეკომენდაცია ჩაცმულობის შესახებ. გააანალიზე რა აცვია და რა შეიძლება გამოასწოროს."
          }
        ]
      }]
    })

    return NextResponse.json({ 
      advice: message.content[0].text 
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
