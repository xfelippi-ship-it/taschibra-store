'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatWidget() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return
      const [res1, res2] = await Promise.all([
        supabase.from('site_config' as any).select('value').eq('key', 'chatbot_enabled').single(),
        supabase.from('site_config' as any).select('value').eq('key', 'chatbot_script').single(),
      ])
      const enabled = res1.data as any
      const script = res2.data as any
      if (enabled?.value !== 'true' || !script?.value?.trim()) return
      const container = document.createElement('div')
      container.innerHTML = script.value
      container.querySelectorAll('script').forEach(s => {
        const ns = document.createElement('script') as HTMLScriptElement
        if (s.src) ns.src = s.src
        else ns.textContent = s.textContent
        Array.from(s.attributes).forEach(attr => {
          if (attr.name !== 'src') ns.setAttribute(attr.name, attr.value)
        })
        document.body.appendChild(ns)
      })
      setLoaded(true)
    }
    init()
  }, [])

  return null
}
