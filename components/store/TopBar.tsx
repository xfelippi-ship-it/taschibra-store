'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TopBarData = {
  id: string
  active: boolean
  texto: string
  subtexto?: string
  link?: string
  tipo: 'cor' | 'imagem'
  cor_fundo: string
  cor_texto: string
  imagem_url?: string
}

export default function TopBar() {
  const [data, setData] = useState<TopBarData | null>(null)
  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase
        .from('top_bar')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
      if (rows && rows.length > 0) setData(rows[0])
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return null

  const style = data.tipo === 'imagem' && data.imagem_url
    ? { backgroundImage: `url(${data.imagem_url})`, backgroundSize: 'cover', backgroundPosition: 'center', color: data.cor_texto }
    : { backgroundColor: data.cor_fundo, color: data.cor_texto }

  const content = (
    <div style={style} className="w-full relative flex items-center justify-center gap-3 py-2 px-10 min-h-[36px]">
      {data.texto && (
        <span className="text-sm font-bold text-center">{data.texto}</span>
      )}
      {data.subtexto && (
        <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ backgroundColor: data.cor_texto, color: data.cor_fundo }}>
          {data.subtexto}
        </span>
      )}

    </div>
  )

  return data.link
    ? <a href={data.link} className="block hover:opacity-95 transition-opacity">{content}</a>
    : <div>{content}</div>
}
