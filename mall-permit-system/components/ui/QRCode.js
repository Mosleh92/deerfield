import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

export default function QRCode({ 
  value, 
  size = 200, 
  level = 'M',
  className = '',
  ...props 
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: level
      })
    }
  }, [value, size, level])

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      {...props}
    />
  )
}