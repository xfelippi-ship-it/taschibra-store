'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Footer() {
  const [cfg, setCfg] = useState<Record<string,string>>({})

  useEffect(() => {
    const keys = ['empresa_razao_social','empresa_cnpj','empresa_endereco','empresa_cidade',
      'empresa_estado','empresa_cep','empresa_telefone','empresa_email',
      'empresa_slogan','empresa_descricao','empresa_nome_fantasia']
    ;(supabase.from as any)('site_config').select('key,value').in('key', keys)
      .then(({ data }) => {
        const map: Record<string,string> = {}
        for (const r of (data || [])) map[r.key] = r.value
        setCfg(map)
      })
  }, [])

  const razaoSocial = cfg.empresa_razao_social  || 'Blumenox Iluminação LTDA'
  const cnpj        = cfg.empresa_cnpj          || '02.477.605/0001-01'
  const endereco    = cfg.empresa_endereco      || 'Rodovia BR 470 KM 65,931 nº 2135'
  const cidade      = cfg.empresa_cidade        || 'Indaial'
  const estado      = cfg.empresa_estado        || 'SC'
  const cep         = cfg.empresa_cep           || '89085-144'
  const telefone    = cfg.empresa_telefone      || '(47) 3281-7640'
  const descricao   = cfg.empresa_descricao     || 'Uma das maiores indústrias de iluminação da América Latina. Fábrica própria em Indaial/SC.'
  const ano         = new Date().getFullYear()

  return (
    <footer className="bg-green-950 text-white mt-16 px-12 pt-14 pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
        <div>
          <img src="/images/logo.webp" alt="Taschibra Store" width={200} height={40} className="h-10 object-contain mb-3" />
          <p style={{fontSize:'13px', color:'#6aab7a', lineHeight:'1.6', margin:0}}>
            {descricao}
          </p>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Comprando</h4>
          <ul className="space-y-2">
            <li><a href="/seguranca" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Seguranca</a></li>
            <li><a href="/termos" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Termos de Uso</a></li>
            <li><a href="/trocas-devolucoes" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Trocas e Devolucoes</a></li>
            <li><a href="/privacidade" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Privacidade</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Atendimento</h4>
          <ul className="space-y-2">
            <li><a href="/minha-conta" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Minha Conta</a></li>
            <li><a href="/minha-conta/pedidos" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Meus Pedidos</a></li>
            <li><a href="/faq" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>FAQ</a></li>
            <li><a href={'tel:' + telefone.replace(/\D/g,'')} style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>{telefone}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Institucional</h4>
          <ul className="space-y-2">
            <li><a href="/quem-somos" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Quem Somos</a></li>
            <li><a href="/fale-conosco" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Contato</a></li>
            <li><a href="/fale-conosco" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Para Empresas</a></li>
            <li><a href="/lancamentos" style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>Lancamentos</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'32px 0 28px'}}>
        <p style={{color:'#4a8a5a', fontSize:'11px', letterSpacing:'2px', fontWeight:700, textAlign:'center', margin:'0 0 24px', textTransform:'uppercase'}}>Compra 100% Segura</p>
        <div style={{display:'flex', justifyContent:'center', gap:'16px'}}>
          {[
            { img: '/logos/SSL SEGURANCA.webp', label: 'SSL Certificado' },
            { img: '/logos/PAGAR.ME.webp',      label: 'Pagamento Seguro' },
            { img: '/logos/CLEAR SALE.webp',    label: 'Antifraude' },
            { img: '/logos/MELHOR ENVIO.webp',  label: 'Entrega Garantida' },
          ].map((selo) => (
            <div key={selo.label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
              <img src={selo.img} alt={selo.label} style={{height:'62px', width:'160px', objectFit:'contain'}} />
              <span style={{color:'#6aab7a', fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase'}}>{selo.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'20px 0 0'}}>
        <div style={{display:'flex', gap:'24px', marginBottom:'16px', flexWrap:'wrap'}}>
          <a href="/fale-conosco" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Atendimento</a>
          <a href="/seguranca" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Compra Segura</a>
          <a href="/faq" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Perguntas Frequentes</a>
          <a href="/trocas-devolucoes" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Politica de Entrega</a>
          <span style={{color:'#6aab7a', fontSize:'12px'}}>📞 {telefone}</span>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', gap:'16px', flexWrap:'wrap'}}>
          <div>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>{razaoSocial} — CNPJ: {cnpj}</p>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>{endereco}</p>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>Taschibra Store {ano} — Todos os direitos reservados</p>
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            {[
              { img: '/logos/VISA.webp',             alt: 'Visa' },
              { img: '/logos/MASTER.webp',           alt: 'Mastercard' },
              { img: '/logos/ELO.webp',              alt: 'Elo' },
              { img: '/logos/PIX.webp',              alt: 'Pix' },
              { img: '/logos/BOLETO.webp',           alt: 'Boleto' },
              { img: '/logos/AMERICAN EXPRESS.webp', alt: 'American Express' },
            ].map((b, i, arr) => (
              <img key={b.alt} src={b.img} alt={b.alt}
                style={{height:'36px', width:'72px', objectFit:'contain', marginRight: i < arr.length - 1 ? '-10px' : '0'}} />
            ))}
          </div>
        </div>
        <div style={{borderTop:'1px solid #1a4a2a', padding:'16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px'}}>
          <span style={{color:'#6aab7a', fontSize:'11px'}}>© {ano} {razaoSocial} CNPJ {cnpj}</span>
          <div style={{display:'flex', gap:'16px'}}>
            <a href="/privacidade" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Politica de Privacidade</a>
            <a href="/termos" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
