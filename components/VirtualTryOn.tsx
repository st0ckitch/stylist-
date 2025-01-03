import { useState, useRef } from 'react'
import { X, ShirtIcon, PersonStanding, Loader2 } from 'lucide-react'

interface VirtualTryOnProps {
  isOpen: boolean
  onClose: () => void
}

export function VirtualTryOn({ isOpen, onClose }: VirtualTryOnProps) {
  const [modelImage, setModelImage] = useState<File | null>(null)
  const [clothingImage, setClothingImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const clothingInputRef = useRef<HTMLInputElement>(null)

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setModelImage(file)
      setError(null)
    }
  }

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setClothingImage(file)
      setError(null)
    }
  }

  const resetFiles = () => {
    setModelImage(null)
    setClothingImage(null)
    setResult(null)
    setError(null)
    if (modelInputRef.current) modelInputRef.current.value = ''
    if (clothingInputRef.current) clothingInputRef.current.value = ''
  }

  const createTryOnJob = async () => {
    if (!modelImage || !clothingImage) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('clothes_image', clothingImage)
    formData.append('custom_model', modelImage)

    try {
      const response = await fetch('/api/virtual-tryon', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.result?.output_image_url?.[0]) {
        setResult(data.result.output_image_url[0])
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to generate try-on image')
      }
    } catch (err) {
      console.error('Virtual try-on failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to process virtual try-on')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light">Virtual Try-On</h2>
          <div className="flex gap-4">
            <button 
              onClick={resetFiles}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Reset
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              {modelImage ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(modelImage)} 
                    alt="Model preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button 
                    onClick={() => setModelImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    ref={modelInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModelUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <PersonStanding size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Upload your photo</p>
                </label>
              )}
            </div>
          </div>

          {/* Clothing Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              {clothingImage ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(clothingImage)} 
                    alt="Clothing preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button 
                    onClick={() => setClothingImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    ref={clothingInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleClothingUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <ShirtIcon size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Upload clothing image</p>
                </label>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Try On Button */}
        <button
          onClick={createTryOnJob}
          disabled={!modelImage || !clothingImage || loading}
          className="w-full mt-6 py-3 px-4 bg-blue-500 text-white rounded-xl font-light 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                     hover:bg-blue-600 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processing...</span>
            </>
          ) : (
            <span>Try It On</span>
          )}
        </button>

        {/* Result Section */}
        {result && (
          <div className="mt-6">
            <img 
              src={result} 
              alt="Try-on result" 
              className="w-full rounded-xl"
              onError={() => setError('Failed to load result image')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
