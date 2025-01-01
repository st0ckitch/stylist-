'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const webcamRef = useRef<Webcam | null>(null)

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setImage(imageSrc)
    }
  }

  const analyzeImage = async () => {
    if (!image) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })
      
      const data = await response.json()
      setAdvice(data.advice)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setAdvice('Error analyzing image. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-md">
        {!image ? (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <button
              onClick={capture}
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              Take Photo
            </button>
          </>
        ) : (
          <>
            <img src={image} alt="captured" className="w-full rounded-lg" />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setImage(null)}
                className="flex-1 bg-gray-500 text-white p-2 rounded-lg"
              >
                Retake
              </button>
              <button
                onClick={analyzeImage}
                className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Get Advice'}
              </button>
            </div>
          </>
        )}

        {advice && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Style Advice:</h2>
            <p className="text-gray-700">{advice}</p>
          </div>
        )}
      </div>
    </main>
  )
}
