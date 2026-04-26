import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos — Taschibra Store',
  description: 'Conheça a Taschibra, fabricante de iluminação LED com fábrica própria em Indaial/SC desde 1991.',
}

export default function QuemSomosPage() {
  return (
    <main>
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="160" cy="100" r="110" fill="rgba(245,197,24,0.03)"/><circle cx="160" cy="100" r="65" fill="rgba(245,197,24,0.04)"/>
          <rect x="115" y="70" width="60" height="80" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="122" y="52" width="10" height="20" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="138" y="58" width="10" height="14" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="154" y="54" width="10" height="18" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <circle cx="127" cy="47" r="4" fill="rgba(255,255,255,0.05)"/><circle cx="130" cy="41" r="3" fill="rgba(255,255,255,0.04)"/>
          <circle cx="143" cy="53" r="3.5" fill="rgba(255,255,255,0.05)"/><circle cx="159" cy="49" r="4" fill="rgba(255,255,255,0.05)"/>
          <rect x="121" y="80" width="12" height="10" rx="1" fill="rgba(245,197,24,0.25)" stroke="rgba(245,197,24,0.3)" strokeWidth="0.5"/>
          <rect x="138" y="80" width="12" height="10" rx="1" fill="rgba(245,197,24,0.2)" stroke="rgba(245,197,24,0.25)" strokeWidth="0.5"/>
          <rect x="155" y="80" width="12" height="10" rx="1" fill="rgba(245,197,24,0.25)" stroke="rgba(245,197,24,0.3)" strokeWidth="0.5"/>
          <rect x="121" y="96" width="12" height="10" rx="1" fill="rgba(245,197,24,0.15)" stroke="rgba(245,197,24,0.2)" strokeWidth="0.5"/>
          <rect x="140" y="118" width="14" height="20" rx="1" fill="rgba(245,197,24,0.2)" stroke="#f5c518" strokeWidth="0.8" strokeOpacity="0.4"/>
          <ellipse cx="145" cy="65" rx="10" ry="12" fill="rgba(245,197,24,0.15)" stroke="#f5c518" strokeWidth="1" strokeOpacity="0.5"/>
          <circle cx="145" cy="65" r="3" fill="#f5c518" fillOpacity="0.6"/>
          <line x1="145" y1="51" x2="145" y2="44" stroke="#f5c518" strokeWidth="1" strokeOpacity="0.4"/>
          <line x1="136" y1="55" x2="131" y2="50" stroke="#f5c518" strokeWidth="1" strokeOpacity="0.35"/>
          <line x1="154" y1="55" x2="159" y2="50" stroke="#f5c518" strokeWidth="1" strokeOpacity="0.35"/>
          <g transform="translate(90,115)"><circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/><circle cx="0" cy="0" r="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><rect x="-16" y="-3" width="6" height="6" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/><rect x="10" y="-3" width="6" height="6" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/><rect x="-3" y="-16" width="6" height="6" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/><rect x="-3" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/></g>
          <line x1="75" y1="150" x2="235" y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <line x1="80" y1="150" x2="80" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
          <circle cx="80" cy="125" r="7" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
          <rect x="90" y="155" width="36" height="16" rx="8" fill="rgba(245,197,24,0.12)" stroke="rgba(245,197,24,0.3)" strokeWidth="0.8"/>
          <text x="108" y="167" textAnchor="middle" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="rgba(245,197,24,0.8)">Indaial/SC</text>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Quem somos</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Fabricante de<br/><span style={{color:'#f5c518'}}>iluminação desde 1991</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Fábrica própria em Indaial/SC, mais de 3.000 produtos e presença em todo o Brasil. Taschibra é referência em iluminação LED.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-3 mb-10">
          {[['30+','Anos de mercado'],['3.000+','SKUs ativos'],['100%','Fábrica própria'],['Brasil','Cobertura nacional']].map(([n,l])=>(
            <div key={l} className="rounded-xl p-4 text-center" style={{background:'#f9fafb',border:'0.5px solid #e5e7eb'}}>
              <p className="text-xl font-medium text-gray-900 mb-1">{n}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <section><h2 className="text-base font-medium text-gray-800 mb-2">Nossa história</h2><p>A Taschibra nasceu em 1991 em Indaial, Santa Catarina, com o propósito de desenvolver produtos de iluminação que combinassem eficiência energética, qualidade e design. Ao longo de mais de três décadas, nos consolidamos como uma das maiores fabricantes de iluminação LED da América Latina.</p></section>
          <section><h2 className="text-base font-medium text-gray-800 mb-2">Nossa fábrica</h2><p>Nossa planta industrial está localizada na Rodovia BR-470, KM 65.931, Encano do Norte, Indaial/SC. São mais de 30.000 m² de área construída com tecnologia de ponta, laboratórios de teste e controle de qualidade rigoroso em cada etapa da produção.</p></section>
          <section><h2 className="text-base font-medium text-gray-800 mb-2">Missão e valores</h2><p>Desenvolver soluções de iluminação que combinem eficiência energética, durabilidade e design, contribuindo para um futuro mais sustentável. Acreditamos que a iluminação transforma ambientes e vidas.</p></section>
          <section><h2 className="text-base font-medium text-gray-800 mb-2">Responsabilidade</h2><p>A Taschibra Store é operada pela Blumenox Iluminação LTDA, CNPJ 02.477.605/0001-01, empresa do grupo Taschibra. A marca Taschibra é de propriedade da ALS Administradora de Bens.</p></section>
        </div>
      </div>
    </main>
  )
}
