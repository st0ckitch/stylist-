'use client'

import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, Sparkles } from 'lucide-react'

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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Style Assistant</h1>
          <p className="text-gray-600">Take a photo for personalized fashion advice</p>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto lg:max-w-none lg:flex lg:gap-8 lg:items-start">
          {/* Camera/Image Section */}
          <div className="lg:flex-1 lg:max-w-xl">
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-lg">
              {!image ? (
                <div className="relative aspect-[3/4] lg:aspect-[4/3]">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className={`absolute inset-0 w-full h-full object-cover ${torchOn ? 'brightness-110' : ''}`}
                    videoConstraints={{
                      facingMode: 'user',
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                  />
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-6 inset-x-0 px-6">
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setTorchOn(!torchOn)}
                        className={`p-4 rounded-full transition-all ${
                          torchOn 
                            ? 'bg-yellow-500 text-white shadow-lg' 
                            : 'bg-gray-800/30 text-white backdrop-blur-md hover:bg-gray-800/40'
                        }`}
                      >
                        <Camera size={24} />
                      </button>
                      
                      <button
                        onClick={capture}
                        className="w-16 h-16 rounded-full border-4 border-white bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[3/4] lg:aspect-[4/3]">
                  <img src={image} alt="captured" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Controls & Advice Section */}
          {image && (
            <div className="mt-6 lg:mt-0 lg:flex-1">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setImage(null)
                      setAdvice('')
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                  >
                    Retake
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Wand2 className="animate-spin" size={20} />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Get Advice</span>
                      </>
                    )}
                  </button>
                </div>
                
                {advice && (
                  <div className="p-6 rounded-2xl bg-white shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Wand2 className="text-blue-500" />
                      Style Advice
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{advice}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
