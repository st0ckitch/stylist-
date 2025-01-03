import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const VMODEL_API_KEY = process.env.VMODEL_API_KEY
  if (!VMODEL_API_KEY) {
    console.error('Missing VMODEL_API_KEY')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const customModel = formData.get('custom_model')
    const clothesImage = formData.get('clothes_image')

    if (!customModel || !clothesImage) {
      return NextResponse.json({ error: 'Missing required files' }, { status: 400 })
    }

    // Type guard to ensure we have File objects
    if (!(customModel instanceof File) || !(clothesImage instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    }

    // Create separate payload and files as per API documentation
    const payload = {
      clothes_type: 'upper_body',
      forced_cutting: true,
      prompt: 'Try on this clothing item'
    }

    // Create FormData for the API request
    const apiFormData = new FormData()
    
    // Add files with proper structure
    apiFormData.append('clothes_image', new Blob([clothesImage], { type: clothesImage.type }), 'clothing.jpg')
    apiFormData.append('custom_model', new Blob([customModel], { type: customModel.type }), 'model.jpg')
    
    // Add payload fields
    Object.entries(payload).forEach(([key, value]) => {
      apiFormData.append(key, value.toString())
    })

    console.log('Sending request to VModel API...')
    const createResponse = await fetch(
      'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job',
      {
        method: 'POST',
        headers: {
          'Authorization': VMODEL_API_KEY,
          'Accept': 'application/json'
        },
        body: apiFormData
      }
    )

    const responseText = await createResponse.text()
    console.log('API Response:', responseText)

    if (!createResponse.ok) {
      return NextResponse.json(
        { error: `API Error: ${responseText}` },
        { status: createResponse.status }
      )
    }

    try {
      const createData = JSON.parse(responseText)
      
      if (createData.code !== 100000 || !createData.result?.job_id) {
        return NextResponse.json(
          { error: createData.message?.en || 'Failed to create job' },
          { status: 400 }
        )
      }

      // Poll for results
      const jobId = createData.result.job_id
      let tries = 0
      let result = null

      while (tries < 30) {
        console.log(`Checking job ${jobId} status (attempt ${tries + 1})...`)
        const resultResponse = await fetch(
          `https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/get-job/${jobId}`,
          {
            headers: {
              'Authorization': VMODEL_API_KEY,
              'Accept': 'application/json'
            }
          }
        )

        const resultData = await resultResponse.json()
        console.log('Job status:', resultData)
        
        if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
          result = resultData
          break
        }

        if (resultData.code !== 300102) { // Not in progress
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

      return NextResponse.json(result)
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError)
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
