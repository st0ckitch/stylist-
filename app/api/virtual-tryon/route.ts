import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const formData = await req.formData()
    
    // Create the job
    const createResponse = await fetch(
      'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job',
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.VMODEL_API_KEY || '',
          'accept': 'application/json'
        },
        body: formData
      }
    )

    const createData = await createResponse.json()
    
    if (createData.code !== 100000) {
      throw new Error(createData.message?.en || 'Failed to create try-on job')
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
            'Authorization': process.env.VMODEL_API_KEY || '',
            'accept': 'application/json'
          }
        }
      )

      const resultData = await resultResponse.json()
      
      if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
        result = resultData
        break
      }

      if (resultData.code !== 300102) { // Not in progress
        throw new Error(resultData.message?.en || 'Failed to generate image')
      }

      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      tries++
    }

    if (!result) {
      throw new Error('Generation timed out')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process virtual try-on' },
      { status: 500 }
    )
  }
}
