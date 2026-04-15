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
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setPos({ x, y })
  }, [])

  // Converte posição do cursor em offset do centro para translate
  const tx = (50 - pos.x) * 1.5
  const ty = (50 - pos.y) * 1.5

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in select-none ${className}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      {/* Imagem base — sempre visível, escala suave ao zoom */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`w-full h-full object-contain transition-transform duration-200 ease-out ${zoom ? 'scale-[2.4]' : 'scale-100'}`}
        style={ zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined }
      />

      {/* Indicador quando não está em zoom */}
      {!zoom && (
        <div className="absolute bottom-2 right-2 bg-black/25 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none select-none">
          🔍 zoom
        </div>
      )}
    </div>
  )
}
