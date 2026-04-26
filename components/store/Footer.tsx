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
          <p style={{fontSize:'13px', color:'rgba(255,255,255,0.75)', lineHeight:'1.6', margin:0}}>
            {descricao}
          </p>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Comprando</h4>
          <ul className="space-y-2">
            <li><a href="/seguranca" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Segurança</a></li>
            <li><a href="/termos" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Termos de Uso</a></li>
            <li><a href="/trocas-devolucoes" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Trocas e Devoluções</a></li>
            <li><a href="/privacidade" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Privacidade</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Atendimento</h4>
          <ul className="space-y-2">
            <li><a href="/minha-conta" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Minha Conta</a></li>
            <li><a href="/minha-conta/pedidos" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Meus Pedidos</a></li>
            <li><a href="/faq" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>FAQ</a></li>
            <li><a href={'tel:' + telefone.replace(/\D/g,'')} style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>{telefone}</a></li>
            <li>
              <a href="https://wa.me/5547999649647" target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                (47) 99964-9647
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">Institucional</h4>
          <ul className="space-y-2">
            <li><a href="/quem-somos" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Quem Somos</a></li>
            <li><a href="/fale-conosco" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Contato</a></li>
            <li><a href="https://taschibrab2b.com.br" target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Para Empresas</a></li>
            <li><a href="/lancamentos" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', textDecoration:'none'}}>Lançamentos</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'32px 0 28px'}}>
        <p style={{color:'rgba(255,255,255,0.5)', fontSize:'11px', letterSpacing:'2px', fontWeight:700, textAlign:'center', margin:'0 0 24px', textTransform:'uppercase'}}>Compra 100% Segura</p>
        <div style={{display:'flex', justifyContent:'center', gap:'16px'}}>
          {[
            { img: '/logos/SSL SEGURANCA.webp', label: 'SSL Certificado' },
            { img: '/logos/PAGAR.ME.webp',      label: 'Pagamento Seguro' },
            { img: '/logos/CLEAR SALE.webp',    label: 'Antifraude' },
            { img: '/logos/MELHOR ENVIO.webp',  label: 'Entrega Garantida' },
          ].map((selo) => (
            <div key={selo.label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
              <img src={selo.img} alt={selo.label} style={{height:'62px', width:'160px', objectFit:'contain'}} />
              <span style={{color:'rgba(255,255,255,0.75)', fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase'}}>{selo.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'20px 0 0'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', gap:'16px', flexWrap:'wrap'}}>
          <div>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'11px', lineHeight:'1.9', margin:0}}>{razaoSocial} — CNPJ: {cnpj}</p>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'11px', lineHeight:'1.9', margin:0}}>{endereco}</p>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'11px', lineHeight:'1.9', margin:0}}>Taschibra Store {ano} — Todos os direitos reservados</p>
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
          <span style={{color:'rgba(255,255,255,0.75)', fontSize:'11px'}}>© {ano} {razaoSocial} CNPJ {cnpj}</span>
          <div style={{display:'flex', gap:'16px'}}>
            <a href="/privacidade" style={{color:'rgba(255,255,255,0.75)', fontSize:'12px', textDecoration:'none'}}>Política de Privacidade</a>
            <a href="/termos" style={{color:'rgba(255,255,255,0.75)', fontSize:'12px', textDecoration:'none'}}>Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
