'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, SunMedium } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
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
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          Style Assistant
        </h1>
        <p className="text-gray-400 text-center mb-8">Capture your look, get personalized advice</p>
        
        <div className="webcam-container bg-gray-900">
          {!image ? (
            <div className="relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className={`w-full aspect-[3/4] object-cover ${flashOn ? 'brightness-125' : ''}`}
                videoConstraints={{
                  facingMode: 'user',
                  aspectRatio: 3/4,
                }}
              />
              
              <button
                onClick={() => setFlashOn(!flashOn)}
                className={`flash-button ${flashOn ? 'active' : ''} absolute top-4 right-4 p-3 rounded-full`}
              >
                <SunMedium size={24} className="text-white" />
              </button>

              <button
                onClick={capture}
                className="capture-button absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-2"
              >
                <Camera size={24} className="text-white" />
                <span className="text-white">Take Photo</span>
              </button>
            </div>
          ) : (
            <div>
              <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
              <div className="p-4 flex gap-3">
                <button
                  onClick={() => {
                    setImage(null)
                    setAdvice('')
                  }}
                  className="flex-1 capture-button py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  <span className="text-white">Retake</span>
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex-1 action-button text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Wand2 size={20} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Analyzing...' : 'Get Advice'}
                </button>
              </div>
            </div>
          )}

          {advice && (
            <div className="p-6 border-t border-gray-800 bg-black/30 backdrop-blur">
              <h2 className="text-lg font-semibold mb-2 text-white">Style Advice:</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{advice}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
