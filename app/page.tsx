'use client'

import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, Sparkles, Sun, Moon } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState(null)
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const webcamRef = useRef(null)

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animated-gradient">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            Style Assistant
          </h1>
          <p className="text-gray-600 text-lg">Capture your look for personalized fashion advice</p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-12">
          {/* Camera/Image Section */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-gray-100">
              {!image ? (
                <div className="relative aspect-[4/5] lg:aspect-[4/3]">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                      torchOn ? 'webcam-lighting' : ''
                    }`}
                    videoConstraints={{
                      facingMode: 'user',
                      width: { ideal: 1920 },
                      height: { ideal: 1080 }
                    }}
                  />
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-8 inset-x-0 px-6">
                    <div className="flex items-center justify-center gap-8">
                      <button
                        onClick={() => setTorchOn(!torchOn)}
                        className={`p-4 rounded-full transition-all transform hover:scale-105 ${
                          torchOn 
                            ? 'bg-yellow-500 text-white shadow-lg' 
                            : 'bg-gray-800/30 text-white backdrop-blur-md hover:bg-gray-800/40'
                        }`}
                      >
                        {torchOn ? <Sun size={24} /> : <Moon size={24} />}
                      </button>
                      
                      <button
                        onClick={capture}
                        className="w-20 h-20 rounded-full border-4 border-white bg-blue-500 hover:bg-blue-600 text-white shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
                      >
                        <Camera size={32} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/5] lg:aspect-[4/3]">
                  <img 
                    src={image} 
                    alt="captured" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls & Advice Section */}
          <div className={`mt-6 lg:mt-0 lg:w-96 transition-all ${image ? 'opacity-100' : 'opacity-0'}`}>
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setImage(null)
                    setAdvice('')
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  <span>Retake</span>
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg button-shine"
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
                <div className="p-6 rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wand2 className="text-blue-500" />
                    Style Advice
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{advice}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
