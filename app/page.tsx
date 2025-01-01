'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Wand2 } from 'lucide-react'
import { CameraView } from '@/components/camera/camera-view'
import { Button } from '@/components/ui/button'

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
              <CameraView 
                webcamRef={webcamRef}
                torchOn={torchOn}
                onTorchToggle={() => setTorchOn(!torchOn)}
                onCapture={capture}
              />
            ) : (
              <div>
                <img src={image} alt="captured" className="w-full aspect-[3/4] object-cover" />
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        setImage(null)
                        setAdvice('')
                      }}
                    >
                      Retake
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={analyzeImage}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Wand2 size={20} className="animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Get Advice'
                      )}
                    </Button>
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
