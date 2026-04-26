import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — Taschibra Store',
  description: 'Leia os termos e condições de uso da Taschibra Store.',
}

export default function TermosPage() {
  const config = null

  return (
    <main>
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="170" cy="100" r="120" fill="rgba(245,197,24,0.03)"/><circle cx="170" cy="100" r="70" fill="rgba(245,197,24,0.04)"/>
          <rect x="120" y="30" width="80" height="105" rx="4" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          <line x1="132" y1="50" x2="188" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="132" y1="60" x2="188" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="132" y1="70" x2="175" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="132" y1="82" x2="188" y2="82" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="132" y1="92" x2="188" y2="92" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="132" y1="114" x2="188" y2="114" stroke="rgba(245,197,24,0.3)" strokeWidth="0.8"/>
          <path d="M132 125 Q142 118 148 125 Q155 132 165 122 Q172 115 178 122" stroke="#f5c518" strokeWidth="1.5" fill="none" strokeOpacity="0.7" strokeLinecap="round"/>
          <rect x="108" y="38" width="80" height="105" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <rect x="96" y="46" width="80" height="105" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <g transform="translate(155,130) rotate(-35)">
            <rect x="-3" y="-18" width="6" height="22" rx="1" fill="rgba(245,197,24,0.5)" stroke="#f5c518" strokeWidth="0.8" strokeOpacity="0.6"/>
            <polygon points="-3,4 3,4 0,10" fill="#f5c518" fillOpacity="0.7"/>
          </g>
          <circle cx="155" cy="145" r="2" fill="#f5c518" fillOpacity="0.8"/>
          <circle cx="90" cy="70" r="2" fill="rgba(245,197,24,0.35)"/>
          <circle cx="220" cy="60" r="2" fill="rgba(245,197,24,0.2)"/>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Termos de uso</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Transparência em<br/><span style={{color:'#f5c518'}}>cada detalhe</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Conheça as regras que governam o uso da Taschibra Store. Acreditamos em relações claras e honestas com nossos clientes.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {config?.content ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: config.content}} />
        ) : (
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <section><h2 className="text-base font-medium text-gray-800 mb-2">1. Aceitação dos Termos</h2><p>Ao acessar e utilizar a Taschibra Store, você concorda com estes Termos de Uso. Caso não concorde, por favor não utilize nossos serviços.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">2. Cadastro e Conta</h2><p>Para realizar compras, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável pela segurança de sua senha e por todas as atividades realizadas em sua conta.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">3. Produtos e Preços</h2><p>Todos os preços são em Reais (R$) e podem ser alterados sem aviso prévio. Nos reservamos o direito de cancelar pedidos em caso de erro de precificação evidente.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">4. Pagamentos</h2><p>Aceitamos cartão de crédito, PIX e boleto bancário. O pagamento é processado pela PagarMe com certificação PCI DSS.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">5. Entrega</h2><p>Os prazos de entrega são estimados e podem variar de acordo com a localização e disponibilidade de estoque. Trabalhamos com os melhores parceiros logísticos.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">6. Propriedade Intelectual</h2><p>Todo o conteúdo deste site — textos, imagens, logos e produtos — é de propriedade da Taschibra/Blumenox Iluminação LTDA e protegido por lei.</p></section>
            <section><h2 className="text-base font-medium text-gray-800 mb-2">7. Contato</h2><p>Para dúvidas sobre estes termos, entre em contato: <a href="mailto:taschibra.store@taschibra.com.br" className="text-green-700">taschibra.store@taschibra.com.br</a></p></section>
          </div>
        )}
      </div>
    </main>
  )
}
