import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

// Configure for Vercel Pro using the new Next.js 14 format
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes
export const preferredRegion = 'iad1'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const VMODEL_API_KEY = process.env.VMODEL_API_KEY
  if (!VMODEL_API_KEY) {
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const customModel = formData.get('custom_model')
    const clothesImage = formData.get('clothes_image')

    if (!customModel || !clothesImage) {
      return NextResponse.json({ error: 'Missing required files' }, { status: 400 })
    }

    if (!(customModel instanceof Blob) || !(clothesImage instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    }

    const url = 'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job'
    const apiFormData = new FormData()
    apiFormData.append('clothes_image', clothesImage)
    apiFormData.append('custom_model', customModel)
    apiFormData.append('clothes_type', 'upper_body')
    apiFormData.append('forced_cutting', 'true')

    // Add timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 280000) // 280 seconds

    try {
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': VMODEL_API_KEY,
        },
        body: apiFormData,
        signal: controller.signal
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        return NextResponse.json({ 
          error: `API Error: ${createResponse.status} - ${errorText}` 
        }, { status: createResponse.status })
      }

      let createData
      try {
        createData = await createResponse.json()
      } catch (e) {
        return NextResponse.json({ 
          error: 'Invalid JSON response from API' 
        }, { status: 500 })
      }

      if (createData.code !== 100000 || !createData.result?.job_id) {
        return NextResponse.json({ 
          error: createData.message?.en || 'Failed to create job' 
        }, { status: 400 })
      }

      // Poll for results
      const jobId = createData.result.job_id
      let tries = 0
      let result = null

      while (tries < 30) {
        const resultResponse = await fetch(
          `https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/get-job/${jobId}`,
          {
            headers: {
              'Authorization': VMODEL_API_KEY,
            },
            signal: controller.signal
          }
        )

        if (!resultResponse.ok) {
          return NextResponse.json({ 
            error: 'Failed to check job status' 
          }, { status: resultResponse.status })
        }

        const resultData = await resultResponse.json()
        
        if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
          result = resultData
          break
        }

        if (resultData.code !== 300102) {
          return NextResponse.json({ 
            error: resultData.message?.en || 'Processing failed' 
          }, { status: 400 })
        }

        await new Promise(resolve => setTimeout(resolve, 2000))
        tries++
      }

      if (!result) {
        return NextResponse.json({ 
          error: 'Processing timed out' 
        }, { status: 408 })
      }

      return NextResponse.json(result)
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout' 
      }, { status: 408 })
    }
    
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 })
  }
}
