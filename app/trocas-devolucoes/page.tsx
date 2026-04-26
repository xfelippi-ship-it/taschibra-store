import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trocas e Devoluções — Taschibra Store',
  description: 'Saiba como funciona nossa política de trocas e devoluções. 7 dias para solicitar, processo 100% online.',
}

export default function TrocasPage() {
  return (
    <main>
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="160" cy="100" r="110" fill="rgba(245,197,24,0.03)"/><circle cx="160" cy="100" r="65" fill="rgba(245,197,24,0.04)"/>
          <g transform="translate(85,75)"><rect x="0" y="15" width="45" height="38" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><rect x="0" y="8" width="45" height="10" rx="2" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><line x1="22" y1="8" x2="22" y2="18" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><rect x="8" y="22" width="12" height="12" rx="2" fill="rgba(245,197,24,0.3)" stroke="#f5c518" strokeWidth="0.8" strokeOpacity="0.5"/><rect x="25" y="25" width="12" height="8" rx="1" fill="rgba(245,197,24,0.2)" stroke="#f5c518" strokeWidth="0.8" strokeOpacity="0.4"/></g>
          <g transform="translate(165,75)"><rect x="-5" y="15" width="45" height="38" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><rect x="-5" y="8" width="45" height="10" rx="2" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><line x1="17" y1="8" x2="17" y2="18" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><path d="M5 37 L12 44 L30 28" stroke="#f5c518" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8"/></g>
          <g transform="translate(160,100)"><path d="M-22,-8 Q0,-28 22,-8" stroke="#f5c518" strokeWidth="2" fill="none" strokeOpacity="0.7" strokeLinecap="round"/><polygon points="18,-16 26,-6 14,-8" fill="#f5c518" fillOpacity="0.7"/><path d="M22,8 Q0,28 -22,8" stroke="#f5c518" strokeWidth="2" fill="none" strokeOpacity="0.7" strokeLinecap="round"/><polygon points="-18,16 -26,6 -14,8" fill="#f5c518" fillOpacity="0.7"/></g>
          <circle cx="160" cy="100" r="16" fill="rgba(13,61,31,0.9)" stroke="#f5c518" strokeWidth="1.2" strokeOpacity="0.6"/>
          <text x="160" y="97" textAnchor="middle" fontFamily="Arial" fontSize="8" fontWeight="bold" fill="#f5c518">7</text>
          <text x="160" y="106" textAnchor="middle" fontFamily="Arial" fontSize="6" fill="rgba(245,197,24,0.7)">DIAS</text>
          <line x1="100" y1="155" x2="220" y2="155" stroke="rgba(245,197,24,0.15)" strokeWidth="1" strokeDasharray="4,4"/>
          <circle cx="75" cy="70" r="2" fill="rgba(245,197,24,0.3)"/><circle cx="235" cy="70" r="2" fill="rgba(245,197,24,0.2)"/>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Trocas e devoluções</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Troca simples,<br/><span style={{color:'#f5c518'}}>sem burocracia</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Recebeu diferente do esperado? Você tem 7 dias para solicitar troca ou devolução. Processo 100% online, sem complicação.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-sm text-gray-600 leading-relaxed">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['7 dias','Para solicitar após recebimento'],['100% online','Sem precisar ir a nenhum local'],['Grátis','Sem custo de frete para troca']].map(([t,s])=>(
            <div key={t} className="rounded-xl p-4 text-center" style={{background:'#f0fdf4',border:'0.5px solid #bbf7d0'}}>
              <p className="text-base font-medium text-green-800 mb-1">{t}</p>
              <p className="text-xs text-green-700">{s}</p>
            </div>
          ))}
        </div>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">Como solicitar</h2><ol className="list-decimal list-inside space-y-2"><li>Acesse <strong>Minha Conta → Meus Pedidos</strong></li><li>Selecione o pedido e clique em <strong>Solicitar Troca/Devolução</strong></li><li>Informe o motivo e envie fotos do produto (se necessário)</li><li>Aguarde a aprovação em até 2 dias úteis</li><li>Embale o produto e aguarde a coleta ou envie pelos Correios</li></ol></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">Condições</h2><ul className="list-disc list-inside space-y-1"><li>Produto sem uso, na embalagem original</li><li>Solicitação dentro do prazo de 7 dias corridos após o recebimento</li><li>Nota fiscal disponível</li><li>Produtos com defeito de fábrica: prazo de 90 dias</li></ul></section>
        <section><h2 className="text-base font-medium text-gray-800 mb-2">Reembolso</h2><p>Após aprovação e recebimento do produto devolvido, o reembolso é processado em até 10 dias úteis no mesmo meio de pagamento utilizado.</p></section>
        <div className="rounded-xl p-4 flex items-center gap-3" style={{background:'#f0fdf4',border:'0.5px solid #bbf7d0'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="#1a6e35"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div><p className="text-xs font-medium text-green-800">Precisa de ajuda?</p><p className="text-xs text-green-700">Fale com nosso suporte pelo <a href="https://wa.me/5547999649647" className="underline">WhatsApp (47) 99964-9647</a> ou <a href="/fale-conosco" className="underline">formulário de contato</a>.</p></div></div>
      </div>
    </main>
  )
}
