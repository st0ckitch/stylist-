'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const webcamRef = useRef<Webcam | null>(null)

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) setImage(imageSrc)
  }

  const analyzeImage = async () => {
    if (!image) return
    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = await response.json()
      setAdvice(data.advice)
    } catch (error) {
      setAdvice('Error analyzing image. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Style Assistant</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {!image ? (
            <div className="relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full aspect-[3/4] object-cover"
                videoConstraints={{
                  facingMode: 'user',
                  aspectRatio: 3/4
                }}
              />
              <button
                onClick={capture}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Camera size={24} />
                Take Photo
              </button>
            </div>
          ) : (
            <div>
              <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => {
                    setImage(null)
                    setAdvice('')
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Retake
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {loading ? 'Analyzing...' : 'Get Advice'}
                </button>
              </div>
            </div>
          )}

          {advice && (
            <div className="p-4 border-t border-gray-100">
              <h2 className="text-lg font-semibold mb-2">Style Advice:</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{advice}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
