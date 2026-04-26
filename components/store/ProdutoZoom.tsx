'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  src: string
  alt?: string
  className?: string
}

export default function ProdutoZoom({ src, alt = '', className = '' }: Props) {
  const [zoom, setZoom] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
  const [pct, setPct] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)
  const LENS = 130
  const SCALE = 3
  const PANEL = 420

  useEffect(() => { setMounted(true) }, [])

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setLensPos({
      x: Math.max(0, Math.min(rect.width - LENS, x - LENS / 2)),
      y: Math.max(0, Math.min(rect.height - LENS, y - LENS / 2))
    })
    setPct({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100))
    })
    setPanelPos({
      top: Math.max(8, Math.min(window.innerHeight - PANEL - 8, rect.top + y - PANEL / 2)),
      left: rect.right + 12
    })
  }, [])

  const imgLeft = -(pct.x / 100) * PANEL * (SCALE - 1)
  const imgTop = -(pct.y / 100) * PANEL * (SCALE - 1)

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full bg-white overflow-hidden cursor-crosshair"
        style={{ aspectRatio: '1/1' }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
      >
        <img src={src} alt={alt} draggable={false} className="w-full h-full object-cover" />

        {zoom && (
          <div className="absolute border-2 border-green-500 bg-green-500/10 pointer-events-none"
            style={{ width: LENS, height: LENS, left: lensPos.x, top: lensPos.y }} />
        )}

        {!zoom && (
          <div className="absolute bottom-2 right-2 bg-black/25 text-white text-xs px-2 py-1 rounded-full pointer-events-none select-none">
            🔍 zoom
          </div>
        )}
      </div>

      {mounted && zoom && (
        <div className="fixed bg-white border-2 border-gray-200 shadow-2xl overflow-hidden pointer-events-none"
          style={{ width: PANEL, height: PANEL, top: panelPos.top, left: panelPos.left, zIndex: 9999 }}>
          <img src={src} alt="" draggable={false} className="absolute"
            style={{ width: PANEL * SCALE, height: PANEL * SCALE, maxWidth: 'none', objectFit: 'contain', left: imgLeft, top: imgTop }} />
        </div>
      )}
    </div>
  )
}
