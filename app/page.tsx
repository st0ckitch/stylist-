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
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          Style Assistant
        </h1>
        <p className="text-slate-600 text-center mb-8">Capture your look, get personalized advice</p>
        
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
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
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/80 hover:bg-white/90 transition-colors shadow-lg"
                >
                  <SunMedium className={`${torchOn ? 'text-yellow-500' : 'text-slate-700'}`} />
                </button>
                <button
                  onClick={capture}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Camera size={24} className="text-slate-700" />
                  <span className="text-slate-700 font-medium">Take Photo</span>
                </button>
              </>
            ) : (
              <div>
                <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                <div className="p-4 space-y-4 bg-white border-t">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={20} className="text-slate-700" />
                      <span className="text-slate-700 font-medium">Retake</span>
                    </button>
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50 disabled:hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Wand2 size={20} className={loading ? 'animate-spin' : ''} />
                      {loading ? 'Analyzing...' : 'Get Advice'}
                    </button>
                  </div>
                  
                  {advice && (
                    <div className="pt-4 border-t border-slate-100">
                      <h2 className="text-lg font-semibold mb-2 text-slate-800">Style Advice:</h2>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{advice}</p>
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
