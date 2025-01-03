import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300
export const preferredRegion = 'iad1'

interface AbortError extends Error {
  name: 'AbortError'
}

function isAbortError(error: unknown): error is AbortError {
  return error instanceof Error && error.name === 'AbortError'
}

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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 280000) // 4.6 minutes

    try {
      console.log('Creating virtual try-on job...')
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
        console.error('API Error:', errorText)
        return NextResponse.json({ 
          error: `API Error: ${createResponse.status} - ${errorText}` 
        }, { status: createResponse.status })
      }

      let createData
      try {
        createData = await createResponse.json()
        console.log('Job created:', createData)
      } catch (e) {
        console.error('Invalid JSON response:', e)
        return NextResponse.json({ 
          error: 'Invalid JSON response from API' 
        }, { status: 500 })
      }

      if (createData.code !== 100000 || !createData.result?.job_id) {
        console.error('Failed to create job:', createData)
        return NextResponse.json({ 
          error: createData.message?.en || 'Failed to create job' 
        }, { status: 400 })
      }

      const jobId = createData.result.job_id
      let tries = 0
      let result = null

      console.log('Polling for job completion...')
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
          console.error('Failed to check job status:', await resultResponse.text())
          return NextResponse.json({ 
            error: 'Failed to check job status' 
          }, { status: resultResponse.status })
        }

        const resultData = await resultResponse.json()
        console.log('Job status check:', resultData)
        
        if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
          result = resultData
          console.log('Job completed successfully')
          break
        }

        if (resultData.code !== 300102) { // 300102 is "processing" status
          console.error('Processing failed:', resultData)
          return NextResponse.json({ 
            error: resultData.message?.en || 'Processing failed' 
          }, { status: 400 })
        }

        await new Promise(resolve => setTimeout(resolve, 2000))
        tries++
      }

      if (!result) {
        console.error('Processing timed out after', tries, 'attempts')
        return NextResponse.json({ 
          error: 'Processing timed out' 
        }, { status: 408 })
      }

      return NextResponse.json(result)
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: unknown) {
    if (isAbortError(error)) {
      console.error('Request timeout')
      return NextResponse.json({ 
        error: 'Request timeout' 
      }, { status: 408 })
    }
    
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 })
  }
}
