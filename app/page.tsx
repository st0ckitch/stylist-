'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2 } from 'lucide-react'

const BackgroundPattern = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
  </div>
)

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
    <main className="min-h-screen bg-white relative overflow-hidden">
      <BackgroundPattern />
      
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 inline-block text-transparent bg-clip-text">
            Style Assistant
          </h1>
          <p className="text-gray-500 mt-2">Capture your look, get personalized advice</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              <button
                onClick={capture}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Camera className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                <span>Take Photo</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>
              <div className="p-4 flex gap-3">
                <button
                  onClick={() => {
                    setImage(null)
                    setAdvice('')
                  }}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
                >
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                  Retake
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wand2 size={20} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Analyzing...' : 'Get Advice'}
                </button>
              </div>
            </div>
          )}

          {advice && (
            <div className="p-6 border-t border-gray-100 bg-gradient-to-b from-gray-50/50">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Style Advice:</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{advice}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
