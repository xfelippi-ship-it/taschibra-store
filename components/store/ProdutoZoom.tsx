'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  src: string
  alt?: string
  className?: string
}

export default function ProdutoZoom({ src, alt = '', className = '' }: Props) {
  const [zoom, setZoom] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)
  const LENS = 130
  const SCALE = 3
  const PANEL = 420

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Posição da lente (clampada às bordas)
    const lx = Math.max(0, Math.min(rect.width - LENS, x - LENS / 2))
    const ly = Math.max(0, Math.min(rect.height - LENS, y - LENS / 2))
    setLensPos({ x: lx, y: ly })

    // Porcentagem para o background do painel
    const px = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const py = Math.max(0, Math.min(100, (y / rect.height) * 100))
    setBgPos({ x: px, y: py })

    // Posição fixed do painel — à direita do container
    const panelTop = Math.max(0, Math.min(
      window.innerHeight - PANEL,
      rect.top + (y - PANEL / 2)
    ))
    setPanelPos({ top: panelTop, left: rect.right + 12 })
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Container da imagem com lente */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-white overflow-hidden cursor-crosshair"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
      >
        <img src={src} alt={alt} draggable={false} className="w-full h-full object-contain" />

        {/* Lente quadrada */}
        {zoom && (
          <div
            className="absolute border-2 border-green-500 bg-green-500/10 pointer-events-none"
            style={{ width: LENS, height: LENS, left: lensPos.x, top: lensPos.y }}
          />
        )}

        {!zoom && (
          <div className="absolute bottom-2 right-2 bg-black/25 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
            🔍 zoom
          </div>
        )}
      </div>

      {/* Painel ampliado — position fixed para escapar de overflow:hidden */}
      {zoom && (
        <div
          className="fixed bg-white border-2 border-gray-200 shadow-2xl overflow-hidden pointer-events-none"
          style={{
            width: PANEL,
            height: PANEL,
            top: panelPos.top,
            left: panelPos.left,
            zIndex: 9999,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${SCALE * 100}%`,
              backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
    </div>
  )
}
