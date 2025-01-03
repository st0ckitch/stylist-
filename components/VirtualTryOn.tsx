'use client'

import { useState } from 'react'
import { Upload, X, ShirtIcon, PersonStanding, Loader2 } from 'lucide-react'

type VirtualTryOnProps = {
  isOpen: boolean
  onClose: () => void
}

export function VirtualTryOn({ isOpen, onClose }: VirtualTryOnProps) {
  const [modelImage, setModelImage] = useState<File | null>(null)
  const [clothingImage, setClothingImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setModelImage(e.target.files[0])
    }
  }

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setClothingImage(e.target.files[0])
    }
  }

  const createTryOnJob = async () => {
    if (!modelImage || !clothingImage) return
    setLoading(true)

    const formData = new FormData()
    formData.append('clothes_image', clothingImage)
    formData.append('custom_model', modelImage)
    formData.append('clothes_type', 'upper_body')

    try {
      const response = await fetch('/api/virtual-tryon', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.result?.output_image_url) {
        setResult(data.result.output_image_url[0])
      }
    } catch (error) {
      console.error('Error:', error)
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
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
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModelUpload}
                    className="hidden"
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
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClothingUpload}
                    className="hidden"
                  />
                  <ShirtIcon size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Upload clothing image</p>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Try On Button */}
        <button
          onClick={createTryOnJob}
          disabled={!modelImage || !clothingImage || loading}
          className="w-full mt-6 py-3 px-4 bg-blue-500 text-white rounded-xl font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <img src={result} alt="Try-on result" className="w-full rounded-xl" />
          </div>
        )}
      </div>
    </div>
  )
}
