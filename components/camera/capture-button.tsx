import { Camera } from 'lucide-react'

interface CaptureButtonProps {
  onClick: () => void
}

export function CaptureButton({ onClick }: CaptureButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-blue-600/30"
    >
      <Camera size={24} className="text-white" />
      <span className="text-white font-medium">Take Photo</span>
    </button>
  )
}
