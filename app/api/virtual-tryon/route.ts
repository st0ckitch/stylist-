import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const runtime = 'nodejs'
export const maxDuration = 300 // Set max duration to 5 minutes

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const VMODEL_API_KEY = process.env.VMODEL_API_KEY
  if (!VMODEL_API_KEY) {
    console.error('Missing VMODEL_API_KEY environment variable')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const customModel = formData.get('custom_model')
    const clothesImage = formData.get('clothes_image')

    if (!customModel || !clothesImage) {
      return NextResponse.json({ error: 'Missing required files' }, { status: 400 })
    }

    // Create a new FormData with proper structure
    const apiFormData = new FormData()
    apiFormData.append('custom_model', customModel)
    apiFormData.append('clothes_image', clothesImage)
    apiFormData.append('clothes_type', 'upper_body')
    apiFormData.append('forced_cutting', 'true')
    
    console.log('Sending request to VModel API...')

    const createResponse = await fetch(
      'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VMODEL_API_KEY}`,
        },
        body: apiFormData
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Create job failed:', {
        status: createResponse.status,
        statusText: createResponse.statusText,
        error: errorText
      })
      return NextResponse.json(
        { error: `Failed to create try-on job: ${createResponse.statusText}` },
        { status: createResponse.status }
      )
    }

    const createData = await createResponse.json()
    console.log('Create job response:', createData)
    
    if (createData.code !== 100000 || !createData.result?.job_id) {
      console.error('Invalid create response:', createData)
      return NextResponse.json(
        { error: createData.message?.en || 'Invalid response from service' },
        { status: 400 }
      )
    }

    // Poll for results
    const jobId = createData.result.job_id
    let tries = 0
    let result = null

    while (tries < 30) {
      console.log(`Checking job status (attempt ${tries + 1}/30)...`)
      const resultResponse = await fetch(
        `https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/get-job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${VMODEL_API_KEY}`,
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
      console.log('Job status response:', resultData)
      
      if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
        result = resultData
        break
      }

      if (resultData.code !== 300102) {
        return NextResponse.json(
          { error: resultData.message?.en || 'Processing failed' },
          { status: 400 }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      tries++
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Processing timed out' },
        { status: 408 }
      )
    }

    console.log('Successfully processed image')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
