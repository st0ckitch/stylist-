import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const VMODEL_API_KEY = process.env.VMODEL_API_KEY
  if (!VMODEL_API_KEY) {
    console.error('Missing VMODEL_API_KEY environment variable')
    return new NextResponse(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    
    // First request to create the job
    const createResponse = await fetch(
      'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VMODEL_API_KEY}`,
          'Accept': 'application/json'
        },
        body: formData
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Create job failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to create try-on job. Please check your image and try again.' },
        { status: createResponse.status }
      )
    }

    const createData = await createResponse.json()
    
    if (createData.code !== 100000 || !createData.result?.job_id) {
      console.error('Invalid create response:', createData)
      return NextResponse.json(
        { error: createData.message?.en || 'Failed to create try-on job' },
        { status: 400 }
      )
    }

    // Poll for results
    const jobId = createData.result.job_id
    let tries = 0
    let result = null

    while (tries < 30) { // Poll for up to 1 minute (30 * 2 seconds)
      const resultResponse = await fetch(
        `https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/get-job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${VMODEL_API_KEY}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text()
        console.error('Get job failed:', errorText)
        return NextResponse.json(
          { error: 'Failed to check job status' },
          { status: resultResponse.status }
        )
      }

      const resultData = await resultResponse.json()
      
      if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
        result = resultData
        break
      }

      if (resultData.code !== 300102) { // Not in progress
        return NextResponse.json(
          { error: resultData.message?.en || 'Failed to generate image' },
          { status: 400 }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      tries++
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Generation timed out. Please try again.' },
        { status: 408 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
