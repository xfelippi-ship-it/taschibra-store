'use client'
import { useState, useRef, useCallback } from 'react'

interface Props {
  src: string
  alt?: string
  className?: string
}

export default function ProdutoZoom({ src, alt = '', className = '' }: Props) {
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      {/* Imagem sempre visível */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
      />

      {/* Overlay de zoom por cima da imagem — sem esconder o original */}
      {zoom && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '280%',
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Indicador */}
      {!zoom && (
        <div className="absolute bottom-2 right-2 bg-black/30 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none select-none">
          🔍 zoom
        </div>
      )}
    </div>
  )
}
