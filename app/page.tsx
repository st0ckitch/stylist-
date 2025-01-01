'use client'

import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Wand2, SparklesIcon } from 'lucide-react'
import CameraView from '@/components/camera/camera-view'

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
    <main className="min-h-screen p-4 overflow-hidden">
      <div className="max-w-md mx-auto pt-8">
        <div className="animated-gradient p-[3px] rounded-[2rem] mb-8 hover-scale">
          <div className="bg-white rounded-[2rem] p-6">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Style Assistant
            </h1>
            <p className="text-gray-600 text-center">Capture your look, get personalized advice</p>
          </div>
        </div>
        
        <div className="glassmorphism rounded-3xl overflow-hidden">
          <div className="relative">
            {!image ? (
              <CameraView 
                webcamRef={webcamRef}
                torchOn={torchOn}
                onTorchToggle={() => setTorchOn(!torchOn)}
                onCapture={capture}
              />
            ) : (
              <div>
                <div className="relative">
                  <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                      className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      Retake
                    </button>
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 button-shine bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Wand2 size={20} className="animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon size={20} />
                          <span>Get Advice</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {advice && (
                    <div className="pt-4 border-t border-gray-200">
                      <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Wand2 size={20} className="text-blue-600" />
                        Style Advice
                      </h2>
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{advice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Powered by Claude AI
        </div>
      </div>
    </main>
  )
}
