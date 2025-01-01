'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, SunMedium } from 'lucide-react'

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
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Style Assistant
        </h1>
        <p className="text-zinc-400 text-center mb-8">Capture your look, get personalized advice</p>
        
        <div className="webcam-container">
          <div className="relative">
            {!image ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full aspect-[3/4] object-cover"
                  videoConstraints={{
                    facingMode: 'user',
                    aspectRatio: 3/4,
                  }}
                />
                <div className="camera-overlay absolute inset-0" />
                <button
                  onClick={capture}
                  className="button-glass absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-2"
                >
                  <Camera size={24} className="text-white" />
                  <span className="text-white font-medium">Take Photo</span>
                </button>
              </>
            ) : (
              <div>
                <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                <div className="p-4 space-y-4 bg-zinc-900/80 backdrop-blur">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                      className="flex-1 button-glass py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={20} className="text-white" />
                      <span className="text-white font-medium">Retake</span>
                    </button>
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl disabled:opacity-50 disabled:hover:bg-white/10 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Wand2 size={20} className={loading ? 'animate-spin' : ''} />
                      {loading ? 'Analyzing...' : 'Get Advice'}
                    </button>
                  </div>
                  
                  {advice && (
                    <div className="pt-4 border-t border-zinc-800">
                      <h2 className="text-lg font-semibold mb-2 text-white">Style Advice:</h2>
                      <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{advice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
