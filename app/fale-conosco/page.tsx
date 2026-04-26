import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fale Conosco — Taschibra Store',
  description: 'Entre em contato com a Taschibra Store. WhatsApp, telefone, e-mail ou formulário.',
}

export default function FaleConoscoPage() {
  return (
    <main>
      {/* HERO */}
      <div className="relative overflow-hidden" style={{background:'#0d3d1f', padding:'3rem 2rem 4.5rem', minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-10px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="180" cy="110" r="120" fill="rgba(245,197,24,0.04)"/>
          <circle cx="180" cy="110" r="80" fill="rgba(245,197,24,0.05)"/>
          <circle cx="180" cy="110" r="50" fill="rgba(245,197,24,0.07)"/>
          <g stroke="#f5c518" strokeOpacity="0.18" strokeWidth="1">
            <line x1="180" y1="110" x2="260" y2="20"/><line x1="180" y1="110" x2="260" y2="60"/>
            <line x1="180" y1="110" x2="260" y2="110"/><line x1="180" y1="110" x2="260" y2="160"/>
            <line x1="180" y1="110" x2="260" y2="200"/><line x1="180" y1="110" x2="220" y2="0"/>
            <line x1="180" y1="110" x2="130" y2="0"/><line x1="180" y1="110" x2="100" y2="10"/>
            <line x1="180" y1="110" x2="80" y2="40"/><line x1="180" y1="110" x2="70" y2="80"/>
          </g>
          <ellipse cx="180" cy="96" rx="28" ry="30" fill="rgba(245,197,24,0.12)" stroke="#f5c518" strokeOpacity="0.5" strokeWidth="1.5"/>
          <ellipse cx="180" cy="96" rx="20" ry="21" fill="rgba(245,197,24,0.2)" stroke="#f5c518" strokeOpacity="0.3" strokeWidth="1"/>
          <path d="M168 96 Q174 88 180 96 Q186 104 192 96" stroke="#f5c518" strokeWidth="1.5" fill="none" strokeOpacity="0.9"/>
          <rect x="173" y="123" width="14" height="5" rx="1" fill="rgba(245,197,24,0.4)" stroke="#f5c518" strokeOpacity="0.4" strokeWidth="1"/>
          <rect x="175" y="128" width="10" height="4" rx="1" fill="rgba(245,197,24,0.3)" stroke="#f5c518" strokeOpacity="0.3" strokeWidth="1"/>
          <circle cx="180" cy="96" r="5" fill="rgba(245,197,24,0.6)"/>
          <circle cx="180" cy="96" r="2" fill="#f5c518"/>
          <circle cx="100" cy="40" r="2" fill="rgba(245,197,24,0.4)"/>
          <circle cx="60" cy="100" r="1.5" fill="rgba(245,197,24,0.3)"/>
          <circle cx="110" cy="175" r="2" fill="rgba(245,197,24,0.3)"/>
        </svg>
        <div style={{position:'relative', zIndex:2, maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Atendimento</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>
            Fale com a<br/><span style={{color:'#f5c518'}}>Taschibra Store</span>
          </h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>
            Nossa equipe está pronta para tirar suas dúvidas, resolver problemas e ajudar você a encontrar a solução de iluminação ideal.
          </p>
        </div>
      </div>

      {/* CARDS DE CANAL */}
      <div style={{marginTop:'-28px',padding:'0 1.5rem',position:'relative',zIndex:3}}>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, title:'WhatsApp', info:'(47) 99964-9647', sub:'Seg–Sex 8h–18h', href:'https://wa.me/5547999649647', cta:'Enviar mensagem' },
            { icon: <svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>, title:'Telefone', info:'(47) 3281-7640', sub:'Seg–Sex 8h–18h', href:'tel:4732817640', cta:'Ligar agora' },
            { icon: <svg viewBox="0 0 24 24" fill="#1a6e35"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>, title:'E-mail', info:'taschibra.store', sub:'@taschibra.com.br', href:'mailto:taschibra.store@taschibra.com.br', cta:'Enviar e-mail' },
          ].map((c, i) => (
            <div key={i} className="bg-white border rounded-xl p-4 text-center hover:border-green-600 transition-colors" style={{borderColor:'#e5e7eb'}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2.5" style={{background:'#eaf3de'}}>
                <div className="w-5 h-5">{c.icon}</div>
              </div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">{c.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{c.info}<br/>{c.sub}</p>
              <a href={c.href} className="inline-block mt-2 text-xs font-medium rounded-full px-3 py-1" style={{color:'#1a6e35',border:'0.5px solid #1a6e35',textDecoration:'none'}}>{c.cta}</a>
            </div>
          ))}
        </div>
      </div>

      {/* CORPO */}
      <div className="grid gap-6 p-6" style={{gridTemplateColumns:'1fr 1.4fr'}}>
        <div>
          <h2 className="text-sm font-medium text-gray-800 mb-3 pb-2" style={{borderBottom:'0.5px solid #e5e7eb'}}>Informações</h2>
          <div className="flex items-start gap-2.5 mb-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#1a6e35" style={{flexShrink:0,marginTop:2}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div><p className="text-xs font-medium text-gray-800">Indaial — SC</p><span className="text-xs text-gray-500">Rod. BR-470, KM 65.931, Encano do Norte</span></div>
          </div>
          <div className="flex items-start gap-2.5 mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#1a6e35" style={{flexShrink:0,marginTop:2}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
            <div><p className="text-xs font-medium text-gray-800">Segunda a sexta</p><span className="text-xs text-gray-500">08:00 às 18:00</span></div>
          </div>
          <h2 className="text-sm font-medium text-gray-800 mb-3 pb-2" style={{borderBottom:'0.5px solid #e5e7eb'}}>Horários</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {[['Seg – Sex','08:00–18:00'],['Sábado','08:00–12:00']].map(([d,t])=>(
              <div key={d} className="rounded-lg p-2.5" style={{background:'#f9fafb'}}>
                <p className="text-xs text-gray-500">{d}</p>
                <p className="text-xs font-medium text-gray-800">{t}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-lg p-2.5" style={{background:'#f9fafb'}}>
              <p className="text-xs text-gray-500">Domingo e feriados</p>
              <p className="text-xs font-medium text-gray-800">Fechado</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-800 mb-3 pb-2" style={{borderBottom:'0.5px solid #e5e7eb'}}>Envie uma mensagem</h2>
          <form className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">Nome *</label><input type="text" placeholder="Seu nome" className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg"/></div>
              <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">E-mail *</label><input type="email" placeholder="seu@email.com" className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg"/></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">Telefone</label><input type="tel" placeholder="(47) 99999-9999" className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg"/></div>
              <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">Assunto</label>
                <select className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg">
                  <option>Pedido / entrega</option><option>Dúvida sobre produto</option>
                  <option>Troca ou devolução</option><option>Sugestão / elogio</option><option>Outro</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">Mensagem *</label><textarea placeholder="Como podemos ajudar?" className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg" rows={4}/></div>
            <button type="submit" className="text-white text-sm font-medium py-2.5 rounded-lg" style={{background:'#1a6e35'}}>Enviar mensagem</button>
          </form>
        </div>
      </div>
    </main>
  )
}
