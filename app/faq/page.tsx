import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes — Taschibra Store',
  description: 'Tire suas dúvidas sobre produtos, pedidos, entrega, pagamento e muito mais.',
}

type FAQ = { id: string; question: string; answer: string; sort_order: number }

export default async function FAQPage() {
  const { data: faqs } = await supabase
    .from('faqs')
    .select('id, question, answer, sort_order')
    .eq('available', true)
    .order('sort_order')

  return (
    <main>
      {/* HERO */}
      <div className="relative overflow-hidden" style={{background:'#0d3d1f',padding:'3rem 2rem 4.5rem',minHeight:'220px'}}>
        <svg style={{position:'absolute',right:'-5px',top:0,bottom:0,width:'260px',height:'100%',zIndex:1}} viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
          <circle cx="160" cy="100" r="110" fill="rgba(245,197,24,0.03)"/>
          <circle cx="160" cy="100" r="65" fill="rgba(245,197,24,0.04)"/>
          {/* Balão de pergunta principal */}
          <rect x="95" y="40" width="90" height="60" rx="12" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2"/>
          <polygon points="110,100 125,100 115,116" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          {/* Ponto de interrogação no balão */}
          <text x="140" y="80" textAnchor="middle" fontFamily="Arial" fontSize="28" fontWeight="bold" fill="rgba(245,197,24,0.7)">?</text>
          {/* Balão de resposta (menor, direita) */}
          <rect x="155" y="90" width="70" height="45" rx="10" fill="rgba(245,197,24,0.1)" stroke="rgba(245,197,24,0.3)" strokeWidth="1"/>
          <polygon points="225,112 238,105 230,125" fill="rgba(245,197,24,0.1)" stroke="rgba(245,197,24,0.3)" strokeWidth="1"/>
          {/* Linhas de texto no balão resposta */}
          <line x1="163" y1="103" x2="217" y2="103" stroke="rgba(245,197,24,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="163" y1="111" x2="217" y2="111" stroke="rgba(245,197,24,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="163" y1="119" x2="200" y2="119" stroke="rgba(245,197,24,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Balão pequeno flutuante */}
          <rect x="75" y="130" width="55" height="36" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <polygon points="95,166 108,166 100,178" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <text x="102" y="153" textAnchor="middle" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="rgba(255,255,255,0.3)">?</text>
          {/* Pontos decorativos */}
          <circle cx="80" cy="55" r="2" fill="rgba(245,197,24,0.35)"/>
          <circle cx="240" cy="70" r="2" fill="rgba(245,197,24,0.25)"/>
          <circle cx="245" cy="150" r="1.5" fill="rgba(245,197,24,0.2)"/>
          <circle cx="70" cy="100" r="1.5" fill="rgba(245,197,24,0.3)"/>
          {/* Linha decorativa */}
          <line x1="60" y1="140" x2="85" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
          <circle cx="60" cy="140" r="2" fill="rgba(255,255,255,0.08)"/>
        </svg>
        <div style={{position:'relative',zIndex:2,maxWidth:'460px'}}>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{background:'rgba(245,197,24,0.15)',border:'0.5px solid rgba(245,197,24,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <span style={{fontSize:'10px',fontWeight:500,color:'#f5c518',letterSpacing:'.04em',textTransform:'uppercase'}}>Perguntas frequentes</span>
          </div>
          <h1 className="font-medium text-white mb-2" style={{fontSize:'28px',lineHeight:1.2}}>Tire suas<br/><span style={{color:'#f5c518'}}>dúvidas</span></h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:'340px'}}>Encontre respostas sobre produtos, pedidos, entrega e pagamentos. Não achou? Fale com a gente.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

      {!faqs || faqs.length === 0 ? (
        <p className="text-gray-400">Nenhuma pergunta cadastrada ainda.</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq: FAQ) => (
            <details key={faq.id} className="group border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                <span className="text-green-600 font-black text-xl group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
              </summary>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      )}
      </div>
    </main>
  )
}
