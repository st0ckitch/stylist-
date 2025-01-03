'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, RefreshCw, Wand2, Sparkles, Shirt, Loader2 } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Product } from '@/lib/db'
import { ProductRecommendations } from '@/components/ProductRecommendations'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [tryOnImage, setTryOnImage] = useState<File | null>(null)
  const [tryOnLoading, setTryOnLoading] = useState<boolean>(false)
  const [tryOnResult, setTryOnResult] = useState<string | null>(null)
  const [tryOnError, setTryOnError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (tryOnResult) URL.revokeObjectURL(tryOnResult)
      if (image) URL.revokeObjectURL(image)
    }
  }, [])

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
      setRecommendations(data.recommendations || [])
    } catch (error) {
      setAdvice('Error analyzing image. Please try again.')
    }
    setLoading(false)
  }

  const handleTryOnUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !image) return

    setTryOnImage(file)
    setTryOnLoading(true)
    setTryOnError(null)

    try {
      const response = await fetch(image)
      const modelBlob = await response.blob()

      const formData = new FormData()
      formData.append('clothes_image', file)
      formData.append('custom_model', modelBlob)

      const tryOnResponse = await fetch('/api/virtual-tryon', {
        method: 'POST',
        body: formData,
      })

      if (!tryOnResponse.ok) {
        const errorData = await tryOnResponse.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || 'Server error: ' + tryOnResponse.status)
      }

      const data = await tryOnResponse.json()
      console.log('Try-on response:', data)

      if (data.result?.output_image_url?.[0]) {
        const imageUrl = data.result.output_image_url[0]
        console.log('Fetching result image from:', imageUrl)

        const imageResponse = await fetch(imageUrl, {
          cache: 'no-store'
        })

        if (!imageResponse.ok) {
          throw new Error('Failed to fetch result image')
        }

        const imageBlob = await imageResponse.blob()
        const blobUrl = URL.createObjectURL(imageBlob)

        if (tryOnResult) {
          URL.revokeObjectURL(tryOnResult)
        }

        setTryOnResult(blobUrl)
        setTryOnError(null)
      } else {
        throw new Error('No result image received')
      }
    } catch (error) {
      console.error('Virtual try-on failed:', error)
      setTryOnError(error instanceof Error ? error.message : 'Failed to process virtual try-on')
      if (tryOnResult) {
        URL.revokeObjectURL(tryOnResult)
        setTryOnResult(null)
      }
    } finally {
      setTryOnLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (image) {
        URL.revokeObjectURL(image)
      }
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  const reset = () => {
    if (image) {
      URL.revokeObjectURL(image)
      setImage(null)
    }
    setAdvice('')
    setRecommendations([])
    setTryOnImage(null)
    if (tryOnResult) {
      URL.revokeObjectURL(tryOnResult)
      setTryOnResult(null)
    }
    setTryOnError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            <div className="flex-1 lg:max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
                {!image ? (
                  <div className="relative aspect-[4/5] lg:aspect-[4/3] flex flex-col items-center justify-center p-6">
                    <label className="cursor-pointer flex flex-col items-center gap-4">
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera size={48} className="text-gray-400" />
                      <p className="text-sm text-gray-500">Upload your photo</p>
                    </label>
                    <p className="text-xs text-gray-400 mt-4 text-center max-w-sm">
                      ატვირთეთ მხოლოდ მაღალი ხარისხის ფოტოები, პირდაპირი რაკურსით. არ ატვირთოთ პროფილში გადაღებული სურათები*
                    </p>
                  </div>
                  <div className="relative aspect-[4/5] lg:aspect-[4/3] flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center gap-4">
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera size={48} className="text-gray-400" />
                      <p className="text-sm text-gray-500">Upload your photo</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative aspect-[4/5] lg:aspect-[4/3]">
                    <img 
                      src={image} 
                      alt="uploaded" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-6 lg:mt-0 lg:w-96 transition-all ${image ? 'opacity-100' : 'opacity-0'}`}>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    onClick={reset}
                    className="flex-1 py-4 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-light transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-gray-200"
                    type="button"
                  >
                    <RefreshCw size={20} />
                    <span>Reset</span>
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

                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleTryOnUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={tryOnLoading || !image}
                    className="w-full py-4 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-light transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-gray-200 disabled:opacity-50"
                    type="button"
                  >
                    {tryOnLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing Try-On...</span>
                      </>
                    ) : (
                      <>
                        <Shirt size={20} />
                        <span>Try On Clothes</span>
                      </>
                    )}
                  </button>

                  {tryOnError && (
                    <div className="mt-2 text-sm text-red-500 text-center">
                      {tryOnError}
                    </div>
                  )}
                </div>
                
                {advice && (
                  <>
                    <div className="p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                      <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2">
                        <Wand2 className="text-blue-500" />
                        Style Advice
                      </h2>
                      <p className="text-gray-600 leading-relaxed font-light">{advice}</p>
                    </div>
                    
                    {recommendations.length > 0 && (
                      <ProductRecommendations products={recommendations} />
                    )}
                  </>
                )}

                {tryOnResult && (
                  <div className="p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                    <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2">
                      <Shirt className="text-blue-500" />
                      Virtual Try-On Result
                    </h2>
                    <div className="relative">
                      <img 
                        src={tryOnResult} 
                        alt="Virtual try-on result" 
                        className="w-full rounded-lg shadow-md"
                        onError={() => {
                          setTryOnError('Failed to load result image')
                          if (tryOnResult) {
                            URL.revokeObjectURL(tryOnResult)
                            setTryOnResult(null)
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center" 
                           style={{ display: tryOnLoading ? 'flex' : 'none' }}>
                        <Loader2 className="animate-spin text-white" size={32} />
                      </div>
                    </div>
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
