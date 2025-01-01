'use client'

import { RefObject } from 'react'
import Webcam from 'react-webcam'
import { TorchButton } from './torch-button'
import { CaptureButton } from './capture-button'

interface CameraViewProps {
  webcamRef: RefObject<Webcam>
  torchOn: boolean
  onTorchToggle: () => void
  onCapture: () => void
}

export default function CameraView({ webcamRef, torchOn, onTorchToggle, onCapture }: CameraViewProps) {
  return (
    <div className="relative">
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
      <TorchButton active={torchOn} onClick={onTorchToggle} />
      <CaptureButton onClick={onCapture} />
    </div>
  )
}
