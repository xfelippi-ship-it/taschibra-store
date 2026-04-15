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
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      <img src={src} alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-150 ${zoom ? 'opacity-0' : 'opacity-100'}`} />
      {zoom && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `url(${src})`, backgroundSize: '250%', backgroundPosition: `${pos.x}% ${pos.y}%`, backgroundRepeat: 'no-repeat' }} />
      )}
      {!zoom && (
        <div className="absolute bottom-2 right-2 bg-black/30 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
          🔍 zoom
        </div>
      )}
    </div>
  )
}
