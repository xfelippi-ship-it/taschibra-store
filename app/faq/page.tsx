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
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Perguntas Frequentes</h1>
      <p className="text-gray-500 mb-10">Tire suas dúvidas sobre produtos, pedidos, entrega e pagamentos.</p>

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
    </main>
  )
}
