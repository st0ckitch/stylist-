// app/api/virtual-tryon/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const formData = await req.formData()
    
    // First request to create the job
    const createResponse = await fetch(
      'https://developer.vmodel.ai/api/vmodel/v1/ai-virtual-try-on/create-job',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VMODEL_API_KEY}`,
          'Accept': 'application/json'
        },
        body: formData
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Create job failed:', errorText)
      throw new Error('Failed to create try-on job')
    }

    const createData = await createResponse.json()
    
    if (createData.code !== 100000 || !createData.result?.job_id) {
      console.error('Invalid create response:', createData)
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
            'Authorization': `Bearer ${process.env.VMODEL_API_KEY}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text()
        console.error('Get job failed:', errorText)
        throw new Error('Failed to check job status')
      }

      const resultData = await resultResponse.json()
      
      if (resultData.code === 100000 && resultData.result?.output_image_url?.[0]) {
        result = resultData
        break
      }

      if (resultData.code !== 300102) { // Not in progress
        console.error('Job failed:', resultData)
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
      { error: error instanceof Error ? error.message : 'Failed to process virtual try-on' },
      { status: 500 }
    )
  }
}
