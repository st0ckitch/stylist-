import { SunMedium } from 'lucide-react'

interface TorchButtonProps {
  active: boolean
  onClick: () => void
}

export function TorchButton({ active, onClick }: TorchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
        active 
          ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' 
          : 'bg-white/80 hover:bg-white/90'
      }`}
    >
      <SunMedium className={active ? 'text-white' : 'text-gray-700'} />
    </button>
  )
}
