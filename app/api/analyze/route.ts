import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { image } = await req.json()
    
    const completion = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyze this image of a person's outfit and provide style advice in Georgian language. Be specific about improvements and suggestions: ${image}`
      }],
      model: "claude-3-opus-20240229",
    })

    return NextResponse.json({ 
      advice: completion.content[0].text 
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
