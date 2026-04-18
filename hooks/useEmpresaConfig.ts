import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

let _cache: Record<string,string> | null = null

export function useEmpresaConfig() {
  const [cfg, setCfg] = useState<Record<string,string>>(_cache || {})

  useEffect(() => {
    if (_cache) { setCfg(_cache); return }
    ;(supabase.from as any)('site_config').select('key,value')
      .in('key', ['empresa_parcelas','empresa_razao_social','empresa_cnpj','empresa_telefone','empresa_descricao'])
      .then(({ data }: any) => {
        const map: Record<string,string> = {}
        for (const r of (data || [])) map[r.key] = r.value
        _cache = map
        setCfg(map)
      })
  }, [])

  return {
    parcelas: parseInt(cfg.empresa_parcelas || '10'),
    razaoSocial: cfg.empresa_razao_social || 'Blumenox Iluminação LTDA',
    cnpj: cfg.empresa_cnpj || '02.477.605/0001-01',
    telefone: cfg.empresa_telefone || '(47) 3281-7640',
    descricao: cfg.empresa_descricao || '',
  }
}
