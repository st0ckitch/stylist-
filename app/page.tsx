'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, SunMedium } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Style Assistant
        </h1>
        <p className="text-gray-600 text-center mb-8">Capture your look, get personalized advice</p>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="relative">
            {!image ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className={`w-full aspect-[3/4] object-cover ${torchOn ? 'webcam-lighting' : ''}`}
                  videoConstraints={{
                    facingMode: 'user',
                    aspectRatio: 3/4,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }}
                />
                <button
                  onClick={() => setTorchOn(!torchOn)}
                  className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                    torchOn 
                      ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' 
                      : 'bg-white/80 hover:bg-white/90'
                  }`}
                >
                  <SunMedium className={torchOn ? 'text-white' : 'text-gray-700'} />
                </button>
                <button
                  onClick={capture}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-blue-600/30"
                >
                  <Camera size={24} className="text-white" />
                  <span className="text-white font-medium">Take Photo</span>
                </button>
              </>
            ) : (
              <div>
                <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                      className="flex-1 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <RefreshCw size={20} className="text-gray-700" />
                      <span className="text-gray-700 font-medium">Retake</span>
                    </button>
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Wand2 size={20} className={loading ? 'animate-spin' : ''} />
                      {loading ? 'Analyzing...' : 'Get Advice'}
                    </button>
                  </div>
                  
                  {advice && (
                    <div className="pt-4 border-t border-gray-100">
                      <h2 className="text-xl font-semibold mb-3 text-gray-800">Style Advice</h2>
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{advice}</p>
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
