'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatWidget() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      const [{ data: enabled }, { data: script }] = await Promise.all([
        supabase.from('site_config').select('value').eq('key', 'chatbot_enabled').single(),
        supabase.from('site_config').select('value').eq('key', 'chatbot_script').single(),
      ])
      if (enabled?.value !== 'true' || !script?.value?.trim()) return
      const container = document.createElement('div')
      container.innerHTML = script.value
      const scripts = container.querySelectorAll('script')
      scripts.forEach(s => {
        const ns = document.createElement('script')
        if (s.src) ns.src = s.src
        else ns.textContent = s.textContent
        s.getAttributeNames().forEach(attr => {
          if (attr !== 'src') ns.setAttribute(attr, s.getAttribute(attr) || '')
        })
        document.body.appendChild(ns)
      })
      setLoaded(true)
    }
    init()
  }, [])

  return null
}
