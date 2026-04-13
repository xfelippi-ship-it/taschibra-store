import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getCompanyData() {
  const { data } = await supabase.from('company_settings').select('*').single()
  return data
}

export default async function Footer() {
  const company = await getCompanyData()

  const razaoSocial = company?.razao_social || 'Taschibra S.A.'
  const cnpj        = company?.cnpj         || '83.475.913/0001-91'
  const endereco    = company?.endereco      || 'Rodovia BR 470 KM 65,931, nº 2135 — Encano do Norte, Indaial/SC — CEP 89085-144'
  const telefone    = company?.telefone      || '(47) 3281-7640'

  return (
    <footer className="bg-green-950 text-green-300 mt-16 px-12 pt-14 pb-8">

      {/* Colunas principais */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
        <div>
          <img src="/images/logo.png" alt="Taschibra Store" className="h-10 object-contain mb-3" />
          <p style={{fontSize:'13px', color:'#6aab7a', lineHeight:'1.6', margin:0}}>
            Uma das maiores indústrias de iluminação da América Latina. Sede em Indaial/SC. Mais de 30 anos iluminando o Brasil.
          </p>
        </div>
        {[
          { title: 'Comprando', links: [
            { label: 'Segurança',          href: '/seguranca' },
            { label: 'Termos de Uso',      href: '/termos' },
            { label: 'Trocas e Devoluções',href: '/trocas-devolucoes' },
            { label: 'Privacidade',        href: '/privacidade' },
          ]},
          { title: 'Atendimento', links: [
            { label: 'Minha Conta',  href: '/minha-conta' },
            { label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
            { label: 'FAQ',          href: '/faq' },
            { label: telefone,       href: `tel:${telefone.replace(/\D/g,'')}` },
          ]},
          { title: 'Institucional', links: [
            { label: 'Quem Somos',     href: '/quem-somos' },
            { label: 'Contato',        href: '/fale-conosco' },
            { label: 'Para Empresas',  href: '/fale-conosco' },
            { label: 'Lançamentos',    href: '/lancamentos' },
          ]},
        ].map((col, i) => (
          <div key={i}>
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={l.href} style={{color:'#6aab7a', fontSize:'13px', textDecoration:'none'}}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selos */}
      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'32px 0 28px'}}>
        <p style={{color:'#4a8a5a', fontSize:'11px', letterSpacing:'2px', fontWeight:700, textAlign:'center', margin:'0 0 24px', textTransform:'uppercase'}}>Compra 100% Segura</p>
        <div style={{display:'flex', justifyContent:'center', gap:'16px'}}>
          {[
            { img: '/logos/SSL SEGURANCA.png', label: 'SSL Certificado' },
            { img: '/logos/PAGAR.ME.png',      label: 'Pagamento Seguro' },
            { img: '/logos/CLEAR SALE.png',    label: 'Antifraude' },
            { img: '/logos/MELHOR ENVIO.png',  label: 'Entrega Garantida' },
          ].map((selo) => (
            <div key={selo.label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
              <img src={selo.img} alt={selo.label} style={{height:'62px', width:'160px', objectFit:'contain'}} />
              <span style={{color:'#6aab7a', fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase'}}>{selo.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="max-w-7xl mx-auto" style={{borderTop:'1px solid #1a4a2a', padding:'20px 0 0'}}>

        {/* Links úteis */}
        <div style={{display:'flex', gap:'24px', marginBottom:'16px', flexWrap:'wrap'}}>
          {[
            { label: 'Atendimento',          href: '/fale-conosco' },
            { label: 'Compra Segura',        href: '/seguranca' },
            { label: 'Perguntas Frequentes', href: '/faq' },
            { label: 'Política de Entrega',  href: '/trocas-devolucoes' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>{l.label}</a>
          ))}
          <span style={{color:'#6aab7a', fontSize:'12px'}}>📞 {telefone}</span>
        </div>

        {/* Razão social + bandeiras */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', gap:'16px', flexWrap:'wrap'}}>
          <div>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>{razaoSocial} — CNPJ: {cnpj}</p>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>{endereco}</p>
            <p style={{color:'#6aab7a', fontSize:'11px', lineHeight:'1.9', margin:0}}>Taschibra Store {new Date().getFullYear()} — Todos os direitos reservados</p>
          </div>
          <div style={{display:'flex', gap:'0px', alignItems:'center'}}>
            {[
              { img: '/logos/VISA.png',             alt: 'Visa' },
              { img: '/logos/MASTER.png',           alt: 'Mastercard' },
              { img: '/logos/ELO.png',              alt: 'Elo' },
              { img: '/logos/PIX.png',              alt: 'Pix' },
              { img: '/logos/BOLETO.png',           alt: 'Boleto' },
              { img: '/logos/AMERICAN EXPRESS.png', alt: 'American Express' },
            ].map((b, i, arr) => (
              <img key={b.alt} src={b.img} alt={b.alt} style={{height:'36px', width:'72px', objectFit:'contain', marginRight: i < arr.length - 1 ? '-10px' : '0'}} />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{borderTop:'1px solid #1a4a2a', padding:'16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px'}}>
          <span style={{color:'#6aab7a', fontSize:'11px'}}>© {new Date().getFullYear()} {razaoSocial} &nbsp; CNPJ {cnpj}</span>
          <div style={{display:'flex', gap:'16px'}}>
            <a href="/privacidade" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Política de Privacidade</a>
            <a href="/termos" style={{color:'#6aab7a', fontSize:'12px', textDecoration:'none'}}>Termos de Uso</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
