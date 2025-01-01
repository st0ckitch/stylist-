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
    <main className="fixed inset-0 bg-black">
      <div className="relative h-full flex flex-col">
        {/* Top Bar */}
        <div className="relative z-10 px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
          <h1 className="text-2xl font-medium text-white">Style Assistant</h1>
          <p className="text-sm text-gray-300">Take a photo for fashion advice</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {!image ? (
            <div className="h-full">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className={`h-full w-full object-cover ${torchOn ? 'brightness-110' : ''}`}
                videoConstraints={{
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
              />
              
              {/* Camera Controls */}
              <div className="absolute bottom-0 inset-x-0 pb-10 px-6">
                <div className="flex items-center justify-center gap-6">
                  {/* Flash Toggle */}
                  <button
                    onClick={() => setTorchOn(!torchOn)}
                    className={`p-4 rounded-full ${
                      torchOn 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-black/30 text-white backdrop-blur-md'
                    }`}
                  >
                    <Camera size={24} />
                  </button>
                  
                  {/* Capture Button */}
                  <button
                    onClick={capture}
                    className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="relative flex-1">
                <img src={image} alt="captured" className="h-full w-full object-cover" />
                
                {/* Action Buttons */}
                <div className="absolute bottom-0 inset-x-0 p-6 space-y-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                      className="flex-1 py-3 rounded-2xl bg-white/20 backdrop-blur-md text-white font-medium"
                    >
                      Retake
                    </button>
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 py-3 rounded-2xl bg-blue-500 text-white font-medium flex items-center justify-center gap-2"
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
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <h2 className="text-lg font-medium text-white mb-2">Style Advice</h2>
                      <p className="text-gray-200 leading-relaxed">{advice}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
