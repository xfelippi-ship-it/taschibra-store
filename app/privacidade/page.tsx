import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Taschibra Store',
  description: 'Saiba como a Taschibra Store coleta, usa e protege seus dados pessoais em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
  return (
    <main>
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="160" cy="100" r="110" fill="rgba(245,197,24,0.03)"/>
          <circle cx="160" cy="100" r="65" fill="rgba(245,197,24,0.04)"/>
          <ellipse cx="160" cy="95" rx="50" ry="32" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2"/>
          <circle cx="160" cy="95" r="20" fill="rgba(245,197,24,0.12)" stroke="#f5c518" strokeWidth="1.2" strokeOpacity="0.5"/>
          <circle cx="160" cy="95" r="10" fill="rgba(245,197,24,0.2)" stroke="#f5c518" strokeWidth="1" strokeOpacity="0.6"/>
          <circle cx="160" cy="95" r="4" fill="#f5c518" fillOpacity="0.7"/>
          <circle cx="155" cy="90" r="2.5" fill="rgba(255,255,255,0.4)"/>
          <rect x="151" y="98" width="18" height="14" rx="2" fill="rgba(13,61,31,0.85)" stroke="#f5c518" strokeWidth="1.2" strokeOpacity="0.8"/>
          <path d="M155 98 L155 94 Q155 89 160 89 Q165 89 165 94 L165 98" fill="none" stroke="#f5c518" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.8"/>
          <circle cx="160" cy="105" r="2" fill="#f5c518" fillOpacity="0.8"/>
          <g fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth="0.8">
            <rect x="85" y="65" width="24" height="16" rx="2"/>
            <rect x="85" y="115" width="24" height="16" rx="2"/>
            <rect x="220" y="68" width="14" height="10" rx="2"/>
            <rect x="222" y="115" width="14" height="10" rx="2"/>
          </g>
          <line x1="88" y1="71" x2="106" y2="71" stroke="rgba(245,197,24,0.3)" strokeWidth="1"/>
          <line x1="88" y1="75" x2="100" y2="75" stroke="rgba(245,197,24,0.2)" strokeWidth="1"/>
          <line x1="88" y1="121" x2="106" y2="121" stroke="rgba(245,197,24,0.3)" strokeWidth="1"/>
          <line x1="109" y1="73" x2="118" y2="85" stroke="rgba(245,197,24,0.15)" strokeWidth="0.8" strokeDasharray="3,3"/>
          <line x1="109" y1="123" x2="118" y2="115" stroke="rgba(245,197,24,0.15)" strokeWidth="0.8" strokeDasharray="3,3"/>
          <line x1="220" y1="73" x2="212" y2="82" stroke="rgba(245,197,24,0.12)" strokeWidth="0.8" strokeDasharray="3,3"/>
          <circle cx="75" cy="100" r="2" fill="rgba(245,197,24,0.3)"/>
          <rect x="130" y="145" width="60" height="18" rx="9" fill="rgba(245,197,24,0.12)" stroke="rgba(245,197,24,0.35)" strokeWidth="0.8"/>
          <text x="160" y="158" textAnchor="middle" fontFamily="Arial" fontSize="8" fill="rgba(245,197,24,0.8)" fontWeight="bold">LGPD</text>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Privacidade</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Seus dados sob<br/><span style={{color:'#f5c518'}}>nossa proteção</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Seguimos a LGPD à risca. Seus dados pessoais são usados exclusivamente para processar pedidos e melhorar sua experiência.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6 text-sm text-gray-600 leading-relaxed">
        <div className="rounded-xl p-4 mb-6" style={{background:'#f0fdf4',border:'0.5px solid #bbf7d0'}}>
          <p className="text-xs font-medium text-green-800 mb-1">Operadora de dados</p>
          <p className="text-xs text-green-700">Blumenox Iluminação LTDA — CNPJ 02.477.605/0001-01. A marca Taschibra é de propriedade da ALS Administradora de Bens.</p>
        </div>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">1. Dados coletados</h2><p>Coletamos apenas os dados necessários para processar seus pedidos: nome, e-mail, CPF, endereço de entrega, telefone e dados de pagamento (processados diretamente pela PagarMe — nunca armazenamos dados de cartão).</p></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">2. Finalidade do uso</h2><p>Seus dados são utilizados exclusivamente para: processar e entregar seus pedidos, comunicações relacionadas à compra, melhoria da experiência de navegação e cumprimento de obrigações legais.</p></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">3. Compartilhamento</h2><p>Compartilhamos dados apenas com parceiros essenciais para a operação: transportadoras (para entrega), PagarMe (pagamentos), ClearSale (antifraude) e MelhorEnvio (cálculo de frete). Nunca vendemos seus dados.</p></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">4. Seus direitos (LGPD)</h2><ul className="list-disc list-inside space-y-1"><li>Confirmar a existência de tratamento de dados</li><li>Acessar seus dados</li><li>Corrigir dados incompletos ou incorretos</li><li>Solicitar a exclusão de dados</li><li>Revogar consentimento a qualquer momento</li></ul></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">5. Cookies</h2><p>Utilizamos cookies essenciais para funcionamento do site e cookies analíticos para melhorar a experiência. Você pode gerenciar suas preferências a qualquer momento pelo banner de cookies.</p></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">6. Exclusão de conta</h2><p>Para solicitar a exclusão de sua conta e dados, acesse <strong>Minha Conta → Preferências → Excluir conta</strong> ou entre em contato pelo e-mail <a href="mailto:taschibra.store@taschibra.com.br" className="text-green-700">taschibra.store@taschibra.com.br</a>.</p></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">7. Contato DPO</h2><p>Para exercer seus direitos ou tirar dúvidas sobre privacidade: <a href="mailto:taschibra.store@taschibra.com.br" className="text-green-700">taschibra.store@taschibra.com.br</a></p></section>
      </div>
    </main>
  )
}
