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
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const LENS = 120  // tamanho da lupa em px
  const SCALE = 3   // fator de ampliação

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // Porcentagem para o painel
    const px = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const py = Math.max(0, Math.min(100, (y / rect.height) * 100))
    setPos({ x: px, y: py })
    // Posição da lente (centrada no cursor, limitada às bordas)
    const lx = Math.max(0, Math.min(rect.width - LENS, x - LENS / 2))
    const ly = Math.max(0, Math.min(rect.height - LENS, y - LENS / 2))
    setLensPos({ x: lx, y: ly })
  }, [])

  return (
    <div className={`relative flex ${className}`}>
      {/* Imagem principal com lente */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-white overflow-hidden cursor-crosshair"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain"
        />

        {/* Lente quadrada sobre a imagem */}
        {zoom && (
          <div
            className="absolute border-2 border-green-500 bg-green-500/10 pointer-events-none"
            style={{
              width: LENS,
              height: LENS,
              left: lensPos.x,
              top: lensPos.y,
            }}
          />
        )}

        {!zoom && (
          <div className="absolute bottom-2 right-2 bg-black/25 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
            🔍 zoom
          </div>
        )}
      </div>

      {/* Painel ampliado à direita — estilo Amazon */}
      {zoom && (
        <div
          className="absolute left-full top-0 ml-2 w-[420px] aspect-square bg-white border border-gray-200 shadow-2xl overflow-hidden z-50 pointer-events-none"
          style={{ minHeight: '100%' }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute"
            style={{
              width: `${SCALE * 100}%`,
              height: `${SCALE * 100}%`,
              maxWidth: 'none',
              top: `${-pos.y * (SCALE - 1)}%`,
              left: `${-pos.x * (SCALE - 1)}%`,
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  )
}
