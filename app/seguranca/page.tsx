import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Compra Segura — Taschibra Store',
  description: 'Saiba como a Taschibra Store protege seus dados e transações com SSL, PagarMe PCI DSS e antifraude ClearSale.',
}
export default function SegurancaPage() {
  return (
    <main>
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'280px',height:'100%',zIndex:1}} viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="190" cy="110" r="130" fill="rgba(245,197,24,0.03)"/><circle cx="190" cy="110" r="90" fill="rgba(245,197,24,0.04)"/><circle cx="190" cy="110" r="55" fill="rgba(245,197,24,0.05)"/>
          <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" fill="none"><path d="M140 20 L160 34 L160 62 L140 76 L120 62 L120 34 Z"/><path d="M200 20 L220 34 L220 62 L200 76 L180 62 L180 34 Z"/><path d="M170 76 L190 90 L190 118 L170 132 L150 118 L150 90 Z"/><path d="M230 76 L250 90 L250 118 L230 132 L210 118 L210 90 Z"/><path d="M140 132 L160 146 L160 174 L140 188 L120 174 L120 146 Z"/><path d="M200 132 L220 146 L220 174 L200 188 L180 174 L180 146 Z"/></g>
          <path d="M190 55 L228 72 L228 110 Q228 148 190 165 Q152 148 152 110 L152 72 Z" fill="rgba(245,197,24,0.1)" stroke="#f5c518" strokeOpacity="0.5" strokeWidth="1.5"/>
          <path d="M190 67 L218 80 L218 110 Q218 138 190 152 Q162 138 162 110 L162 80 Z" fill="rgba(245,197,24,0.08)" stroke="#f5c518" strokeOpacity="0.3" strokeWidth="1"/>
          <rect x="181" y="104" width="18" height="14" rx="2" fill="rgba(245,197,24,0.5)" stroke="#f5c518" strokeWidth="1.2"/>
          <path d="M185 104 L185 99 Q185 93 190 93 Q195 93 195 99 L195 104" fill="none" stroke="#f5c518" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="190" cy="111" r="2.5" fill="#f5c518"/>
          <g stroke="rgba(245,197,24,0.2)" strokeWidth="0.8" strokeDasharray="3,4"><line x1="152" y1="90" x2="100" y2="60"/><line x1="152" y1="110" x2="90" y2="110"/><line x1="152" y1="130" x2="100" y2="160"/><line x1="228" y1="90" x2="265" y2="55"/><line x1="228" y1="110" x2="268" y2="110"/><line x1="228" y1="130" x2="265" y2="165"/></g>
          <circle cx="100" cy="60" r="3" fill="rgba(245,197,24,0.4)"/><circle cx="90" cy="110" r="3" fill="rgba(245,197,24,0.4)"/><circle cx="100" cy="160" r="3" fill="rgba(245,197,24,0.4)"/>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Segurança</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Compre com<br/><span style={{color:'#f5c518'}}>total segurança</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Sua privacidade e seus dados são nossa prioridade. A Taschibra Store usa tecnologia de ponta para proteger cada transação.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            {icon:<svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,title:'Criptografia SSL',text:'Todos os dados transmitidos são protegidos por certificado SSL 256 bits — o mesmo padrão dos maiores bancos do Brasil.'},
            {icon:<svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>,title:'Pagamento seguro',text:'Processado pela PagarMe com certificação PCI DSS. Seus dados de cartão nunca são armazenados nos nossos servidores.'},
            {icon:<svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,title:'Antifraude ClearSale',text:'Monitoramento em tempo real de todas as transações pela maior empresa de antifraude da América Latina.'},
            {icon:<svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,title:'Dados protegidos (LGPD)',text:'Seguimos rigorosamente a Lei Geral de Proteção de Dados. Seus dados são usados apenas para processar seus pedidos.'},
          ].map((c,i)=>(
            <div key={i} className="border rounded-xl p-5" style={{borderColor:'#e5e7eb'}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{background:'#eaf3de'}}><div className="w-5 h-5">{c.icon}</div></div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">{c.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['SSL 256 bits','PCI DSS compliant','ClearSale antifraude','LGPD em conformidade'].map(b=>(
            <span key={b} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{background:'#eaf3de',color:'#1a6e35'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#1a6e35"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              {b}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
