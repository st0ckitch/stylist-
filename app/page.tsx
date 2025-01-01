'use client'

import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Wand2, Sparkles, Sun, Moon } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

type WebcamRef = Webcam & {
  getScreenshot: () => string | null
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [torchOn, setTorchOn] = useState<boolean>(false)
  const webcamRef = useRef<WebcamRef | null>(null)

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
    <main className="min-h-screen bg-gray-50">
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            {/* Camera/Image Section */}
            <div className="flex-1 lg:max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
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
                          type="button"
                        >
                          {torchOn ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        
                        <button
                          onClick={capture}
                          className="w-20 h-20 rounded-full border-4 border-white bg-blue-500 hover:bg-blue-600 text-white shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
                          type="button"
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
                    className="flex-1 py-4 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-light transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-gray-200"
                    type="button"
                  >
                    <RefreshCw size={20} />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="flex-1 py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-light flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    type="button"
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
                  <div className="p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                    <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2">
                      <Wand2 className="text-blue-500" />
                      Style Advice
                    </h2>
                    <p className="text-gray-600 leading-relaxed font-light">{advice}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl font-light text-gray-900 mb-4">Welcome to Style Assistant</h2>
          <p className="text-lg text-gray-600 font-light mb-8">Sign in to get personalized fashion advice</p>
          <SignInButton mode="modal">
            <button className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 transition-colors font-light">
              Sign in to continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </main>
  )
}
